// Mission 1 — 장바구니 테스트 (docs/TEST_DESIGN.md 의 케이스 ID 를 테스트 이름에 쓴다)
const test = require("node:test");
const assert = require("node:assert/strict");
const { addToCart, changeQuantity, removeItem, getCart } = require("../src/cart");
const { expectCode, fresh } = require("./_helpers");

// 예시 (이 스타일로 작성한다: 준비 → 실행 → 값으로 확인)
test("[TC-C-01] 재고가 충분한 상품을 담으면 수량과 소계가 장바구니에 기록된다", () => {
  const ctx = fresh();
  const cart = addToCart(ctx, "u1", "P1", 2);
  assert.deepEqual(cart.items, [{ productId: "P1", name: "무선 마우스", unitPrice: 15000, quantity: 2, lineTotal: 30000 }]);
  assert.equal(cart.totalAmount, 30000);
});

test("[TC-C-02] 수량이 0 이면 INVALID_QUANTITY 이고 장바구니는 바뀌지 않는다", () => {
  const ctx = fresh();
  expectCode(() => addToCart(ctx, "u1", "P1", 0), "INVALID_QUANTITY");
  assert.equal(getCart(ctx, "u1").items.length, 0);
});

test.todo("[TC-C-03] TODO: 동등분할 · 경계값 표에서 도출한 다음 케이스를 작성한다");
test("[TC-C-03] 이미 담긴 상품에 수량 0을 추가하면 INVALID_QUANTITY", () => {
  const ctx = fresh();
  addToCart(ctx, "u1", "P1", 1);
  expectCode(() => addToCart(ctx, "u1", "P1", 0), "INVALID_QUANTITY");
});

test("[TC-C-04] 재고 1개인 P5에 1개를 담으면 성공한다", () => {
  const ctx = fresh();
  const cart = addToCart(ctx, "u1", "P5", 1);
  assert.equal(cart.items.find((item) => item.productId === "P5").quantity, 1);
});

test("[TC-C-05] 재고 10개인 P1에 이미 1개가 있을 때 99개를 더 담으면 재고 부족이고 장바구니는 바뀌지 않는다", () => {
  const ctx = fresh();
  addToCart(ctx, "u1", "P1", 1);
  const before = getCart(ctx, "u1");
  const err = expectCode(() => addToCart(ctx, "u1", "P1", 99), "OUT_OF_STOCK");
  assert.equal(err.details.maxAddable, 9);
  assert.deepEqual(getCart(ctx, "u1"), before);
});

test("[TC-C-06] 수량 100은 INVALID_QUANTITY", () => {
  const ctx = fresh();
  expectCode(() => addToCart(ctx, "u1", "P1", 100), "INVALID_QUANTITY");
});

test("[TC-C-07] 수량 1.5는 INVALID_QUANTITY", () => {
  const ctx = fresh();
  expectCode(() => addToCart(ctx, "u1", "P1", 1.5), "INVALID_QUANTITY");
});

test('[TC-C-08] 문자열 수량 "2"는 INVALID_QUANTITY', () => {
  const ctx = fresh();
  expectCode(() => addToCart(ctx, "u1", "P1", "2"), "INVALID_QUANTITY");
});

test("[TC-C-09] 수량 null은 INVALID_QUANTITY", () => {
  const ctx = fresh();
  expectCode(() => addToCart(ctx, "u1", "P1", null), "INVALID_QUANTITY");
});

test("[TC-C-11] 재고 1개인 P5에 2개를 더 담으면 maxAddable 1이고 장바구니는 바뀌지 않는다", () => {
  const ctx = fresh();
  addToCart(ctx, "u1", "P1", 1);
  const before = getCart(ctx, "u1");
  const err = expectCode(() => addToCart(ctx, "u1", "P5", 2), "OUT_OF_STOCK");
  assert.equal(err.details.maxAddable, 1);
  assert.deepEqual(getCart(ctx, "u1"), before);
});

