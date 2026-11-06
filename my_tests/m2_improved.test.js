// Mission 2 — AI 가 만든 테스트(ai_tests/)에서 찾은 결함을 고친 테스트를 여기에 쓴다.
// (ai_tests/ 는 수정하지 않는다. 고친 버전을 이 파일 또는 새 파일에 작성한다.)
const test = require("node:test");
const assert = require("node:assert/strict");
const { fresh, expectCode, expectRejectCode } = require("./_helpers");
const { addToCart, changeQuantity, removeItem, getCart } = require("../src/cart");
const { createOrder, changeStatus } = require("../src/order");
const { getOrderDetail, listOrders } = require("../src/orderQuery");
const { seedOrder } = require("../src/testkit");
const { cancelOrder } = require("../src/cancel");
const { payOrder } = require("../src/payment");

test("[TC-R-01] P1 한 개를 담으면 수량과 금액을 정확히 반환한다", () => {
  // 요청 수량과 장바구니 금액이 잘못 계산되는 결함을 잡는다.
  const ctx = fresh();
  const cart = addToCart(ctx, "u1", "P1", 1);
  assert.equal(cart.items[0].quantity, 1);
  assert.equal(cart.items[0].unitPrice, 15000);
  assert.equal(cart.items[0].lineTotal, 15000);
  assert.equal(cart.totalAmount, 15000);
});

test("[TC-R-02] P1 재고 99개를 모두 담을 수 있다", () => {
  // 최대 허용 수량 99를 거부하는 경계 결함을 잡는다.
  const ctx = fresh({
    products: [{ id: "P1", name: "무선 마우스", price: 15000, stock: 99, status: "ON_SALE" }],
  });
  const cart = addToCart(ctx, "u1", "P1", 99);
  assert.equal(cart.items[0].quantity, 99);
  assert.equal(cart.items[0].lineTotal, 1485000);
  assert.equal(cart.totalAmount, 1485000);
});

test("[TC-R-03] 수량 0은 INVALID_QUANTITY이고 장바구니를 바꾸지 않는다", () => {
  // 최소 유효 수량보다 작은 값을 허용하는 결함을 잡는다.
  const ctx = fresh();
  expectCode(() => addToCart(ctx, "u1", "P1", 0), "INVALID_QUANTITY");
  assert.deepEqual(getCart(ctx, "u1").items, []);
  assert.equal(getCart(ctx, "u1").totalAmount, 0);
});

test("[TC-R-04] 수량 100은 INVALID_QUANTITY이고 장바구니를 바꾸지 않는다", () => {
  // 최대 유효 수량보다 큰 값을 허용하는 결함을 잡는다.
  const ctx = fresh({
    products: [{ id: "P1", name: "무선 마우스", price: 15000, stock: 100, status: "ON_SALE" }],
  });
  expectCode(() => addToCart(ctx, "u1", "P1", 100), "INVALID_QUANTITY");
  assert.deepEqual(getCart(ctx, "u1").items, []);
  assert.equal(getCart(ctx, "u1").totalAmount, 0);
});

test("[TC-R-05] 장바구니 항목 금액과 합계를 정확히 계산한다", () => {
  // 항목 금액이나 합계 계산이 잘못되는 결함을 잡는다.
  const ctx = fresh();
  addToCart(ctx, "u1", "P1", 2);
  addToCart(ctx, "u1", "P2", 1);
  const cart = getCart(ctx, "u1");
  assert.equal(cart.items[0].lineTotal, 30000);
  assert.equal(cart.items[1].lineTotal, 59000);
  assert.equal(cart.totalAmount, 89000);
});

test("[TC-R-06] 주문 금액은 주문 상품 합계 30000원이다", () => {
  // 주문 총액이 상품 단가와 수량에 따라 계산되지 않는 결함을 잡는다.
  const ctx = fresh();
  addToCart(ctx, "u1", "P1", 2);
  const order = createOrder(ctx, "u1", { address: "서울시" });
  assert.equal(order.totalAmount, 30000);
});

