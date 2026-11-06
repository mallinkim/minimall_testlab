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
        return responses.shift();
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

  test.todo("[TC-P-05] TODO: 재시도 — attempt 번호와 멱등성 키");
  test.todo("[TC-P-06] TODO: 이미 결제됨 · 취소된 주문 · 남의 주문");
  test.todo("[TC-P-07] TODO: 동시 요청(Promise.all) — PG 요청은 한 번");
  test.todo("[TC-P-08] TODO: PG 시간 초과 — 오류 코드 · 사유 · 주문 상태 · 결제 기록");