test("[TC-C-12] 재고 3개인 P2에 3개를 담으면 성공한다", () => {
  const ctx = fresh();
  const cart = addToCart(ctx, "u1", "P2", 3);
  assert.equal(cart.items.find((item) => item.productId === "P2").quantity, 3);
});

test("[TC-C-13] P1에 이미 2개가 있을 때 3개를 더 담으면 합계 5개가 된다", () => {
  const ctx = fresh();
  addToCart(ctx, "u1", "P1", 2);
  const cart = addToCart(ctx, "u1", "P1", 3);
  assert.equal(cart.items.find((item) => item.productId === "P1").quantity, 5);
});

test("[TC-C-14] 존재하지 않는 상품을 담으면 NOT_FOUND", () => {
  const ctx = fresh();
  addToCart(ctx, "u1", "P1", 1);
  expectCode(() => addToCart(ctx, "u1", "MISSING", 1), "NOT_FOUND");
});

test("[TC-C-15] 판매 중지 상품 P4를 담으면 NOT_FOUND", () => {
  const ctx = fresh();
  addToCart(ctx, "u1", "P1", 1);
  expectCode(() => addToCart(ctx, "u1", "P4", 1), "NOT_FOUND");
});

test("[TC-C-16] 품절 상품 P3를 담으면 maxAddable 0이고 장바구니는 바뀌지 않는다", () => {
  const ctx = fresh();
  addToCart(ctx, "u1", "P1", 1);
  const before = getCart(ctx, "u1");
  const err = expectCode(() => addToCart(ctx, "u1", "P3", 1), "OUT_OF_STOCK");
  assert.equal(err.details.maxAddable, 0);
  assert.deepEqual(getCart(ctx, "u1"), before);
});

test("[TC-C-17] 재고가 99개인 상품에 수량 99를 담으면 성공한다", () => {
  const ctx = fresh({ products: [{ id: "PX", name: "상품", price: 100, stock: 99, status: "ON_SALE" }] });
  const cart = addToCart(ctx, "u1", "PX", 99);
  assert.equal(cart.items.find((item) => item.productId === "PX").quantity, 99);
});

test("[TC-C-18] P1 재고 10개에 이미 7개가 있을 때 3개를 더 담으면 합계 10개가 된다", () => {
  const ctx = fresh();
  addToCart(ctx, "u1", "P1", 7);
  const cart = addToCart(ctx, "u1", "P1", 3);
  assert.equal(cart.items.find((item) => item.productId === "P1").quantity, 10);
});

test("[TC-C-19] P1 재고 10개에 이미 7개가 있을 때 4개를 더 담으면 maxAddable 3이고 장바구니는 바뀌지 않는다", () => {
  const ctx = fresh();
  addToCart(ctx, "u1", "P1", 7);
  const before = getCart(ctx, "u1");
  const err = expectCode(() => addToCart(ctx, "u1", "P1", 4), "OUT_OF_STOCK");
  assert.equal(err.details.maxAddable, 3);
  assert.deepEqual(getCart(ctx, "u1"), before);
});

test("[TC-C-20] P1 재고 10개에 이미 7개가 있을 때 5개를 더 담으면 maxAddable 3이고 장바구니는 바뀌지 않는다", () => {
  const ctx = fresh();
  addToCart(ctx, "u1", "P1", 7);
  const before = getCart(ctx, "u1");
  const err = expectCode(() => addToCart(ctx, "u1", "P1", 5), "OUT_OF_STOCK");
  assert.equal(err.details.maxAddable, 3);
  assert.deepEqual(getCart(ctx, "u1"), before);
});

test("[TC-C-21] addToCart 반환값을 수정해도 getCart 결과는 바뀌지 않는다", () => {
  const ctx = fresh();
  const returnedCart = addToCart(ctx, "u1", "P1", 1);
  const before = getCart(ctx, "u1");
  returnedCart.items[0].quantity = 99;
  assert.deepEqual(getCart(ctx, "u1"), before);
});
