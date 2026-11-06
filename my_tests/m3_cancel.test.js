// Mission 3 — 취소 · 환불 테스트 (모의 PG: failNextRefund / timeoutNextRefund / refunds)
const test = require("node:test");
const assert = require("node:assert/strict");
const { createFakeClock, seedOrder } = require("../src/testkit");
const { cancelOrder } = require("../src/cancel");
const { expectRejectCode, fresh } = require("./_helpers");

function createImmediateRefundPg(responses) {
  const pg = {
    refunds: [],
    async refund(request) {
      pg.refunds.push({ ...request });
      const response = responses.shift();
      if (response instanceof Error) throw response;
      return response;
    },
  };
  return pg;
}

function createControlledRefundPg(response) {
  let releaseResponse;
  const responseGate = new Promise((resolve) => {
    releaseResponse = resolve;
  });
  const pg = {
    refunds: [],
    async refund(request) {
      pg.refunds.push({ ...request });
      await responseGate;
      return response;
    },
  };
  return { pg, release: () => releaseResponse() };
}

test("[TC-X-01] 결제 전 주문을 취소하면 PG 호출 없이 CANCELED 가 되고 재고가 복원된다", async () => {
  const ctx = fresh();
  const o = seedOrder(ctx, { items: [["P1", 3]] }); // 재고 10 -> 7
  const r = await cancelOrder(ctx, "u1", o.id);
  assert.equal(r.order.status, "CANCELED");
  assert.equal(ctx.store.products.get("P1").stock, 10);
  assert.equal(ctx.pg.refunds.length, 0);
});

// 계약 근거: API_CONTRACT.md 규칙 4 (124, 130-131), SRS US-10 (54).
test("[TC-X-02] 결제된 주문을 취소하면 환불 성공 후 주문과 재고가 복원된다", async () => {
  const ctx = fresh({
    pg: createImmediateRefundPg([{ ok: true, refundId: "RF-X-02" }]),
    clock: createFakeClock("2026-10-28T09:00:00.000Z"),
  });
  const stockBeforeOrder = ctx.store.products.get("P1").stock;
  const order = seedOrder(ctx, { items: [["P1", 2]], status: "PAID" });
  const stockAfterOrder = ctx.store.products.get("P1").stock;
  const payment = ctx.store.payments.get(order.id)[0];

  assert.equal(stockBeforeOrder, 10);
  assert.equal(stockAfterOrder, 8);
  assert.equal(typeof payment.txId, "string");
  assert.notEqual(payment.txId, "");
  assert.equal(payment.amount, 30000);

  const result = await cancelOrder(ctx, "u1", order.id);
  const storedOrder = ctx.store.orders.get(order.id);
  const storedPayment = ctx.store.payments.get(order.id)[0];

  assert.equal(ctx.pg.refunds.length, 1);
  assert.equal(ctx.pg.refunds[0].amount, payment.amount);
  assert.equal(ctx.pg.refunds[0].amount, 30000);
  assert.equal(ctx.pg.refunds[0].txId, payment.txId);
  assert.equal(storedPayment.status, "REFUNDED");
  assert.equal(storedPayment.refund.status, "SUCCEEDED");
  assert.equal(storedPayment.refund.refundId, "RF-X-02");
  // 팀 가정: 계약은 refund.at의 형식을 정하지 않으므로 존재 여부만 확인한다.
  assert.equal(Object.hasOwn(storedPayment.refund, "at"), true);
  assert.equal(storedOrder.status, "CANCELED");
  assert.equal(ctx.store.products.get("P1").stock, 10);
  assert.deepEqual(Object.keys(result), ["order"]);
  assert.equal(result.order.status, "CANCELED");
});