test("[TC-R-07] 재고와 같은 수량을 장바구니에 담을 수 있다", () => {
  // 재고와 같은 수량을 초과로 잘못 판정하는 경계 결함을 잡는다.
  const ctx = fresh();
  const cart = addToCart(ctx, "u1", "P1", 10);
  assert.equal(cart.items[0].quantity, 10);
  assert.equal(cart.totalAmount, 150000);
});

test("[TC-R-08] 재고보다 많이 담으면 maxAddable을 반환하고 장바구니를 유지한다", () => {
  // 재고 초과 검증과 현재 추가 가능 수량 계산의 결함을 잡는다.
  const ctx = fresh();
  const err = expectCode(() => addToCart(ctx, "u1", "P1", 11), "OUT_OF_STOCK");
  assert.equal(err.details.maxAddable, 10);
  assert.deepEqual(getCart(ctx, "u1").items, []);
  assert.equal(getCart(ctx, "u1").totalAmount, 0);
});

test("[TC-R-09] 판매 중지 상품 추가는 NOT_FOUND이고 장바구니를 바꾸지 않는다", () => {
  // 판매 중지 상품을 장바구니에 추가할 수 있는 결함을 잡는다.
  const ctx = fresh();
  expectCode(() => addToCart(ctx, "u1", "P4", 1), "NOT_FOUND");
  assert.deepEqual(getCart(ctx, "u1").items, []);
});

test("[TC-R-10] 없는 상품 추가는 NOT_FOUND이고 장바구니를 바꾸지 않는다", () => {
  // 존재하지 않는 상품을 추가할 수 있는 결함을 잡는다.
  const ctx = fresh();
  expectCode(() => addToCart(ctx, "u1", "NOPE", 1), "NOT_FOUND");
  assert.deepEqual(getCart(ctx, "u1").items, []);
});

test("[TC-R-11] 장바구니에 없는 상품의 수량 변경은 NOT_FOUND다", () => {
  // 장바구니에 없는 항목을 변경할 수 있는 결함을 잡는다.
  const ctx = fresh();
  expectCode(() => changeQuantity(ctx, "u1", "P1", 2), "NOT_FOUND");
  assert.deepEqual(getCart(ctx, "u1").items, []);
});

test("[TC-R-12] 장바구니에 없는 상품 삭제는 NOT_FOUND다", () => {
  // 장바구니에 없는 항목의 삭제를 성공 처리하는 결함을 잡는다.
  const ctx = fresh();
  expectCode(() => removeItem(ctx, "u1", "P1"), "NOT_FOUND");
  assert.deepEqual(getCart(ctx, "u1").items, []);
});

test("[TC-R-13] 빈 장바구니 주문은 EMPTY_CART이고 주문을 생성하지 않는다", () => {
  // 빈 장바구니로 주문을 만들 수 있는 결함을 잡는다.
  const ctx = fresh();
  expectCode(() => createOrder(ctx, "u1", { address: "서울시" }), "EMPTY_CART");
  assert.equal(listOrders(ctx, "u1").total, 0);
});

test("[TC-R-14] 배송지가 없으면 INVALID_ADDRESS이고 장바구니를 유지한다", () => {
  // 주소 오류 뒤 장바구니가 비워지거나 주문이 생성되는 결함을 잡는다.
  const ctx = fresh();
  addToCart(ctx, "u1", "P1", 1);
  expectCode(() => createOrder(ctx, "u1", {}), "INVALID_ADDRESS");
  assert.deepEqual(getCart(ctx, "u1").items, [{
    productId: "P1",
    name: "무선 마우스",
    unitPrice: 15000,
    quantity: 1,
    lineTotal: 15000,
  }]);
  assert.equal(listOrders(ctx, "u1").total, 0);
});

test("[TC-R-15] 재고 초과 수량 변경은 maxAddable 10이고 기존 수량을 유지한다", () => {
  // 변경 실패 시 초과 수량 적용 또는 팀 가정과 다른 maxAddable을 반환하는 결함을 잡는다.
  const ctx = fresh();
  addToCart(ctx, "u1", "P1", 2);
  const err = expectCode(() => changeQuantity(ctx, "u1", "P1", 11), "OUT_OF_STOCK");
  assert.equal(err.details.maxAddable, 10);
  assert.equal(getCart(ctx, "u1").items[0].quantity, 2);
});

