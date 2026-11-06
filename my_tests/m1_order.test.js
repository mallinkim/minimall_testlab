// Mission 1 — 주문 생성 · 상태 전이 테스트
const test = require("node:test");
const assert = require("node:assert/strict");
const { addToCart, getCart } = require("../src/cart");
const { createOrder, canTransition, changeStatus } = require("../src/order");
const { createFakeClock } = require("../src/testkit");
const { expectCode, fresh } = require("./_helpers");

test("[TC-O-01] 두 상품 주문 성공", () => {
  const ctx = fresh({ clock: createFakeClock() });
  addToCart(ctx, "u1", "P1", 2);
  addToCart(ctx, "u1", "P2", 1);
  const order = createOrder(ctx, "u1", { address: "서울시 중구 세종대로 110" });
  assert.equal(order.id, "ORD-0001");
  assert.equal(order.userId, "u1");
  assert.equal(order.status, "PENDING_PAYMENT");
  assert.deepEqual(order.items, [
    { productId: "P1", name: "무선 마우스", unitPrice: 15000, quantity: 2 },
    { productId: "P2", name: "기계식 키보드", unitPrice: 59000, quantity: 1 },
  ]);
  assert.equal(order.totalAmount, 2 * 15000 + 59000);
  assert.equal(ctx.store.products.get("P1").stock, 8);
  assert.equal(ctx.store.products.get("P2").stock, 2);
  assert.deepEqual(getCart(ctx, "u1"), { userId: "u1", items: [], totalAmount: 0 });
  assert.equal(order.createdAt, ctx.clock.now().toISOString());
});

test("[TC-O-02] 재고와 주문 수량이 정확히 일치", () => {
  const ctx = fresh();
  addToCart(ctx, "u1", "P5", 1);

  const order = createOrder(ctx, "u1", { address: "서울시 중구 세종대로 110" });

  assert.equal(order.totalAmount, 1 * 25000);
  assert.equal(ctx.store.products.get("P5").stock, 0);
  assert.deepEqual(getCart(ctx, "u1"), { userId: "u1", items: [], totalAmount: 0 });
});

test("[TC-O-03] 배송지 앞뒤 공백 제거", () => {
  const ctx = fresh();
  addToCart(ctx, "u1", "P1", 1);
  const order = createOrder(ctx, "u1", { address: "  서울시 중구 세종대로 110  " });

  assert.equal(order.address, "서울시 중구 세종대로 110");
  assert.equal(order.totalAmount, 1 * 15000);
});

test("[TC-O-04] 빈 배송지 거부 시 장바구니·재고 불변", () => {
  const ctx = fresh();
  addToCart(ctx, "u1", "P1", 1);
  const cartBefore = getCart(ctx, "u1");
  const stockBefore = ctx.store.products.get("P1").stock;

  expectCode(() => createOrder(ctx, "u1", { address: "" }), "INVALID_ADDRESS");

  assert.deepEqual(getCart(ctx, "u1"), cartBefore);
  assert.equal(ctx.store.products.get("P1").stock, stockBefore);
  assert.equal(ctx.store.orders.size, 0);
});

test("[TC-O-05] 공백뿐인 배송지 거부 시 장바구니·재고 불변", () => {
  const ctx = fresh();
  addToCart(ctx, "u1", "P1", 1);
  const cartBefore = getCart(ctx, "u1");
  const stockBefore = ctx.store.products.get("P1").stock;

  expectCode(() => createOrder(ctx, "u1", { address: "   " }), "INVALID_ADDRESS");

  assert.deepEqual(getCart(ctx, "u1"), cartBefore);
  assert.equal(ctx.store.products.get("P1").stock, stockBefore);
  assert.equal(ctx.store.orders.size, 0);
});

test("[TC-O-06] 배송지 누락 시 장바구니·재고 불변", () => {
  const ctx = fresh();
  addToCart(ctx, "u1", "P1", 1);
  const cartBefore = getCart(ctx, "u1");
  const stockBefore = ctx.store.products.get("P1").stock;

  expectCode(() => createOrder(ctx, "u1", {}), "INVALID_ADDRESS");

  assert.deepEqual(getCart(ctx, "u1"), cartBefore);
  assert.equal(ctx.store.products.get("P1").stock, stockBefore);
  assert.equal(ctx.store.orders.size, 0);
});

test("[TC-O-07] 문자열이 아닌 배송지 거부 시 장바구니·재고 불변", () => {
  const ctx = fresh();
  addToCart(ctx, "u1", "P1", 1);
  const cartBefore = getCart(ctx, "u1");
  const stockBefore = ctx.store.products.get("P1").stock;

  expectCode(() => createOrder(ctx, "u1", { address: null }), "INVALID_ADDRESS");

  assert.deepEqual(getCart(ctx, "u1"), cartBefore);
  assert.equal(ctx.store.products.get("P1").stock, stockBefore);
  assert.equal(ctx.store.orders.size, 0);
});