test("[TC-X-03] 반환된 주문을 바꿔도 저장된 주문은 바뀌지 않는다", async () => {
  const ctx = fresh({
    pg: createImmediateRefundPg([{ ok: true, refundId: "RF-X-03" }]),
    clock: createFakeClock("2026-10-28T09:00:00.000Z"),
  });
  const order = seedOrder(ctx, { items: [["P1", 2]], status: "PAID" });
  const result = await cancelOrder(ctx, "u1", order.id);

  result.order.status = "PENDING_PAYMENT";
  result.order.items[0].quantity = 99;

  const storedOrder = ctx.store.orders.get(order.id);
  assert.equal(storedOrder.status, "CANCELED");
  assert.equal(storedOrder.items[0].quantity, 2);
});

// 계약 근거: API_CONTRACT.md 규칙 4 (124, 132), SRS US-10 (57).
test("[TC-X-04] 환불 실패 시 오류와 PAID 상태 및 미복원 재고를 확인한다", async () => {
  const ctx = fresh({
    pg: createImmediateRefundPg([
      { ok: false, reason: "REFUND_REJECTED" },
      { ok: true, refundId: "RF-X-04-UNEXPECTED" },
    ]),
    clock: createFakeClock("2026-10-28T09:00:00.000Z"),
  });
  const order = seedOrder(ctx, { items: [["P1", 2]], status: "PAID" });
  const payment = ctx.store.payments.get(order.id)[0];

  assert.equal(typeof payment.txId, "string");
  assert.notEqual(payment.txId, "");
  assert.equal(payment.amount, 30000);
  assert.equal(ctx.store.products.get("P1").stock, 8);

  const error = await expectRejectCode(
    () => cancelOrder(ctx, "u1", order.id),
    "REFUND_FAILED",
  );
  const storedOrder = ctx.store.orders.get(order.id);
  const storedPayment = ctx.store.payments.get(order.id)[0];

  assert.equal(error.details.reason, "REFUND_REJECTED");
  assert.equal(ctx.pg.refunds.length, 1);
  assert.equal(ctx.pg.refunds[0].amount, payment.amount);
  assert.equal(ctx.pg.refunds[0].amount, 30000);
  assert.equal(ctx.pg.refunds[0].txId, payment.txId);
  assert.equal(storedPayment.refund.status, "FAILED");
  assert.equal(storedPayment.refund.reason, "REFUND_REJECTED");
  // 팀 가정: 계약은 refund.at의 형식을 정하지 않으므로 존재 여부만 확인한다.
  assert.equal(Object.hasOwn(storedPayment.refund, "at"), true);
  assert.equal(storedOrder.status, "PAID");
  assert.equal(ctx.store.products.get("P1").stock, 8);
  // 팀 가정: 실패 규칙은 결제 status를 명시적으로 바꾸지 않는다고 본다.
  assert.notEqual(storedPayment.status, "REFUNDED");
});

// 계약 근거: API_CONTRACT.md 규칙 4 (124, 131-132), SRS US-10 (57).
test("[TC-X-05] 환불 실패 뒤 재시도 성공 시 주문·결제·재고가 성공 상태가 된다", async () => {
  const ctx = fresh({
    pg: createImmediateRefundPg([
      { ok: false, reason: "REFUND_REJECTED" },
      { ok: true, refundId: "RF-X-05" },
    ]),
    clock: createFakeClock("2026-10-28T09:00:00.000Z"),
  });
  const order = seedOrder(ctx, { items: [["P1", 2]], status: "PAID" });
  const payment = ctx.store.payments.get(order.id)[0];

  assert.equal(typeof payment.txId, "string");
  assert.notEqual(payment.txId, "");
  assert.equal(payment.amount, 30000);
  assert.equal(ctx.store.products.get("P1").stock, 8);

  const firstError = await expectRejectCode(
    () => cancelOrder(ctx, "u1", order.id),
    "REFUND_FAILED",
  );
  assert.equal(firstError.details.reason, "REFUND_REJECTED");
  assert.equal(ctx.store.orders.get(order.id).status, "PAID");
  assert.equal(ctx.store.products.get("P1").stock, 8);

  const result = await cancelOrder(ctx, "u1", order.id);
  const storedOrder = ctx.store.orders.get(order.id);
  const storedPayment = ctx.store.payments.get(order.id)[0];

  assert.equal(ctx.pg.refunds.length, 2);
  for (const request of ctx.pg.refunds) {
    assert.equal(request.amount, payment.amount);
    assert.equal(request.amount, 30000);
    assert.equal(request.txId, payment.txId);
  }
  assert.equal(storedOrder.status, "CANCELED");
  assert.equal(storedPayment.status, "REFUNDED");
  assert.equal(storedPayment.refund.status, "SUCCEEDED");
  assert.equal(storedPayment.refund.refundId, "RF-X-05");
  // 팀 가정: 계약은 refund.at의 형식을 정하지 않으므로 존재 여부만 확인한다.
  assert.equal(Object.hasOwn(storedPayment.refund, "at"), true);
  // 팀 가정: 재시도 성공 결과가 refund를 대체해 이전 실패 reason은 남지 않는다.
  assert.equal(Object.hasOwn(storedPayment.refund, "reason"), false);
  assert.equal(ctx.store.products.get("P1").stock, 10);
  assert.equal(result.order.status, "CANCELED");
});