test("[TC-R-16] 주문 재고 부족은 모든 shortages를 보고하고 장바구니와 재고를 보존한다", () => {
  // 여러 부족 상품의 누락이나 실패 시 장바구니·재고 변경을 잡는다.
  const ctx = fresh({
    products: [
      { id: "P1", name: "무선 마우스", price: 15000, stock: 3, status: "ON_SALE" },
      { id: "P2", name: "기계식 키보드", price: 59000, stock: 3, status: "ON_SALE" },
    ],
  });
  addToCart(ctx, "u1", "P1", 2);
  addToCart(ctx, "u1", "P2", 2);
  addToCart(ctx, "u2", "P1", 2);
  addToCart(ctx, "u2", "P2", 2);
  createOrder(ctx, "u2", { address: "서울시" });

  const err = expectCode(() => createOrder(ctx, "u1", { address: "서울시" }), "OUT_OF_STOCK");
  assert.deepEqual(err.details.shortages, [
    { productId: "P1", name: "무선 마우스", requested: 2, available: 1 },
    { productId: "P2", name: "기계식 키보드", requested: 2, available: 1 },
  ]);
  assert.deepEqual(getCart(ctx, "u1").items, [
    { productId: "P1", name: "무선 마우스", unitPrice: 15000, quantity: 2, lineTotal: 30000 },
    { productId: "P2", name: "기계식 키보드", unitPrice: 59000, quantity: 2, lineTotal: 118000 },
  ]);
  assert.equal(listOrders(ctx, "u1").total, 0);

  addToCart(ctx, "u3", "P1", 1);
  addToCart(ctx, "u3", "P2", 1);
  const remainingStockOrder = createOrder(ctx, "u3", { address: "서울시" });
  assert.equal(remainingStockOrder.totalAmount, 74000);
});

test("[TC-R-17] 허용되지 않은 주문 상태 변경은 INVALID_STATE이고 상태를 유지한다", () => {
  // 금지된 상태 전이를 허용하거나 오류 상세의 from/to가 틀리는 결함을 잡는다.
  const ctx = fresh();
  addToCart(ctx, "u1", "P1", 1);
  const order = createOrder(ctx, "u1", { address: "서울시" });
  const err = expectCode(() => changeStatus(ctx, order.id, "DELIVERED"), "INVALID_STATE");
  assert.deepEqual(err.details, { from: "PENDING_PAYMENT", to: "DELIVERED" });
  assert.equal(getOrderDetail(ctx, "u1", order.id).status, "PENDING_PAYMENT");
});

test("[TC-R-18] 이미 취소된 주문 재취소는 INVALID_STATE이고 환불·재고에 영향이 없다", async () => {
  // 이미 취소된 주문이 다시 취소되어 환불이나 재고 복원이 중복되는 결함을 잡는다.
  const ctx = fresh();
  const order = seedOrder(ctx, { status: "CANCELED" });
  await expectRejectCode(() => cancelOrder(ctx, "u1", order.id), "INVALID_STATE");
  assert.equal(getOrderDetail(ctx, "u1", order.id).status, "CANCELED");
  assert.equal(ctx.pg.refunds.length, 0);

  const stockCheckCart = addToCart(ctx, "u2", "P1", 9);
  assert.equal(stockCheckCart.items[0].quantity, 9);
  const err = expectCode(() => addToCart(ctx, "u2", "P1", 1), "OUT_OF_STOCK");
  assert.equal(err.details.maxAddable, 0);
});

test("[TC-R-19] PG 결제 실패는 PAYMENT_FAILED와 사유를 남기고 주문을 대기 상태로 둔다", async () => {
  // PG 거절을 결제 성공으로 처리하거나 실패 사유·주문 상태를 잘못 기록하는 결함을 잡는다.
  const ctx = fresh();
  const order = seedOrder(ctx);
  ctx.pg.failNextCharge("LIMIT_EXCEEDED");

  const err = await expectRejectCode(() => payOrder(ctx, "u1", order.id), "PAYMENT_FAILED");
  assert.equal(err.details.reason, "LIMIT_EXCEEDED");
  assert.equal(getOrderDetail(ctx, "u1", order.id).status, "PENDING_PAYMENT");
  assert.equal(ctx.pg.charges.length, 1);
});

