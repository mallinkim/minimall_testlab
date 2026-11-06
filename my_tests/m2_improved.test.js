// Mission 2 — AI 가 만든 테스트(ai_tests/)에서 찾은 결함을 고친 테스트를 여기에 쓴다.
// (ai_tests/ 는 수정하지 않는다. 고친 버전을 이 파일 또는 새 파일에 작성한다.)
const test = require("node:test");
const assert = require("node:assert/strict");
const { fresh, expectCode } = require("./_helpers");
const { addToCart, getCart } = require("../src/cart");

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