// 계약 근거: API_CONTRACT.md 규칙 4 (124, 132), SRS US-10 (57).
// 잡는 결함: 환불 예외를 성공으로 처리하거나 reason을 PG_ERROR로 고정하지 않는 결함
test("[TC-X-06] 환불 시간 초과 시 PG_ERROR와 실패 상태 및 미복원 재고를 확인한다", async () => {
  const ctx = fresh({
    pg: createImmediateRefundPg([
      new Error("PG_TIMEOUT"),
      { ok: true, refundId: "RF-X-06-UNEXPECTED" },
    ]),
    clock: createFakeClock("2026-10-28T09:00:00.000Z"),
  });
  const stockBeforeOrder = ctx.store.products.get("P1").stock;
  const order = seedOrder(ctx, { items: [["P1", 2]], status: "PAID" });
  const stockAfterOrder = ctx.store.products.get("P1").stock;
  const payment = ctx.store.payments.get(order.id)[0];

  assert.equal(stockBeforeOrder, 10);
  assert.equal(stockAfterOrder, 8);
  assert.equal(typeof payment.txId, "string");
  assert.notEqual(payment.txId, "");
  assert.equal(payment.amount, 30000);

  const error = await expectRejectCode(
    () => cancelOrder(ctx, "u1", order.id),
    "REFUND_FAILED",
  );
  const storedOrder = ctx.store.orders.get(order.id);
  const storedPayment = ctx.store.payments.get(order.id)[0];

  assert.equal(error.details.reason, "PG_ERROR");
  assert.notEqual(error.details.reason, "PG_TIMEOUT");
  assert.equal(ctx.pg.refunds.length, 1);
  assert.equal(ctx.pg.refunds[0].amount, payment.amount);
  assert.equal(ctx.pg.refunds[0].amount, 30000);
  assert.equal(ctx.pg.refunds[0].txId, payment.txId);
  assert.equal(storedPayment.refund.status, "FAILED");
  // 팀 가정: 계약은 예외 시 refund.reason의 구체적인 값을 정하지 않는다.
  assert.equal(storedPayment.refund.reason, "PG_ERROR");
  // 팀 가정: 계약은 refund.at의 형식을 정하지 않으므로 존재 여부만 확인한다.
  assert.equal(Object.hasOwn(storedPayment.refund, "at"), true);
  assert.equal(storedOrder.status, "PAID");
  assert.equal(ctx.store.products.get("P1").stock, 8);
  // 팀 가정: 실패 규칙은 결제 status를 명시적으로 바꾸지 않는다고 본다.
  assert.notEqual(storedPayment.status, "REFUNDED");
});