test("[TC-R-20] PG 시간 초과는 PAYMENT_FAILED와 PG_ERROR로 처리한다", async () => {
  // PG 시간 초과를 성공으로 처리하거나 계약된 실패 사유를 기록하지 않는 결함을 잡는다.
  const ctx = fresh();
  const order = seedOrder(ctx);
  ctx.pg.timeoutNextCharge();

  const err = await expectRejectCode(() => payOrder(ctx, "u1", order.id), "PAYMENT_FAILED");
  assert.equal(err.details.reason, "PG_ERROR");
  assert.equal(getOrderDetail(ctx, "u1", order.id).status, "PENDING_PAYMENT");
  assert.equal(ctx.pg.charges.length, 1);
});

test("[TC-R-21] 취소된 주문 결제는 INVALID_STATE이고 PG를 호출하지 않는다", async () => {
  // 취소된 주문에 결제를 허용하거나 PG를 호출하는 결함을 잡는다.
  const ctx = fresh();
  const order = seedOrder(ctx, { status: "CANCELED" });

  const err = await expectRejectCode(() => payOrder(ctx, "u1", order.id), "INVALID_STATE");
  assert.equal(err.details.status, "CANCELED");
  assert.equal(ctx.pg.charges.length, 0);
  assert.equal(getOrderDetail(ctx, "u1", order.id).status, "CANCELED");
});

test("[TC-R-22] 결제 실패 뒤 재시도하면 두 번째 시도로 결제가 완료된다", async () => {
  // 실패 뒤 재결제를 막거나 시도 기록·번호를 증가시키지 않는 결함을 잡는다.
  const ctx = fresh();
  const order = seedOrder(ctx);
  ctx.pg.failNextCharge("LIMIT_EXCEEDED");

  const firstError = await expectRejectCode(() => payOrder(ctx, "u1", order.id), "PAYMENT_FAILED");
  assert.equal(firstError.details.reason, "LIMIT_EXCEEDED");
  assert.equal(getOrderDetail(ctx, "u1", order.id).status, "PENDING_PAYMENT");
  const failedPayment = ctx.store.payments.get(order.id)[0];
  assert.equal(failedPayment.status, "FAILED");
  assert.equal(failedPayment.attempt, 1);
  assert.equal(failedPayment.failureReason, "LIMIT_EXCEEDED");

  const retry = await payOrder(ctx, "u1", order.id);
  assert.equal(retry.order.status, "PAID");
  assert.equal(retry.payment.status, "SUCCEEDED");
  assert.equal(retry.payment.attempt, 2);
  assert.equal(ctx.store.payments.get(order.id).length, 2);
  assert.equal(ctx.pg.charges.length, 2);
});

test("[TC-R-23] 환불 실패 후 주문·재고를 유지하고 재취소를 허용한다", async () => {
  // 환불 실패를 취소 완료로 처리하거나 재고를 먼저 복원하고 재시도를 막는 결함을 잡는다.
  const ctx = fresh();
  const order = seedOrder(ctx, { status: "PAID" });
  ctx.pg.failNextRefund("REFUND_REJECTED");

  const firstError = await expectRejectCode(() => cancelOrder(ctx, "u1", order.id), "REFUND_FAILED");
  assert.equal(firstError.details.reason, "REFUND_REJECTED");
  assert.equal(getOrderDetail(ctx, "u1", order.id).status, "PAID");
  assert.equal(ctx.store.payments.get(order.id)[0].refund.status, "FAILED");
  assert.equal(ctx.store.payments.get(order.id)[0].refund.reason, "REFUND_REJECTED");
  assert.equal(ctx.pg.refunds.length, 1);

  const stockBeforeRetry = expectCode(() => addToCart(ctx, "u2", "P1", 10), "OUT_OF_STOCK");
  assert.equal(stockBeforeRetry.details.maxAddable, 9);

  const retry = await cancelOrder(ctx, "u1", order.id);
  assert.equal(retry.order.status, "CANCELED");
  assert.equal(ctx.pg.refunds.length, 2);
  const stockAfterRetry = addToCart(ctx, "u2", "P1", 10);
  assert.equal(stockAfterRetry.items[0].quantity, 10);
});

