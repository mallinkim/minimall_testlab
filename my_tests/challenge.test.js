// 도전 — 시간과 상태 전이의 조합으로 드러나는 결함
const test = require("node:test");
const assert = require("node:assert/strict");
const { createFakeClock, seedOrder } = require("../src/testkit");
const { payOrder } = require("../src/payment");
const { cancelOrder } = require("../src/cancel");
const { expirePendingOrders } = require("../src/expiry");
const { expectRejectCode, fresh } = require("./_helpers");

function createPg({ chargeResponse, refundResponse } = {}) {
  const pg = {
    charges: [],
    refunds: [],
    async charge(request) {
      pg.charges.push({ ...request });
      return chargeResponse;
    },
    async refund(request) {
      pg.refunds.push({ ...request });
      return refundResponse;
    },
  };
  return pg;
}

// 근거: API_CONTRACT.md 114, 152-153줄.
// 잡는 결함: 결제 실패 후 만료되지 않거나, 만료 주문이 다시 결제되어 PG가 호출되는 결함.
test("[TC-H-01] 결제 실패한 주문은 30분 경계에서 만료되고 다시 결제할 수 없다", async () => {
  const clock = createFakeClock("2026-10-28T09:00:00.000Z");
  const pg = createPg({ chargeResponse: { ok: false, reason: "DECLINED" } });
  const ctx = fresh({ clock, pg });
  assert.equal(ctx.store.products.get("P1").stock, 10);
  const order = seedOrder(ctx, { items: [["P1", 2]] });
  assert.equal(ctx.store.products.get("P1").stock, 8);

  const paymentError = await expectRejectCode(
    () => payOrder(ctx, "u1", order.id),
    "PAYMENT_FAILED",
  );
  assert.equal(paymentError.details.reason, "DECLINED");
  assert.equal(ctx.store.orders.get(order.id).status, "PENDING_PAYMENT");
  assert.equal(pg.charges.length, 1);

  clock.advanceMinutes(30);
  assert.deepEqual(expirePendingOrders(ctx), ["ORD-0001"]);
  assert.equal(ctx.store.orders.get(order.id).status, "CANCELED");
  assert.equal(ctx.store.products.get("P1").stock, 10);

  await expectRejectCode(() => payOrder(ctx, "u1", order.id), "INVALID_STATE");
  assert.equal(pg.charges.length, 1);
  assert.equal(ctx.store.products.get("P1").stock, 10);
});

// 근거: API_CONTRACT.md 113, 152-153줄.
// 팀 가정: 만료 함수를 호출하기 전이면 정확히 30분 시점에도 결제를 허용한다.
// 잡는 결함: 이미 결제된 주문을 만료 처리하는 결함.
test("[TC-H-02] 정확히 30분에 결제된 주문은 만료 처리되지 않는다", async () => {
  const clock = createFakeClock("2026-10-28T09:00:00.000Z");
  const pg = createPg({ chargeResponse: { ok: true, txId: "TX-H-02" } });
  const ctx = fresh({ clock, pg });
  assert.equal(ctx.store.products.get("P1").stock, 10);
  const order = seedOrder(ctx, { items: [["P1", 2]] });
  assert.equal(ctx.store.products.get("P1").stock, 8);

  clock.advanceMinutes(30);
  const payment = await payOrder(ctx, "u1", order.id);
  assert.equal(payment.order.status, "PAID");
  assert.equal(ctx.store.orders.get(order.id).status, "PAID");
  assert.equal(pg.charges.length, 1);

  assert.deepEqual(expirePendingOrders(ctx), []);
  assert.equal(ctx.store.orders.get(order.id).status, "PAID");
  assert.equal(ctx.store.products.get("P1").stock, 8);
});

// 근거: API_CONTRACT.md 128-129, 152-153줄.
// 잡는 결함: 만료로 취소된 주문을 다시 취소해 재고를 중복 복원하는 결함.
test("[TC-H-03] 만료로 취소된 주문은 다시 취소할 수 없고 재고도 복원하지 않는다", async () => {
  const clock = createFakeClock("2026-10-28T09:00:00.000Z");
  const pg = createPg({ refundResponse: { ok: true, refundId: "RF-H-03" } });
  const ctx = fresh({ clock, pg });
  assert.equal(ctx.store.products.get("P1").stock, 10);
  const order = seedOrder(ctx, { items: [["P1", 2]] });
  assert.equal(ctx.store.products.get("P1").stock, 8);

  clock.advanceMinutes(30);
  assert.deepEqual(expirePendingOrders(ctx), ["ORD-0001"]);
  assert.equal(ctx.store.products.get("P1").stock, 10);

  await expectRejectCode(
    () => cancelOrder(ctx, "u1", order.id),
    "INVALID_STATE",
  );
  assert.equal(ctx.store.orders.get(order.id).status, "CANCELED");
  assert.equal(ctx.store.products.get("P1").stock, 10);
  assert.equal(pg.refunds.length, 0);
});