test("[TC-O-08] 빈 장바구니 주문 거부", () => {
  const ctx = fresh();
  const stocksBefore = [...ctx.store.products].map(([productId, product]) => [productId, product.stock]);

  expectCode(() => createOrder(ctx, "u1", { address: "서울시 중구 세종대로 110" }), "EMPTY_CART");

  assert.deepEqual(
    [...ctx.store.products].map(([productId, product]) => [productId, product.stock]),
    stocksBefore,
  );
  assert.equal(ctx.store.orders.size, 0);
  addToCart(ctx, "u1", "P1", 1);
  const order = createOrder(ctx, "u1", { address: "서울시 중구 세종대로 110" });
  assert.equal(order.id, "ORD-0001");
  assert.equal(order.totalAmount, 1 * 15000);
});

test("[TC-O-09] 재고가 요청량보다 부족", () => {
  const ctx = fresh();
  addToCart(ctx, "u1", "P1", 2);
  ctx.store.products.get("P1").stock = 1;
  const cartBefore = getCart(ctx, "u1");

  const error = expectCode(
    () => createOrder(ctx, "u1", { address: "서울시 중구 세종대로 110" }),
    "OUT_OF_STOCK",
  );

  assert.deepEqual(error.details.shortages, [
    { productId: "P1", name: "무선 마우스", requested: 2, available: 1 },
  ]);
  assert.deepEqual(getCart(ctx, "u1"), cartBefore);
  assert.equal(ctx.store.products.get("P1").stock, 1);
  assert.equal(ctx.store.orders.size, 0);
});

test("[TC-O-10] 판매 중지 상품 부족 처리", () => {
  const ctx = fresh();
  addToCart(ctx, "u1", "P1", 1);
  ctx.store.products.get("P1").status = "STOPPED";
  const cartBefore = getCart(ctx, "u1");
  const stockBefore = ctx.store.products.get("P1").stock;

  const error = expectCode(
    () => createOrder(ctx, "u1", { address: "서울시 중구 세종대로 110" }),
    "OUT_OF_STOCK",
  );

  assert.deepEqual(error.details.shortages, [
    { productId: "P1", name: "무선 마우스", requested: 1, available: 0 },
  ]);
  assert.deepEqual(getCart(ctx, "u1"), cartBefore);
  assert.equal(ctx.store.products.get("P1").stock, stockBefore);
  assert.equal(ctx.store.orders.size, 0);
});

test("[TC-O-11] 한 상품만 부족해도 전체 주문 거부", () => {
  const ctx = fresh();
  addToCart(ctx, "u1", "P1", 1);
  addToCart(ctx, "u1", "P2", 1);
  ctx.store.products.get("P2").stock = 0;
  const cartBefore = getCart(ctx, "u1");

  const error = expectCode(
    () => createOrder(ctx, "u1", { address: "서울시 중구 세종대로 110" }),
    "OUT_OF_STOCK",
  );

  assert.equal(error.details.shortages.length, 1);
  assert.deepEqual(error.details.shortages, [
    { productId: "P2", name: "기계식 키보드", requested: 1, available: 0 },
  ]);
  assert.deepEqual(getCart(ctx, "u1"), cartBefore);
  assert.equal(ctx.store.products.get("P1").stock, 10);
  assert.equal(ctx.store.products.get("P2").stock, 0);
  assert.equal(ctx.store.orders.size, 0);
});

test("[TC-O-12] 실패 후 첫 성공 주문번호 확인", () => {
  const ctx = fresh();
  addToCart(ctx, "u1", "P1", 1);
  ctx.store.products.get("P1").stock = 0;

  const error = expectCode(
    () => createOrder(ctx, "u1", { address: "서울시 중구 세종대로 110" }),
    "OUT_OF_STOCK",
  );

  assert.deepEqual(error.details.shortages, [
    { productId: "P1", name: "무선 마우스", requested: 1, available: 0 },
  ]);
  assert.equal(ctx.store.orders.size, 0);
  assert.deepEqual(getCart(ctx, "u1"), {
    userId: "u1",
    items: [{ productId: "P1", name: "무선 마우스", unitPrice: 15000, quantity: 1, lineTotal: 15000 }],
    totalAmount: 15000,
  });
  ctx.store.products.get("P1").stock = 1;

  const order = createOrder(ctx, "u1", { address: "서울시 중구 세종대로 110" });

  assert.equal(order.id, "ORD-0001");
  assert.equal(order.totalAmount, 1 * 15000);
});

