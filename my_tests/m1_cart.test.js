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

test("[TC-C-03] 이미 담긴 상품에 수량 0을 추가하면 INVALID_QUANTITY", () => {
  const ctx = fresh();
  addToCart(ctx, "u1", "P1", 1);
  expectCode(() => addToCart(ctx, "u1", "P1", 0), "INVALID_QUANTITY");
});

test("[TC-C-04] 재고 1개인 P5에 1개를 담으면 성공한다", () => {
  const ctx = fresh();
  const cart = addToCart(ctx, "u1", "P5", 1);
  assert.deepEqual(cart.items, [{ productId: "P5", name: "모니터 받침대", unitPrice: 25000, quantity: 1, lineTotal: 25000 }]);
  assert.equal(cart.totalAmount, 25000);
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
  assert.deepEqual(cart.items, [{ productId: "P2", name: "기계식 키보드", unitPrice: 59000, quantity: 3, lineTotal: 177000 }]);
  assert.equal(cart.totalAmount, 177000);
});

test("[TC-C-13] P1에 이미 2개가 있을 때 3개를 더 담으면 합계 5개가 된다", () => {
  const ctx = fresh();
  addToCart(ctx, "u1", "P1", 2);
  const cart = addToCart(ctx, "u1", "P1", 3);
  assert.deepEqual(cart.items, [{ productId: "P1", name: "무선 마우스", unitPrice: 15000, quantity: 5, lineTotal: 75000 }]);
  assert.equal(cart.totalAmount, 75000);
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
  assert.deepEqual(cart.items, [{ productId: "PX", name: "상품", unitPrice: 100, quantity: 99, lineTotal: 9900 }]);
  assert.equal(cart.totalAmount, 9900);
});

