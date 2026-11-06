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

test.todo("[TC-X-04] TODO: 환불 실패(ok: false)");
test.todo("[TC-X-05] TODO: 환불 시간 초과(예외)");
test.todo("[TC-X-06] TODO: 취소할 수 없는 상태");
test.todo("[TC-X-07] TODO: 남의 주문 · 없는 주문");
test.todo("[TC-X-08] TODO: 동시 취소 — 환불과 재고 복원은 한 번");