// 계약 근거: docs/API_CONTRACT.md §4 규칙 2 (128), 상태 전이표 PREPARING (96).
test("[TC-X-07a] PREPARING 주문 취소는 거부되고 주문·결제·재고를 유지한다", async () => {
  const ctx = fresh({
    pg: createImmediateRefundPg([
      { ok: true, refundId: "RF-X-07A-UNEXPECTED" },
    ]),
    clock: createFakeClock("2026-10-28T09:00:00.000Z"),
  });
  const order = seedOrder(ctx, { items: [["P1", 2]], status: "PREPARING" });
  const stockBeforeCancel = ctx.store.products.get("P1").stock;
  const payment = ctx.store.payments.get(order.id)[0];
  const paymentStatusBefore = payment.status;

  assert.equal(stockBeforeCancel, 8);
  assert.equal(Object.hasOwn(payment, "refund"), false);

  await expectRejectCode(
    () => cancelOrder(ctx, "u1", order.id),
    "INVALID_STATE",
  );

  const storedOrder = ctx.store.orders.get(order.id);
  const storedPayment = ctx.store.payments.get(order.id)[0];
  assert.equal(ctx.pg.refunds.length, 0);
  assert.equal(storedOrder.status, "PREPARING");
  assert.equal(ctx.store.products.get("P1").stock, stockBeforeCancel);
  // 팀 가정: 계약은 INVALID_STATE 시 결제 기록의 불변을 명시하지 않는다.
  assert.equal(storedPayment.status, paymentStatusBefore);
  assert.equal(Object.hasOwn(storedPayment, "refund"), false);
});

// 계약 근거: docs/API_CONTRACT.md §4 규칙 2 (128), 상태 전이표 SHIPPING (97).
// SRS 근거: docs/SRS_諛쒖톸.md 56줄, "예외: '배송중' 상태의 주문을 취소하려 하면 취소가 거부되고 취소할 수 없는 이유가 안내된다."
test("[TC-X-07b] SHIPPING 주문 취소는 거부되고 주문·결제·재고를 유지한다", async () => {
  const ctx = fresh({
    pg: createImmediateRefundPg([
      { ok: true, refundId: "RF-X-07B-UNEXPECTED" },
    ]),
    clock: createFakeClock("2026-10-28T09:00:00.000Z"),
  });
  const order = seedOrder(ctx, { items: [["P1", 2]], status: "SHIPPING" });
  const stockBeforeCancel = ctx.store.products.get("P1").stock;
  const payment = ctx.store.payments.get(order.id)[0];
  const paymentStatusBefore = payment.status;

  assert.equal(stockBeforeCancel, 8);
  assert.equal(Object.hasOwn(payment, "refund"), false);

  await expectRejectCode(
    () => cancelOrder(ctx, "u1", order.id),
    "INVALID_STATE",
  );

  const storedOrder = ctx.store.orders.get(order.id);
  const storedPayment = ctx.store.payments.get(order.id)[0];
  assert.equal(ctx.pg.refunds.length, 0);
  assert.equal(storedOrder.status, "SHIPPING");
  assert.equal(ctx.store.products.get("P1").stock, stockBeforeCancel);
  // 팀 가정: 계약은 INVALID_STATE 시 결제 기록의 불변을 명시하지 않는다.
  assert.equal(storedPayment.status, paymentStatusBefore);
  assert.equal(Object.hasOwn(storedPayment, "refund"), false);
});