test("[TC-C-18] P1 재고 10개에 이미 7개가 있을 때 3개를 더 담으면 합계 10개가 된다", () => {
  const ctx = fresh();
  addToCart(ctx, "u1", "P1", 7);
  const cart = addToCart(ctx, "u1", "P1", 3);
  assert.deepEqual(cart.items, [{ productId: "P1", name: "무선 마우스", unitPrice: 15000, quantity: 10, lineTotal: 150000 }]);
  assert.equal(cart.totalAmount, 150000);
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

test("[TC-C-22] P1 수량을 1로 변경하면 소계와 합계가 갱신된다", () => {
  const ctx = fresh();
  addToCart(ctx, "u1", "P1", 2);
  const cart = changeQuantity(ctx, "u1", "P1", 1);
  assert.deepEqual(cart.items, [{ productId: "P1", name: "무선 마우스", unitPrice: 15000, quantity: 1, lineTotal: 15000 }]);
  assert.equal(cart.totalAmount, 15000);
});

test("[TC-C-23] 재고 99개인 P1의 수량을 99로 변경할 수 있다", () => {
  const ctx = fresh({ products: [{ id: "P1", name: "무선 마우스", price: 15000, stock: 99, status: "ON_SALE" }] });
  addToCart(ctx, "u1", "P1", 2);
  const cart = changeQuantity(ctx, "u1", "P1", 99);
  assert.deepEqual(cart.items, [{ productId: "P1", name: "무선 마우스", unitPrice: 15000, quantity: 99, lineTotal: 1485000 }]);
  assert.equal(cart.totalAmount, 1485000);
});

test("[TC-C-24] 수량 0은 INVALID_QUANTITY이고 장바구니는 바뀌지 않는다", () => {
  const ctx = fresh();
  addToCart(ctx, "u1", "P1", 2);
  const before = getCart(ctx, "u1");
  expectCode(() => changeQuantity(ctx, "u1", "P1", 0), "INVALID_QUANTITY");
  assert.deepEqual(getCart(ctx, "u1"), before);
});

test("[TC-C-25] 수량 100은 INVALID_QUANTITY이고 장바구니는 바뀌지 않는다", () => {
  const ctx = fresh();
  addToCart(ctx, "u1", "P1", 2);
  const before = getCart(ctx, "u1");
  expectCode(() => changeQuantity(ctx, "u1", "P1", 100), "INVALID_QUANTITY");
  assert.deepEqual(getCart(ctx, "u1"), before);
});

test("[TC-C-26] 수량 1.5는 INVALID_QUANTITY이고 장바구니는 바뀌지 않는다", () => {
  const ctx = fresh();
  addToCart(ctx, "u1", "P1", 2);
  const before = getCart(ctx, "u1");
  expectCode(() => changeQuantity(ctx, "u1", "P1", 1.5), "INVALID_QUANTITY");
  assert.deepEqual(getCart(ctx, "u1"), before);
});

test('[TC-C-27] 문자열 수량 "2"는 INVALID_QUANTITY이고 장바구니는 바뀌지 않는다', () => {
  const ctx = fresh();
  addToCart(ctx, "u1", "P1", 2);
  const before = getCart(ctx, "u1");
  expectCode(() => changeQuantity(ctx, "u1", "P1", "2"), "INVALID_QUANTITY");
  assert.deepEqual(getCart(ctx, "u1"), before);
});

test("[TC-C-28] 수량 null은 INVALID_QUANTITY이고 장바구니는 바뀌지 않는다", () => {
  const ctx = fresh();
  addToCart(ctx, "u1", "P1", 2);
  const before = getCart(ctx, "u1");
  expectCode(() => changeQuantity(ctx, "u1", "P1", null), "INVALID_QUANTITY");
  assert.deepEqual(getCart(ctx, "u1"), before);
});

test("[TC-C-29] 음수 수량은 INVALID_QUANTITY이고 장바구니는 바뀌지 않는다", () => {
  const ctx = fresh();
  addToCart(ctx, "u1", "P1", 2);
  const before = getCart(ctx, "u1");
  expectCode(() => changeQuantity(ctx, "u1", "P1", -1), "INVALID_QUANTITY");
  assert.deepEqual(getCart(ctx, "u1"), before);
});

test("[TC-C-30] 재고보다 큰 수량으로 변경하면 OUT_OF_STOCK이고 장바구니는 바뀌지 않는다", () => {
  const ctx = fresh({ products: [{ id: "P1", name: "무선 마우스", price: 15000, stock: 3, status: "ON_SALE" }] });
  addToCart(ctx, "u1", "P1", 2);
  const before = getCart(ctx, "u1");
  expectCode(() => changeQuantity(ctx, "u1", "P1", 4), "OUT_OF_STOCK");
  assert.deepEqual(getCart(ctx, "u1"), before);
});

test("[TC-C-31] P1 수량을 재고와 같은 10으로 변경할 수 있다", () => {
  const ctx = fresh();
  addToCart(ctx, "u1", "P1", 2);
  const cart = changeQuantity(ctx, "u1", "P1", 10);
  assert.deepEqual(cart.items, [{ productId: "P1", name: "무선 마우스", unitPrice: 15000, quantity: 10, lineTotal: 150000 }]);
  assert.equal(cart.totalAmount, 150000);
});

test("[TC-C-32] 재고보다 하나 많은 수량으로 변경하면 OUT_OF_STOCK이고 장바구니는 바뀌지 않는다", () => {
  const ctx = fresh();
  addToCart(ctx, "u1", "P1", 2);
  const before = getCart(ctx, "u1");
  expectCode(() => changeQuantity(ctx, "u1", "P1", 11), "OUT_OF_STOCK");
  assert.deepEqual(getCart(ctx, "u1"), before);
});

test("[TC-C-33] 장바구니에 없는 P2의 수량을 변경하면 NOT_FOUND이고 장바구니는 바뀌지 않는다", () => {
  const ctx = fresh();
  addToCart(ctx, "u1", "P1", 2);
  const before = getCart(ctx, "u1");
  expectCode(() => changeQuantity(ctx, "u1", "P2", 1), "NOT_FOUND");
  assert.deepEqual(getCart(ctx, "u1"), before);
});

test("[TC-C-34] 담은 뒤 판매 중지된 P1의 수량을 변경하면 NOT_FOUND이고 장바구니는 바뀌지 않는다", () => {
  const ctx = fresh();
  addToCart(ctx, "u1", "P1", 2);
  ctx.store.products.get("P1").status = "STOPPED";
  const before = getCart(ctx, "u1");
  expectCode(() => changeQuantity(ctx, "u1", "P1", 3), "NOT_FOUND");
  assert.deepEqual(getCart(ctx, "u1"), before);
});

test("[TC-C-35] P1 수량 변경 후에도 P1, P2 순서와 P2 수량이 유지된다", () => {
  const ctx = fresh();
  addToCart(ctx, "u1", "P1", 2);
  addToCart(ctx, "u1", "P2", 1);
  const cart = changeQuantity(ctx, "u1", "P1", 3);
  assert.deepEqual(cart.items, [
    { productId: "P1", name: "무선 마우스", unitPrice: 15000, quantity: 3, lineTotal: 45000 },
    { productId: "P2", name: "기계식 키보드", unitPrice: 59000, quantity: 1, lineTotal: 59000 },
  ]);
  assert.equal(cart.totalAmount, 104000);
});

test("[TC-C-36] P1 수량을 2에서 5로 변경하면 합산하지 않고 5가 된다", () => {
  const ctx = fresh();
  addToCart(ctx, "u1", "P1", 2);
  const cart = changeQuantity(ctx, "u1", "P1", 5);
  assert.deepEqual(cart.items, [{ productId: "P1", name: "무선 마우스", unitPrice: 15000, quantity: 5, lineTotal: 75000 }]);
  assert.equal(cart.totalAmount, 75000);
});

test("[TC-C-37] 존재하지 않는 상품 ID의 수량을 변경하면 NOT_FOUND이고 장바구니는 바뀌지 않는다", () => {
  const ctx = fresh();
  addToCart(ctx, "u1", "P1", 2);
  const before = getCart(ctx, "u1");
  expectCode(() => changeQuantity(ctx, "u1", "PX", 1), "NOT_FOUND");
  assert.deepEqual(getCart(ctx, "u1"), before);
});

test("[TC-C-38] 여러 상품 중 가운데 P2를 삭제하면 나머지 순서를 유지하고 getCart와 같은 값을 반환한다", () => {
  const ctx = fresh();
  addToCart(ctx, "u1", "P1", 1);
  addToCart(ctx, "u1", "P2", 1);
  addToCart(ctx, "u1", "P5", 1);
  const cart = removeItem(ctx, "u1", "P2");
  assert.deepEqual(cart.items, [
    { productId: "P1", name: "무선 마우스", unitPrice: 15000, quantity: 1, lineTotal: 15000 },
    { productId: "P5", name: "모니터 받침대", unitPrice: 25000, quantity: 1, lineTotal: 25000 },
  ]);
  assert.equal(cart.totalAmount, 40000);
  assert.deepEqual(cart, getCart(ctx, "u1"));
});

test("[TC-C-39] 마지막 남은 상품을 삭제하면 빈 장바구니를 반환하고 getCart와 값이 같다", () => {
  const ctx = fresh();
  addToCart(ctx, "u1", "P5", 1);
  const cart = removeItem(ctx, "u1", "P5");
  assert.deepEqual(cart.items, []);
  assert.equal(cart.totalAmount, 0);
  assert.deepEqual(cart, getCart(ctx, "u1"));
});

test("[TC-C-40] 삭제한 P2를 다시 담으면 맨 뒤 순서가 되고 getCart와 같은 값을 반환한다", () => {
  const ctx = fresh();
  addToCart(ctx, "u1", "P1", 1);
  addToCart(ctx, "u1", "P2", 1);
  addToCart(ctx, "u1", "P5", 1);
  removeItem(ctx, "u1", "P2");
  addToCart(ctx, "u1", "P2", 1);
  const cart = removeItem(ctx, "u1", "P1");
  assert.deepEqual(cart.items, [
    { productId: "P5", name: "모니터 받침대", unitPrice: 25000, quantity: 1, lineTotal: 25000 },
    { productId: "P2", name: "기계식 키보드", unitPrice: 59000, quantity: 1, lineTotal: 59000 },
  ]);
  assert.equal(cart.totalAmount, 84000);
  assert.deepEqual(cart, getCart(ctx, "u1"));
});

test("[TC-C-41] 장바구니에 없는 상품을 삭제하면 NOT_FOUND이고 장바구니는 바뀌지 않는다", () => {
  const ctx = fresh();
  addToCart(ctx, "u1", "P1", 1);
  addToCart(ctx, "u1", "P5", 1);
  const before = getCart(ctx, "u1");
  expectCode(() => removeItem(ctx, "u1", "P2"), "NOT_FOUND");
  assert.deepEqual(getCart(ctx, "u1"), before);
});

test("[TC-C-42] 존재하지 않는 상품 ID를 삭제하면 NOT_FOUND이고 장바구니는 바뀌지 않는다", () => {
  const ctx = fresh();
  addToCart(ctx, "u1", "P1", 1);
  addToCart(ctx, "u1", "P5", 1);
  const before = getCart(ctx, "u1");
  expectCode(() => removeItem(ctx, "u1", "P999"), "NOT_FOUND");
  assert.deepEqual(getCart(ctx, "u1"), before);
});

test("[TC-C-43] 장바구니를 만든 적 없는 구매자가 삭제하면 NOT_FOUND이고 상태는 바뀌지 않는다", () => {
  const ctx = fresh();
  const before = getCart(ctx, "u1");
  expectCode(() => removeItem(ctx, "u1", "P1"), "NOT_FOUND");
  assert.deepEqual(getCart(ctx, "u1"), before);
});

test("[TC-C-44] P1 3개와 P2 2개 중 P2를 삭제하면 P1의 수량과 합계를 유지한다", () => {
  const ctx = fresh();
  addToCart(ctx, "u1", "P1", 3);
  addToCart(ctx, "u1", "P2", 2);
  const cart = removeItem(ctx, "u1", "P2");
  assert.deepEqual(cart.items, [
    { productId: "P1", name: "무선 마우스", unitPrice: 15000, quantity: 3, lineTotal: 45000 },
  ]);
  assert.equal(cart.totalAmount, 45000);
});

test("[TC-C-45] u1의 P1을 삭제해도 u2의 장바구니는 유지된다", () => {
  const ctx = fresh();
  addToCart(ctx, "u1", "P1", 1);
  addToCart(ctx, "u2", "P1", 1);
  const cart = removeItem(ctx, "u1", "P1");
  assert.deepEqual(cart.items, []);
  assert.equal(cart.totalAmount, 0);
  assert.deepEqual(getCart(ctx, "u1"), { userId: "u1", items: [], totalAmount: 0 });
  assert.deepEqual(getCart(ctx, "u2"), {
    userId: "u2",
    items: [{ productId: "P1", name: "무선 마우스", unitPrice: 15000, quantity: 1, lineTotal: 15000 }],
    totalAmount: 15000,
  });
});

test("[TC-C-46] 장바구니를 만든 적 없는 구매자의 getCart는 빈 장바구니를 반환한다", () => {
  const ctx = fresh();
  assert.deepEqual(getCart(ctx, "u1"), {
    userId: "u1",
    items: [],
    totalAmount: 0,
  });
});

test("[TC-C-47] getCart는 담은 순서와 여러 상품의 소계 및 합계를 반환한다", () => {
  const ctx = fresh();
  addToCart(ctx, "u1", "P2", 2);
  addToCart(ctx, "u1", "P1", 2);
  assert.deepEqual(getCart(ctx, "u1"), {
    userId: "u1",
    items: [
      { productId: "P2", name: "기계식 키보드", unitPrice: 59000, quantity: 2, lineTotal: 118000 },
      { productId: "P1", name: "무선 마우스", unitPrice: 15000, quantity: 2, lineTotal: 30000 },
    ],
    totalAmount: 148000,
  });
});

test("[TC-C-48] getCart 반환 객체를 수정해도 다음 조회 결과는 바뀌지 않는다", () => {
  const ctx = fresh();
  addToCart(ctx, "u1", "P1", 2);
  const returnedCart = getCart(ctx, "u1");
  returnedCart.userId = "u2";
  returnedCart.items[0].quantity = 99;
  returnedCart.items[0].lineTotal = 1485000;
  returnedCart.totalAmount = 1485000;
  assert.deepEqual(getCart(ctx, "u1"), {
    userId: "u1",
    items: [{ productId: "P1", name: "무선 마우스", unitPrice: 15000, quantity: 2, lineTotal: 30000 }],
    totalAmount: 30000,
  });
});

test("[TC-C-49] 같은 상품을 다시 담아도 처음 담은 순서가 유지되고 수량이 합산된다", () => {
  const ctx = fresh();
  addToCart(ctx, "u1", "P1", 1);
  addToCart(ctx, "u1", "P2", 1);
  addToCart(ctx, "u1", "P1", 1);
  assert.deepEqual(getCart(ctx, "u1"), {
    userId: "u1",
    items: [
      { productId: "P1", name: "무선 마우스", unitPrice: 15000, quantity: 2, lineTotal: 30000 },
      { productId: "P2", name: "기계식 키보드", unitPrice: 59000, quantity: 1, lineTotal: 59000 },
    ],
    totalAmount: 89000,
  });
});

test("[TC-C-50] u1의 장바구니가 있어도 u2의 getCart는 빈 장바구니를 반환한다", () => {
  const ctx = fresh();
  addToCart(ctx, "u1", "P1", 1);
  assert.deepEqual(getCart(ctx, "u2"), {
    userId: "u2",
    items: [],
    totalAmount: 0,
  });
});
