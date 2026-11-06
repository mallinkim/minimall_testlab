// [불안정 테스트 B] 가끔 실패한다. 원인을 찾아 항상 같은 결과가 나오도록 고친다.
const test = require("node:test");
const assert = require("node:assert/strict");
const { createContext, createFakeClock, seedOrder } = require("../src/testkit");
const { expirePendingOrders } = require("../src/expiry");
const { jitter } = require("./_chaos");

const THIRTY_MS_IN_MINUTES = 30 / 60000; // 30밀리초

test("30밀리초가 지난 결제대기 주문은 자동 취소된다", async () => {
  const clock = createFakeClock();
  const ctx = createContext({ clock });
  const o = seedOrder(ctx);
  clock.advance(30);
  await jitter(30); // 바쁜 서버 흉내
  const ids = expirePendingOrders(ctx, { timeoutMinutes: THIRTY_MS_IN_MINUTES });
  assert.deepEqual(ids, [o.id]);
});

test("방금 만든 주문은 아직 자동 취소되지 않는다", async () => {
  const clock = createFakeClock();
  const ctx = createContext({ clock });
  seedOrder(ctx);
  clock.advance(29);
  await jitter(40); // 바쁜 서버 흉내
  const ids = expirePendingOrders(ctx, { timeoutMinutes: THIRTY_MS_IN_MINUTES });
  assert.deepEqual(ids, []);
});