// 계약 근거: docs/API_CONTRACT.md §4 규칙 2 (128), 상태 전이표 DELIVERED (98).
test("[TC-X-07c] DELIVERED 주문 취소는 거부되고 주문·결제·재고를 유지한다", async () => {
  const ctx = fresh({
    pg: createImmediateRefundPg([
      { ok: true, refundId: "RF-X-07C-UNEXPECTED" },
    ]),
    clock: createFakeClock("2026-10-28T09:00:00.000Z"),
  });
  const order = seedOrder(ctx, { items: [["P1", 2]], status: "DELIVERED" });
  const stockBeforeCancel = ctx.store.products.get("P1").stock;
  const payment = ctx.store.payments.get(order.id)[0];
  const paymentStatusBefore = payment.status;

  assert.equal(stockBeforeCancel, 8);
  assert.equal(Object.hasOwn(payment, "refund"), false);

  await expectRejectCode(
    () => cancelOrder(ctx, "u1", order.id),
    "INVALID_STATE",
  );

  const storedOrder = ctx.store.orders.get(order.id);
  const storedPayment = ctx.store.payments.get(order.id)[0];
  assert.equal(ctx.pg.refunds.length, 0);
  assert.equal(storedOrder.status, "DELIVERED");
  assert.equal(ctx.store.products.get("P1").stock, stockBeforeCancel);
  // 팀 가정: 계약은 INVALID_STATE 시 결제 기록의 불변을 명시하지 않는다.
  assert.equal(storedPayment.status, paymentStatusBefore);
  assert.equal(Object.hasOwn(storedPayment, "refund"), false);
});

// 계약 근거: docs/API_CONTRACT.md §4 규칙 2 (128), 상태 전이표 CANCELED (98).
test("[TC-X-07d] CANCELED 주문 재취소는 거부되고 주문·재고를 유지한다", async () => {
  const ctx = fresh({
    pg: createImmediateRefundPg([
      { ok: true, refundId: "RF-X-07D-UNEXPECTED" },
    ]),
    clock: createFakeClock("2026-10-28T09:00:00.000Z"),
  });
  const order = seedOrder(ctx, { items: [["P1", 2]] });
  const firstResult = await cancelOrder(ctx, "u1", order.id);
  const orderAfterFirstCancel = ctx.store.orders.get(order.id);

  assert.equal(firstResult.order.status, "CANCELED");
  assert.equal(orderAfterFirstCancel.status, "CANCELED");
  assert.equal(ctx.store.products.get("P1").stock, 10);
  assert.equal(ctx.pg.refunds.length, 0);

  const stockBeforeSecondCancel = ctx.store.products.get("P1").stock;
  assert.equal(stockBeforeSecondCancel, 10);

  await expectRejectCode(
    () => cancelOrder(ctx, "u1", order.id),
    "INVALID_STATE",
  );

  const storedOrder = ctx.store.orders.get(order.id);
  assert.equal(ctx.pg.refunds.length, 0);
  assert.equal(storedOrder.status, "CANCELED");
  assert.equal(ctx.store.products.get("P1").stock, stockBeforeSecondCancel);
});

// 팀 가정: 계약은 남의 주문이면서 취소 불가 상태인 경우 검사 우선순위를 정하지 않아 테스트하지 않는다.
// 계약 근거: API_CONTRACT.md 공통 규칙 (12, 15, 24), §4 규칙 1 (127).
test("[TC-X-08a] 남의 PENDING_PAYMENT 주문 취소는 NOT_FOUND이고 상태를 바꾸지 않는다", async () => {
  const ctx = fresh({
    pg: createImmediateRefundPg([
      { ok: true, refundId: "RF-X-08A-UNEXPECTED" },
    ]),
    clock: createFakeClock("2026-10-28T09:00:00.000Z"),
  });
  const order = seedOrder(ctx, {
    userId: "owner",
    status: "PENDING_PAYMENT",
    items: [["P1", 2]],
  });
  const ordersBefore = structuredClone(ctx.store.orders);
  const paymentsBefore = structuredClone(ctx.store.payments);
  const stockBefore = ctx.store.products.get("P1").stock;

  assert.equal(order.status, "PENDING_PAYMENT");
  assert.equal(stockBefore, 8);

  await expectRejectCode(
    () => cancelOrder(ctx, "intruder", order.id),
    "NOT_FOUND",
  );

  // 팀 가정: 계약은 권한 거부 시 주문·결제 저장 방식과 부수 상태 불변을 따로 규정하지 않는다.
  assert.equal(ctx.pg.refunds.length, 0);
  assert.deepEqual(ctx.store.orders, ordersBefore);
  assert.deepEqual(ctx.store.payments, paymentsBefore);
  assert.equal(ctx.store.products.get("P1").stock, stockBefore);
});

