// [불안정 테스트 C] 가끔 실패한다. 원인을 찾아 항상 같은 결과가 나오도록 고친다.
const { describe, test } = require("node:test");
const assert = require("node:assert/strict");
const { createContext } = require("../src/testkit");
const { addToCart } = require("../src/cart");
const { createOrder } = require("../src/order");

describe("주문번호는 순서대로 발급된다", () => {
  test("첫 번째 구매자의 주문번호는 ORD-0001", () => {
    const ctx = createContext();
    addToCart(ctx, "u1", "P1", 1);
    const order = createOrder(ctx, "u1", { address: "서울시 중구" });
    assert.equal(order.id, "ORD-0001");
  });

  test("두 번째 구매자의 주문번호는 ORD-0002", () => {
    const ctx = createContext();
    addToCart(ctx, "u1", "P1", 1);
    createOrder(ctx, "u1", { address: "서울시 중구" });
    addToCart(ctx, "u2", "P1", 1);
    const order = createOrder(ctx, "u2", { address: "부산시 해운대구" });
    assert.equal(order.id, "ORD-0002");
  });
});