test("[TC-R-24] 같은 상품을 다시 담으면 두 수량을 합산한다", () => {
  // 이미 담긴 상품에 추가 수량을 합산하지 않고 덮어쓰는 결함을 잡는다.
  const ctx = fresh();
  addToCart(ctx, "u1", "P1", 2);
  const cart = addToCart(ctx, "u1", "P1", 3);
  assert.equal(cart.items.length, 1);
  assert.equal(cart.items[0].quantity, 5);
  assert.equal(cart.items[0].lineTotal, 75000);
});

test("[TC-R-25] 주문 성공은 재고를 차감해 남은 수량만 담게 한다", () => {
  // 주문 시 재고 차감이 누락되거나 잘못 적용되는 결함을 잡는다.
  const ctx = fresh();
  addToCart(ctx, "u1", "P1", 1);
  const order = createOrder(ctx, "u1", { address: "서울시" });
  assert.equal(order.status, "PENDING_PAYMENT");
  assert.equal(getOrderDetail(ctx, "u1", order.id).items[0].quantity, 1);

  const overRemaining = expectCode(() => addToCart(ctx, "u2", "P1", 10), "OUT_OF_STOCK");
  assert.equal(overRemaining.details.maxAddable, 9);
  const remaining = addToCart(ctx, "u2", "P1", 9);
  assert.equal(remaining.items[0].quantity, 9);
});

test("[TC-R-26] 결제 전 취소는 재고를 복원한다", async () => {
  // 결제 전 주문 취소 시 상품 재고 복원이 빠지는 결함을 잡는다.
  const ctx = fresh();
  const order = seedOrder(ctx, { items: [["P1", 3]] });

  const result = await cancelOrder(ctx, "u1", order.id);
  assert.equal(result.order.status, "CANCELED");
  const restored = addToCart(ctx, "u2", "P1", 10);
  assert.equal(restored.items[0].quantity, 10);
});

test("[TC-R-27] 결제 후 취소는 환불 성공 기록과 취소 상태를 남긴다", async () => {
  // PAID 주문을 환불 없이 취소하거나 환불 성공 기록을 남기지 않는 결함을 잡는다.
  const ctx = fresh();
  const order = seedOrder(ctx, { status: "PAID", items: [["P1", 1]] });

  const result = await cancelOrder(ctx, "u1", order.id);
  assert.equal(result.order.status, "CANCELED");
  assert.equal(ctx.pg.refunds.length, 1);
  assert.equal(ctx.pg.refunds[0].amount, 15000);
  const payment = ctx.store.payments.get(order.id)[0];
  assert.equal(payment.status, "REFUNDED");
  assert.equal(payment.refund.status, "SUCCEEDED");
});

test("[TC-R-28] 이미 결제된 주문 재요청은 PG를 다시 호출하지 않는다", async () => {
  // 이미 결제된 주문에 대해 PG 결제가 중복 호출되는 결함을 잡는다.
  const ctx = fresh();
  const order = seedOrder(ctx);

  await payOrder(ctx, "u1", order.id);
  assert.equal(ctx.pg.charges.length, 1);
  const again = await payOrder(ctx, "u1", order.id);
  assert.equal(again.alreadyPaid, true);
  assert.equal(ctx.pg.charges.length, 1);
});

test("[TC-R-29] 허용된 상태 변경은 반환 주문에 새 상태를 반영한다", () => {
  // 허용된 상태 전이가 변경 주문의 반환값에 반영되지 않는 결함을 잡는다.
  const ctx = fresh();
  addToCart(ctx, "u1", "P1", 1);
  const order = createOrder(ctx, "u1", { address: "서울시" });

  const changed = changeStatus(ctx, order.id, "PAID");
  assert.equal(changed.status, "PAID");
});