// 계약 근거: API_CONTRACT.md 공통 규칙 (12, 15, 24), §4 규칙 1 (127).
test("[TC-X-08b] 남의 PAID 주문 취소는 NOT_FOUND이고 결제 기록을 바꾸지 않는다", async () => {
  const ctx = fresh({
    pg: createImmediateRefundPg([
      { ok: true, refundId: "RF-X-08B-UNEXPECTED" },
    ]),
    clock: createFakeClock("2026-10-28T09:00:00.000Z"),
  });
  const order = seedOrder(ctx, {
    userId: "owner",
    status: "PAID",
    items: [["P1", 2]],
  });
  const ordersBefore = structuredClone(ctx.store.orders);
  const paymentsBefore = structuredClone(ctx.store.payments);
  const paymentBefore = structuredClone(ctx.store.payments.get(order.id));
  const stockBefore = ctx.store.products.get("P1").stock;

  assert.equal(order.status, "PAID");
  assert.equal(stockBefore, 8);
  assert.equal(Object.hasOwn(paymentBefore[0], "refund"), false);

  await expectRejectCode(
    () => cancelOrder(ctx, "intruder", order.id),
    "NOT_FOUND",
  );

  const paymentAfter = ctx.store.payments.get(order.id);
  // 팀 가정: 계약은 권한 거부 시 주문·결제 저장 방식과 부수 상태 불변을 따로 규정하지 않는다.
  assert.equal(ctx.pg.refunds.length, 0);
  assert.deepEqual(ctx.store.orders, ordersBefore);
  assert.deepEqual(ctx.store.payments, paymentsBefore);
  assert.equal(ctx.store.orders.get(order.id).status, "PAID");
  assert.equal(ctx.store.products.get("P1").stock, 8);
  assert.equal(Object.hasOwn(paymentAfter[0], "refund"), false);
});

// 계약 근거: API_CONTRACT.md 공통 규칙 (12, 24).
test("[TC-X-08c] 없는 주문 취소는 NOT_FOUND이고 저장소 상태를 바꾸지 않는다", async () => {
  const ctx = fresh({
    pg: createImmediateRefundPg([
      { ok: true, refundId: "RF-X-08C-UNEXPECTED" },
    ]),
    clock: createFakeClock("2026-10-28T09:00:00.000Z"),
  });
  const orderId = "ORD-9999";

  assert.equal(ctx.store.orders.has(orderId), false);
  const ordersBefore = structuredClone(ctx.store.orders);
  const paymentsBefore = structuredClone(ctx.store.payments);
  const stockBefore = ctx.store.products.get("P1").stock;

  await expectRejectCode(
    () => cancelOrder(ctx, "u1", orderId),
    "NOT_FOUND",
  );

  // 팀 가정: 계약은 없는 주문 거부 시 전체 저장소와 재고 불변을 따로 규정하지 않는다.
  assert.equal(ctx.pg.refunds.length, 0);
  assert.deepEqual(ctx.store.orders, ordersBefore);
  assert.deepEqual(ctx.store.payments, paymentsBefore);
  assert.equal(ctx.store.products.get("P1").stock, stockBefore);
});

