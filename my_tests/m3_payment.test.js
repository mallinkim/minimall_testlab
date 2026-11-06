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

  test.todo("[TC-P-12] TODO: 취소된 주문 · 남의 주문");
  test.todo("[TC-P-13] TODO: 동시 요청(Promise.all) — PG 요청은 한 번");
