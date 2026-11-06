  // Mission 3 — 결제 테스트 (모의 PG)
  const test = require("node:test");
  const assert = require("node:assert/strict");
  const { createFakeClock, seedOrder } = require("../src/testkit");
  const { payOrder } = require("../src/payment");
  const { expectRejectCode, fresh } = require("./_helpers");

  function createPg(responses) {
    const pg = {
      charges: [],
      async charge(request) {
        pg.charges.push({ ...request });
        const response = responses.shift();
        if (response instanceof Error) throw response;
        return response;
      },
    };
    return pg;
  }

  function createControlledPg(responses) {
    let releaseResponse;
    const responseGate = new Promise((resolve) => {
      releaseResponse = resolve;
    });
    const pg = {
      charges: [],
      async charge(request) {
        const responseIndex = pg.charges.length;
        pg.charges.push({ ...request });
        const response = await responseGate;
        const result = responses[responseIndex];
        if (result instanceof Error) throw result;
        return result;
      },
    };
    return { pg, release: () => releaseResponse() };
  }

  test("[TC-P-01] 성공 시 전체 반환값과 PG 요청을 확인한다", async () => {
    const ctx = fresh({
      pg: createPg([{ ok: true, txId: "TX-P-001" }]),
      clock: createFakeClock("2026-10-28T09:00:00.000Z"),
    });
    const order = seedOrder(ctx, { items: [["P1", 2]] });
    const result = await payOrder(ctx, "u1", order.id);
    const paymentRecord = ctx.store.payments.get(order.id)[0];

    assert.deepEqual(result, {
      order: { ...order, status: "PAID" },
      payment: structuredClone(paymentRecord),
      alreadyPaid: false,
    });
    assert.equal(result.order.status, "PAID");
    assert.equal(paymentRecord.status, "SUCCEEDED");
    assert.equal(paymentRecord.orderId, order.id);
    assert.equal(paymentRecord.amount, 30000);
    assert.equal(paymentRecord.txId, "TX-P-001");
    assert.equal(Object.hasOwn(paymentRecord, "paidAt"), true);

    assert.equal(ctx.pg.charges.length, 1);
    assert.equal(ctx.pg.charges[0].orderId, order.id);
    assert.equal(ctx.pg.charges[0].amount, 30000);
    assert.equal(typeof ctx.pg.charges[0].idempotencyKey, "string");
    assert.notEqual(ctx.pg.charges[0].idempotencyKey, "");

    assert.equal(Object.hasOwn(paymentRecord, "card"), false);
    assert.equal(Object.hasOwn(paymentRecord, "number"), false);
    assert.equal(Object.hasOwn(paymentRecord, "method"), false);
  });

  test("[TC-P-02] 성공 시 결제 기록은 1건이고 attempt는 1이다", async () => {
    const ctx = fresh({
      pg: createPg([{ ok: true, txId: "TX-P-001" }]),
      clock: createFakeClock("2026-10-28T09:00:00.000Z"),
    });
    const order = seedOrder(ctx, { items: [["P1", 2]] });

    await payOrder(ctx, "u1", order.id);

    const payments = ctx.store.payments.get(order.id);
    assert.equal(payments.length, 1);
    assert.equal(payments[0].attempt, 1);
  });

  test("[TC-P-03] 반환 객체를 변경해도 저장된 주문과 결제 기록은 바뀌지 않는다", async () => {
    const ctx = fresh({
      pg: createPg([{ ok: true, txId: "TX-P-001" }]),
      clock: createFakeClock("2026-10-28T09:00:00.000Z"),
    });
    const order = seedOrder(ctx, { items: [["P1", 2]] });
    const result = await payOrder(ctx, "u1", order.id);

    result.order.status = "CANCELED";
    result.order.items[0].quantity = 99;
    result.payment.status = "FAILED";
    result.payment.amount = 1;

    const storedOrder = ctx.store.orders.get(order.id);
    const storedPayment = ctx.store.payments.get(order.id)[0];
    assert.equal(storedOrder.status, "PAID");
    assert.equal(storedOrder.items[0].quantity, 2);
    assert.equal(storedPayment.status, "SUCCEEDED");
    assert.equal(storedPayment.amount, 30000);
    assert.equal(storedPayment.txId, "TX-P-001");
  });

  // 잡는 결함: PG 결제 실패(ok: false)를 성공으로 처리하는 결함
  test("[TC-P-04] PG 실패 시 오류 사유와 결제대기 상태 및 실패 기록을 확인한다", async () => {
    const ctx = fresh({
      pg: createPg([{ ok: false, reason: "LIMIT_EXCEEDED" }]),
      clock: createFakeClock("2026-10-28T09:00:00.000Z"),
    });
    const order = seedOrder(ctx, { items: [["P1", 2]] });

    const error = await expectRejectCode(
      () => payOrder(ctx, "u1", order.id),
      "PAYMENT_FAILED",
    );

    assert.equal(error.details.reason, "LIMIT_EXCEEDED");
    assert.equal(ctx.store.orders.get(order.id).status, "PENDING_PAYMENT");

    const payments = ctx.store.payments.get(order.id);
    assert.equal(payments.length, 1);
    assert.equal(payments[0].status, "FAILED");
    assert.equal(payments[0].failureReason, "LIMIT_EXCEEDED");
    assert.equal(payments[0].attempt, 1);
    assert.equal(ctx.pg.charges.length, 1);
  });

  // 잡는 결함: PG 예외(시간 초과)를 성공으로 처리하거나 예외 메시지를 그대로 노출하는 결함
  test("[TC-P-05] PG 시간 초과 시 PG_ERROR와 결제대기 상태 및 실패 기록을 확인한다", async () => {
    const ctx = fresh({
      pg: createPg([new Error("PG_TIMEOUT")]),
      clock: createFakeClock("2026-10-28T09:00:00.000Z"),
    });
    const order = seedOrder(ctx, { items: [["P1", 2]] });

    const error = await expectRejectCode(
      () => payOrder(ctx, "u1", order.id),
      "PAYMENT_FAILED",
    );

    assert.equal(error.details.reason, "PG_ERROR");
    assert.notEqual(error.details.reason, "PG_TIMEOUT");
    assert.equal(ctx.store.orders.get(order.id).status, "PENDING_PAYMENT");

    const payments = ctx.store.payments.get(order.id);
    assert.equal(payments.length, 1);
    assert.equal(payments[0].status, "FAILED");
    assert.equal(payments[0].failureReason, "PG_ERROR");
    assert.equal(payments[0].attempt, 1);
    assert.equal(ctx.pg.charges.length, 1);
  });

  test("[TC-P-06] PG 실패 후 재시도하면 성공하고 시도별 기록을 남긴다", async () => {
    const ctx = fresh({
      pg: createPg([
        { ok: false, reason: "LIMIT_EXCEEDED" },
        { ok: true, txId: "TX-P-RETRY" },
      ]),
      clock: createFakeClock("2026-10-28T09:00:00.000Z"),
    });
    const order = seedOrder(ctx, { items: [["P1", 2]] });

    const firstError = await expectRejectCode(
      () => payOrder(ctx, "u1", order.id),
      "PAYMENT_FAILED",
    );
    assert.equal(firstError.details.reason, "LIMIT_EXCEEDED");

    const secondResult = await payOrder(ctx, "u1", order.id);
    const payments = ctx.store.payments.get(order.id);

    assert.equal(payments.length, 2);
    assert.equal(payments[0].status, "FAILED");
    assert.equal(payments[0].attempt, 1);
    assert.equal(payments[0].failureReason, "LIMIT_EXCEEDED");
    assert.equal(payments[1].status, "SUCCEEDED");
    assert.equal(payments[1].attempt, 2);
    assert.equal(payments[1].txId, "TX-P-RETRY");
    assert.equal(secondResult.alreadyPaid, false);
    assert.equal(ctx.store.orders.get(order.id).status, "PAID");

    assert.equal(ctx.pg.charges.length, 2);
    assert.equal(ctx.pg.charges[0].orderId, order.id);
    assert.equal(ctx.pg.charges[1].orderId, order.id);
    assert.equal(ctx.pg.charges[0].amount, 30000);
    assert.equal(ctx.pg.charges[1].amount, 30000);
    assert.notEqual(ctx.pg.charges[0].idempotencyKey, "");
    assert.notEqual(ctx.pg.charges[1].idempotencyKey, "");
    assert.notEqual(
      ctx.pg.charges[0].idempotencyKey,
      ctx.pg.charges[1].idempotencyKey,
    );
  });

  test("[TC-P-07] PG 시간 초과 후 재시도하면 성공하고 시도별 기록을 남긴다", async () => {
    const ctx = fresh({
      pg: createPg([
        new Error("PG_TIMEOUT"),
        { ok: true, txId: "TX-P-RETRY" },
      ]),
      clock: createFakeClock("2026-10-28T09:00:00.000Z"),
    });
    const order = seedOrder(ctx, { items: [["P1", 2]] });

    const firstError = await expectRejectCode(
      () => payOrder(ctx, "u1", order.id),
      "PAYMENT_FAILED",
    );
    assert.equal(firstError.details.reason, "PG_ERROR");

    const secondResult = await payOrder(ctx, "u1", order.id);
    const payments = ctx.store.payments.get(order.id);

    assert.equal(payments.length, 2);
    assert.equal(payments[0].status, "FAILED");
    assert.equal(payments[0].attempt, 1);
    assert.equal(payments[0].failureReason, "PG_ERROR");
    assert.equal(payments[1].status, "SUCCEEDED");
    assert.equal(payments[1].attempt, 2);
    assert.equal(payments[1].txId, "TX-P-RETRY");
    assert.equal(secondResult.alreadyPaid, false);
    assert.equal(ctx.store.orders.get(order.id).status, "PAID");

    assert.equal(ctx.pg.charges.length, 2);
    assert.equal(ctx.pg.charges[0].orderId, order.id);
    assert.equal(ctx.pg.charges[1].orderId, order.id);
    assert.equal(ctx.pg.charges[0].amount, 30000);
    assert.equal(ctx.pg.charges[1].amount, 30000);
    assert.notEqual(ctx.pg.charges[0].idempotencyKey, "");
    assert.notEqual(ctx.pg.charges[1].idempotencyKey, "");
    assert.notEqual(
      ctx.pg.charges[0].idempotencyKey,
      ctx.pg.charges[1].idempotencyKey,
    );
  });

  test("[TC-P-08] 실패 후 다시 시도해 성공하면 attempt와 멱등성 키가 증가한다", async () => {
    const ctx = fresh({
      pg: createPg([
        { ok: false, reason: "LIMIT_EXCEEDED" },
        { ok: false, reason: "LIMIT_EXCEEDED" },
        { ok: true, txId: "TX-P-RETRY" },
      ]),
      clock: createFakeClock("2026-10-28T09:00:00.000Z"),
    });
    const order = seedOrder(ctx, { items: [["P1", 2]] });

    await expectRejectCode(
      () => payOrder(ctx, "u1", order.id),
      "PAYMENT_FAILED",
    );
    await expectRejectCode(
      () => payOrder(ctx, "u1", order.id),
      "PAYMENT_FAILED",
    );
    await payOrder(ctx, "u1", order.id);

    const payments = ctx.store.payments.get(order.id);
    assert.equal(payments.length, 3);
    assert.equal(payments[0].status, "FAILED");
    assert.equal(payments[0].attempt, 1);
    assert.equal(payments[1].status, "FAILED");
    assert.equal(payments[1].attempt, 2);
    assert.equal(payments[2].status, "SUCCEEDED");
    assert.equal(payments[2].attempt, 3);
    assert.equal(ctx.store.orders.get(order.id).status, "PAID");

    assert.equal(ctx.pg.charges.length, 3);
    assert.notEqual(ctx.pg.charges[0].idempotencyKey, "");
    assert.notEqual(ctx.pg.charges[1].idempotencyKey, "");
    assert.notEqual(ctx.pg.charges[2].idempotencyKey, "");
    assert.notEqual(
      ctx.pg.charges[0].idempotencyKey,
      ctx.pg.charges[1].idempotencyKey,
    );
    assert.notEqual(
      ctx.pg.charges[0].idempotencyKey,
      ctx.pg.charges[2].idempotencyKey,
    );
    assert.notEqual(
      ctx.pg.charges[1].idempotencyKey,
      ctx.pg.charges[2].idempotencyKey,
    );
  });

  // "기존 결과"는 첫 성공 호출의 order와 payment에 alreadyPaid: true를 붙인 결과로 해석한다.
  test("[TC-P-09] 이미 결제된 주문은 첫 성공 결과를 반환하고 PG를 다시 호출하지 않는다", async () => {
    const ctx = fresh({
      pg: createPg([{ ok: true, txId: "TX-P-001" }]),
      clock: createFakeClock("2026-10-28T09:00:00.000Z"),
    });
    const order = seedOrder(ctx, { items: [["P1", 2]] });

    const firstResult = await payOrder(ctx, "u1", order.id);
    const secondResult = await payOrder(ctx, "u1", order.id);
    const payments = ctx.store.payments.get(order.id);

    assert.deepEqual(secondResult.order, firstResult.order);
    assert.deepEqual(secondResult.payment, firstResult.payment);
    assert.equal(secondResult.alreadyPaid, true);
    assert.equal(secondResult.order.status, "PAID");
    assert.equal(secondResult.payment.status, "SUCCEEDED");
    assert.equal(secondResult.payment.attempt, 1);
    assert.equal(ctx.pg.charges.length, 1);
    assert.equal(payments.length, 1);
    assert.equal(ctx.store.orders.get(order.id).status, "PAID");
  });

  test("[TC-P-10] 실패 후 성공한 주문을 다시 결제하면 성공 결과를 반환하고 기록을 늘리지 않는다", async () => {
    const ctx = fresh({
      pg: createPg([
        { ok: false, reason: "LIMIT_EXCEEDED" },
        { ok: true, txId: "TX-P-RETRY" },
      ]),
      clock: createFakeClock("2026-10-28T09:00:00.000Z"),
    });
    const order = seedOrder(ctx, { items: [["P1", 2]] });

    const firstError = await expectRejectCode(
      () => payOrder(ctx, "u1", order.id),
      "PAYMENT_FAILED",
    );
    assert.equal(firstError.details.reason, "LIMIT_EXCEEDED");

    const successfulResult = await payOrder(ctx, "u1", order.id);
    const repeatedResult = await payOrder(ctx, "u1", order.id);
    const payments = ctx.store.payments.get(order.id);

    assert.deepEqual(repeatedResult.order, successfulResult.order);
    assert.deepEqual(repeatedResult.payment, successfulResult.payment);
    assert.equal(repeatedResult.alreadyPaid, true);
    assert.equal(repeatedResult.order.status, "PAID");
    assert.equal(repeatedResult.payment.status, "SUCCEEDED");
    assert.equal(repeatedResult.payment.attempt, 2);
    assert.equal(ctx.pg.charges.length, 2);
    assert.equal(payments.length, 2);
    assert.equal(payments[0].status, "FAILED");
    assert.equal(payments[0].attempt, 1);
    assert.equal(payments[1].status, "SUCCEEDED");
    assert.equal(payments[1].attempt, 2);
    assert.equal(ctx.store.orders.get(order.id).status, "PAID");
  });

  test("[TC-P-11] 이미 결제된 주문 반환값을 변경해도 저장소는 바뀌지 않는다", async () => {
    const ctx = fresh({
      pg: createPg([{ ok: true, txId: "TX-P-001" }]),
      clock: createFakeClock("2026-10-28T09:00:00.000Z"),
    });
    const order = seedOrder(ctx, { items: [["P1", 2]] });

    await payOrder(ctx, "u1", order.id);
    const result = await payOrder(ctx, "u1", order.id);
    assert.equal(result.alreadyPaid, true);

    result.order.status = "CANCELED";
    result.order.items[0].quantity = 99;
    result.payment.status = "FAILED";

    const storedPayments = ctx.store.payments.get(order.id);
    assert.equal(ctx.store.orders.get(order.id).status, "PAID");
    assert.equal(ctx.store.orders.get(order.id).items[0].quantity, 2);
    assert.equal(storedPayments.length, 1);
    assert.equal(storedPayments[0].status, "SUCCEEDED");
    assert.equal(ctx.pg.charges.length, 1);
  });

  // 팀 가정(규칙 3, API_CONTRACT.md 111행에 직접 적혀 있지 않음): 결제 기록은 없고 주문 상태는 CANCELED로 유지한다.
  // 잡는 결함: 결제대기가 아닌(취소된) 주문의 결제를 허용하는 결함
  test("[TC-P-12] 취소된 주문은 결제를 거부하고 PG와 결제 기록을 만들지 않는다", async () => {
    const ctx = fresh({
      pg: createPg([{ ok: true, txId: "TX-P-CANCELED" }]),
      clock: createFakeClock("2026-10-28T09:00:00.000Z"),
    });
    const order = seedOrder(ctx, {
      items: [["P1", 2]],
      status: "CANCELED",
    });

    await expectRejectCode(
      () => payOrder(ctx, "u1", order.id),
      "INVALID_STATE",
    );

    assert.equal(ctx.pg.charges.length, 0);
    assert.equal((ctx.store.payments.get(order.id) ?? []).length, 0);
    assert.equal(ctx.store.orders.get(order.id).status, "CANCELED");
  });

  // API_CONTRACT.md 12, 15, 109행: 오류 코드를 확인한다. 팀 가정(109행에 직접 명시되지 않음): PG 미호출, 결제 기록 없음, 주문 상태 유지.
  test("[TC-P-13] 다른 사용자의 주문은 결제를 거부한다", async () => {
    const ctx = fresh({
      pg: createPg([{ ok: true, txId: "TX-P-013" }]),
      clock: createFakeClock("2026-10-28T09:00:00.000Z"),
    });
    const order = seedOrder(ctx, { userId: "u1", items: [["P1", 2]] });

    await expectRejectCode(
      () => payOrder(ctx, "u2", order.id),
      "NOT_FOUND",
    );

    assert.equal(ctx.pg.charges.length, 0);
    assert.equal((ctx.store.payments.get(order.id) ?? []).length, 0);
    assert.equal(ctx.store.orders.get(order.id).status, "PENDING_PAYMENT");
  });

  // API_CONTRACT.md 12, 24행: 없는 주문은 NOT_FOUND다. 팀 가정(24행에 직접 명시되지 않음): PG 미호출 및 결제 기록 없음.
  test("[TC-P-14] 존재하지 않는 주문 ID의 결제를 거부한다", async () => {
    const ctx = fresh({
      pg: createPg([{ ok: true, txId: "TX-P-014" }]),
      clock: createFakeClock("2026-10-28T09:00:00.000Z"),
    });
    const orderId = "ORD-9999";

    await expectRejectCode(
      () => payOrder(ctx, "u1", orderId),
      "NOT_FOUND",
    );

    assert.equal(ctx.pg.charges.length, 0);
    assert.equal((ctx.store.payments.get(orderId) ?? []).length, 0);
  });

  // 팀 가정: 동시 요청 한 묶음의 결제 기록은 한 건이다. setImmediate로 두 번째 호출이 진행 중 확인 지점에 도달할 기회를 준 뒤 PG를 풀어 동시 요청을 만든다.
  // 잡는 결함: 같은 주문의 동시 결제 요청이 진행 중 요청을 공유하지 않고 PG를 다시 호출하는 결함
  test("[TC-P-15] 같은 주문 동시 결제 성공은 PG를 한 번만 호출한다", async () => {
    const controlledPg = createControlledPg([
      { ok: true, txId: "TX-P-015-A" },
      { ok: true, txId: "TX-P-015-B" },
    ]);
    const ctx = fresh({
      pg: controlledPg.pg,
      clock: createFakeClock("2026-10-28T09:00:00.000Z"),
    });
    const order = seedOrder(ctx, { items: [["P1", 2]] });

    const firstCall = payOrder(ctx, "u1", order.id);
    const secondCall = payOrder(ctx, "u1", order.id);
    const settledCalls = Promise.allSettled([firstCall, secondCall]);
    await new Promise((resolve) => setImmediate(resolve));
    controlledPg.release();
    await settledCalls;

    assert.equal(ctx.pg.charges.length, 1);
    assert.equal(ctx.store.orders.get(order.id).status, "PAID");
    const payments = ctx.store.payments.get(order.id);
    assert.equal(payments.length, 1);
    assert.equal(payments[0].status, "SUCCEEDED");
  });

  // 팀 가정: 동시 요청 한 묶음의 실패 결제 기록은 한 건이다. setImmediate로 두 번째 호출이 진행 중 확인 지점에 도달할 기회를 준 뒤 PG를 풀어 동시 요청을 만든다.
  // 잡는 결함: 같은 주문의 동시 결제 요청이 진행 중 요청을 공유하지 않고 PG를 다시 호출하는 결함
  test("[TC-P-16] 같은 주문 동시 결제 실패는 두 호출에 같은 오류를 돌려준다", async () => {
    const controlledPg = createControlledPg([
      { ok: false, reason: "LIMIT_EXCEEDED" },
      { ok: false, reason: "INSUFFICIENT_FUNDS" },
    ]);
    const ctx = fresh({
      pg: controlledPg.pg,
      clock: createFakeClock("2026-10-28T09:00:00.000Z"),
    });
    const order = seedOrder(ctx, { items: [["P1", 2]] });

    const firstCall = payOrder(ctx, "u1", order.id);
    const secondCall = payOrder(ctx, "u1", order.id);
    const settledCalls = Promise.allSettled([firstCall, secondCall]);
    await new Promise((resolve) => setImmediate(resolve));
    controlledPg.release();
    const [firstResult, secondResult] = await settledCalls;

    assert.equal(firstResult.status, "rejected");
    assert.equal(secondResult.status, "rejected");
    assert.equal(firstResult.reason.code, "PAYMENT_FAILED");
    assert.equal(secondResult.reason.code, "PAYMENT_FAILED");
    assert.equal(firstResult.reason.details.reason, "LIMIT_EXCEEDED");
    assert.equal(
      secondResult.reason.details.reason,
      firstResult.reason.details.reason,
    );

    assert.equal(ctx.pg.charges.length, 1);
    assert.equal(ctx.store.orders.get(order.id).status, "PENDING_PAYMENT");
    const payments = ctx.store.payments.get(order.id);
    assert.equal(payments.length, 1);
    assert.equal(payments[0].status, "FAILED");
    assert.equal(payments[0].failureReason, "LIMIT_EXCEEDED");
  });

  // 팀 가정: fresh() 픽스처의 주문 합계는 계약서에 고정되어 있지 않고, 각 주문에 결제 기록 1건을 기대한다.
  test("[TC-P-17] 서로 다른 주문의 동시 결제는 각각 한 번 성공한다", async () => {
    const controlledPg = createControlledPg([
      { ok: true, txId: "TX-P-017-A" },
      { ok: true, txId: "TX-P-017-B" },
    ]);
    const ctx = fresh({
      pg: controlledPg.pg,
      clock: createFakeClock("2026-10-28T09:00:00.000Z"),
    });
    const orderA = seedOrder(ctx, { userId: "u1", items: [["P1", 2]] });
    const orderB = seedOrder(ctx, { userId: "u1", items: [["P2", 1]] });

    const firstCall = payOrder(ctx, "u1", orderA.id);
    const secondCall = payOrder(ctx, "u1", orderB.id);
    const settledCalls = Promise.allSettled([firstCall, secondCall]);
    await new Promise((resolve) => setImmediate(resolve));
    try {
      assert.equal(controlledPg.pg.charges.length, 2);
    } finally {
      controlledPg.release();
    }
    const [firstResult, secondResult] = await settledCalls;

    assert.equal(firstResult.status, "fulfilled");
    assert.equal(secondResult.status, "fulfilled");
    assert.equal(ctx.pg.charges.length, 2);
    assert.equal(ctx.pg.charges[0].orderId, orderA.id);
    assert.equal(ctx.pg.charges[0].amount, 30000);
    assert.equal(ctx.pg.charges[1].orderId, orderB.id);
    assert.equal(ctx.pg.charges[1].amount, 59000);
    assert.equal(ctx.store.orders.get(orderA.id).status, "PAID");
    assert.equal(ctx.store.orders.get(orderB.id).status, "PAID");

    const paymentsA = ctx.store.payments.get(orderA.id);
    const paymentsB = ctx.store.payments.get(orderB.id);
    assert.equal(paymentsA.length, 1);
    assert.equal(paymentsA[0].status, "SUCCEEDED");
    assert.equal(paymentsB.length, 1);
    assert.equal(paymentsB[0].status, "SUCCEEDED");
  });

  // 팀 가정: fresh() 픽스처의 주문 합계는 계약서에 고정되어 있지 않고, 각 주문에 결제 기록 1건을 기대한다.
  test("[TC-P-18] 한 주문의 결제 실패는 다른 주문의 성공에 영향을 주지 않는다", async () => {
    const controlledPg = createControlledPg([
      { ok: false, reason: "LIMIT_EXCEEDED" },
      { ok: true, txId: "TX-P-018-B" },
    ]);
    const ctx = fresh({
      pg: controlledPg.pg,
      clock: createFakeClock("2026-10-28T09:00:00.000Z"),
    });
    const orderA = seedOrder(ctx, { userId: "u1", items: [["P1", 2]] });
    const orderB = seedOrder(ctx, { userId: "u1", items: [["P2", 1]] });

    const firstCall = payOrder(ctx, "u1", orderA.id);
    const secondCall = payOrder(ctx, "u1", orderB.id);
    const settledCalls = Promise.allSettled([firstCall, secondCall]);
    await new Promise((resolve) => setImmediate(resolve));
    try {
      assert.equal(controlledPg.pg.charges.length, 2);
    } finally {
      controlledPg.release();
    }
    const [firstResult, secondResult] = await settledCalls;

    assert.equal(firstResult.status, "rejected");
    assert.equal(firstResult.reason.code, "PAYMENT_FAILED");
    assert.equal(firstResult.reason.details.reason, "LIMIT_EXCEEDED");
    assert.equal(secondResult.status, "fulfilled");
    assert.equal(ctx.pg.charges.length, 2);
    assert.equal(ctx.pg.charges[0].orderId, orderA.id);
    assert.equal(ctx.pg.charges[0].amount, 30000);
    assert.equal(ctx.pg.charges[1].orderId, orderB.id);
    assert.equal(ctx.pg.charges[1].amount, 59000);
    assert.equal(ctx.store.orders.get(orderA.id).status, "PENDING_PAYMENT");
    assert.equal(ctx.store.orders.get(orderB.id).status, "PAID");

    const paymentsA = ctx.store.payments.get(orderA.id);
    const paymentsB = ctx.store.payments.get(orderB.id);
    assert.equal(paymentsA.length, 1);
    assert.equal(paymentsA[0].status, "FAILED");
    assert.equal(paymentsA[0].failureReason, "LIMIT_EXCEEDED");
    assert.equal(paymentsB.length, 1);
    assert.equal(paymentsB[0].status, "SUCCEEDED");
  });