// 계약 근거: API_CONTRACT.md §4 환불 PG 설명 (124), 규칙 3-4 (130-131), 규칙 5 (133), 공통 규칙 (12).
// 팀 가정: 각 호출은 성공(CANCELED) 또는 INVALID_STATE로 끝나며, 적어도 한 호출은 성공한다.
// 잡는 결함: 동시 취소가 환불을 중복 호출하거나 재고를 두 번 복원하는 결함
test("[TC-X-09a] 같은 PAID 주문 동시 취소는 환불과 재고 복원을 한 번만 한다", async () => {
  const controlledPg = createControlledRefundPg({
    ok: true,
    refundId: "RF-X-09A",
  });
  const ctx = fresh({
    pg: controlledPg.pg,
    clock: createFakeClock("2026-10-28T09:00:00.000Z"),
  });
  const stockBeforeOrder = ctx.store.products.get("P1").stock;
  const order = seedOrder(ctx, { items: [["P1", 2]], status: "PAID" });
  const payment = ctx.store.payments.get(order.id)[0];

  assert.equal(stockBeforeOrder, 10);
  assert.equal(ctx.store.products.get("P1").stock, 8);

  const firstCall = cancelOrder(ctx, "u1", order.id);
  const secondCall = cancelOrder(ctx, "u1", order.id);
  const settledCallsPromise = Promise.allSettled([firstCall, secondCall]);
  let settledCalls;
  try {
    await new Promise((resolve) => setImmediate(resolve));
    assert.equal(ctx.pg.refunds.length, 1);
  } finally {
    controlledPg.release();
    settledCalls = await settledCallsPromise;
  }

  assert.equal(ctx.pg.refunds.length, 1);
  assert.equal(ctx.pg.refunds[0].amount, 30000);
  assert.equal(ctx.pg.refunds[0].amount, payment.amount);
  assert.equal(ctx.pg.refunds[0].txId, payment.txId);

  const fulfilledCalls = settledCalls.filter((result) => result.status === "fulfilled");
  assert.equal(fulfilledCalls.length >= 1, true);
  for (const result of settledCalls) {
    if (result.status === "fulfilled") {
      assert.equal(result.value.order.status, "CANCELED");
    } else {
      assert.equal(result.reason.code, "INVALID_STATE");
    }
  }

  assert.equal(ctx.store.orders.get(order.id).status, "CANCELED");
  // 취소 전 8개, 한 번 복원하면 10개이며 두 번 복원하면 12개다.
  assert.equal(ctx.store.products.get("P1").stock, 10);
  const storedPayment = ctx.store.payments.get(order.id)[0];
  assert.equal(storedPayment.status, "REFUNDED");
  assert.equal(storedPayment.refund.status, "SUCCEEDED");
});

// 계약 근거: API_CONTRACT.md §4 규칙 3 (129), 규칙 5 (133), 공통 규칙 (12).
// 팀 가정: 각 호출은 성공(CANCELED) 또는 INVALID_STATE로 끝나며, 적어도 한 호출은 성공한다.
// 잡는 결함: 동시 PENDING_PAYMENT 취소가 재고를 두 번 복원하는 결함
test("[TC-X-09b] 같은 PENDING_PAYMENT 주문 동시 취소는 재고를 한 번만 복원한다", async () => {
  const ctx = fresh({
    pg: createImmediateRefundPg([
      { ok: true, refundId: "RF-X-09B-UNEXPECTED" },
    ]),
    clock: createFakeClock("2026-10-28T09:00:00.000Z"),
  });
  const stockBeforeOrder = ctx.store.products.get("P1").stock;
  const order = seedOrder(ctx, { items: [["P1", 2]] });

  assert.equal(stockBeforeOrder, 10);
  assert.equal(ctx.store.products.get("P1").stock, 8);

  const firstCall = cancelOrder(ctx, "u1", order.id);
  const secondCall = cancelOrder(ctx, "u1", order.id);
  const settledCalls = await Promise.allSettled([firstCall, secondCall]);

  assert.equal(ctx.pg.refunds.length, 0);
  const fulfilledCalls = settledCalls.filter((result) => result.status === "fulfilled");
  assert.equal(fulfilledCalls.length >= 1, true);
  for (const result of settledCalls) {
    if (result.status === "fulfilled") {
      assert.equal(result.value.order.status, "CANCELED");
    } else {
      assert.equal(result.reason.code, "INVALID_STATE");
    }
  }

  assert.equal(ctx.store.orders.get(order.id).status, "CANCELED");
  // 취소 전 8개, 한 번 복원하면 10개이며 두 번 복원하면 12개다.
  assert.equal(ctx.store.products.get("P1").stock, 10);
});