test("[TC-O-13] 다른 구매자의 장바구니는 비우지 않음", () => {
  const ctx = fresh();
  addToCart(ctx, "u1", "P1", 1);
  addToCart(ctx, "u2", "P2", 1);

  const order = createOrder(ctx, "u1", { address: "서울시 중구 세종대로 110" });

  assert.equal(order.userId, "u1");
  assert.equal(order.totalAmount, 1 * 15000);
  assert.deepEqual(getCart(ctx, "u1"), { userId: "u1", items: [], totalAmount: 0 });
  assert.deepEqual(getCart(ctx, "u2"), {
    userId: "u2",
    items: [{ productId: "P2", name: "기계식 키보드", unitPrice: 59000, quantity: 1, lineTotal: 59000 }],
    totalAmount: 59000,
  });
  assert.equal(ctx.store.products.get("P1").stock, 9);
  assert.equal(ctx.store.products.get("P2").stock, 3);
});

test("[TC-O-14] 주문 시점의 상품 정보 유지", () => {
  const ctx = fresh();
  addToCart(ctx, "u1", "P1", 2);
  const order = createOrder(ctx, "u1", { address: "서울시 중구 세종대로 110" });
  ctx.store.products.get("P1").price = ctx.store.products.get("P2").price;

  const storedOrder = ctx.store.orders.get(order.id);
  assert.deepEqual(storedOrder.items, [
    { productId: "P1", name: "무선 마우스", unitPrice: 15000, quantity: 2 },
  ]);
  assert.equal(storedOrder.totalAmount, 2 * 15000);
});

test("[TC-O-15] 반환 주문은 저장 주문의 복사본", () => {
  const ctx = fresh();
  addToCart(ctx, "u1", "P1", 2);
  const order = createOrder(ctx, "u1", { address: "서울시 중구 세종대로 110" });
  order.address = "변경된 주소";
  order.totalAmount = 0;
  order.items[0].quantity = 99;

  const storedOrder = ctx.store.orders.get(order.id);
  assert.equal(storedOrder.address, "서울시 중구 세종대로 110");
  assert.equal(storedOrder.totalAmount, 2 * 15000);
  assert.deepEqual(storedOrder.items, [
    { productId: "P1", name: "무선 마우스", unitPrice: 15000, quantity: 2 },
  ]);
});

test("[TC-O-16] 성공 주문번호 순차 발급", () => {
  const ctx = fresh();
  addToCart(ctx, "u1", "P1", 1);
  const firstOrder = createOrder(ctx, "u1", { address: "서울시 중구 세종대로 110" });
  addToCart(ctx, "u1", "P2", 1);
  const secondOrder = createOrder(ctx, "u1", { address: "서울시 중구 세종대로 110" });

  assert.equal(firstOrder.id, "ORD-0001");
  assert.equal(firstOrder.totalAmount, 1 * 15000);
  assert.equal(secondOrder.id, "ORD-0002");
  assert.equal(secondOrder.totalAmount, 1 * 59000);
});

test("[TC-O-17] 마지막 재고를 순차 주문", () => {
  const ctx = fresh();
  addToCart(ctx, "u1", "P5", 1);
  addToCart(ctx, "u2", "P5", 1);
  const firstOrder = createOrder(ctx, "u1", { address: "서울시 중구 세종대로 110" });
  assert.equal(firstOrder.totalAmount, 1 * 25000);

  const error = expectCode(
    () => createOrder(ctx, "u2", { address: "서울시 중구 세종대로 110" }),
    "OUT_OF_STOCK",
  );

  assert.deepEqual(error.details.shortages, [
    { productId: "P5", name: "모니터 받침대", requested: 1, available: 0 },
  ]);
  assert.equal(ctx.store.products.get("P5").stock, 0);
  assert.equal(ctx.store.orders.size, 1);
});

test("[TC-O-18] 부족 상품 두 개를 shortages에 장바구니 순서대로 반환한다", () => {
  const ctx = fresh();
  addToCart(ctx, "u1", "P2", 2);
  addToCart(ctx, "u1", "P1", 2);
  ctx.store.products.get("P2").stock = 1;
  ctx.store.products.get("P1").stock = 1;
  const cartBefore = getCart(ctx, "u1");

  const error = expectCode(
    () => createOrder(ctx, "u1", { address: "서울시 중구 세종대로 110" }),
    "OUT_OF_STOCK",
  );

  assert.equal(error.details.shortages.length, 2);
  assert.deepEqual(error.details.shortages, [
    { productId: "P2", name: "기계식 키보드", requested: 2, available: 1 },
    { productId: "P1", name: "무선 마우스", requested: 2, available: 1 },
  ]);
  assert.deepEqual(getCart(ctx, "u1"), cartBefore);
  assert.equal(ctx.store.products.get("P2").stock, 1);
  assert.equal(ctx.store.products.get("P1").stock, 1);
  assert.equal(ctx.store.orders.size, 0);
});

test.todo("[TC-O-19] TODO: 상태 전이표 전체(허용 · 거부)와 오류 코드");
