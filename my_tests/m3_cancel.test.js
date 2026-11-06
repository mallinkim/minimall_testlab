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

test.todo("[TC-X-06] TODO: 환불 시간 초과(예외)");
test.todo("[TC-X-07] TODO: 취소할 수 없는 상태");
test.todo("[TC-X-08] TODO: 남의 주문 · 없는 주문");
test.todo("[TC-X-09] TODO: 동시 취소 — 환불과 재고 복원은 한 번");
