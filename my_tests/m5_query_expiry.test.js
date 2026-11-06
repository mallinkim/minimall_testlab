// Mission 5 — 주문 조회 · 자동 취소 테스트, 변이 생존자를 죽이는 테스트
const test = require("node:test");
const assert = require("node:assert/strict");
const { seedOrder, createFakeClock } = require("../src/testkit");
const { getOrderDetail, listOrders } = require("../src/orderQuery");
const { expirePendingOrders } = require("../src/expiry");
const { expectCode, fresh } = require("./_helpers");

// 근거: API_CONTRACT.md 137줄(반환 형태), SRS US-09 49줄(정상).
test("[TC-Q-01a] 주문 상세는 본인 주문의 모든 필드를 반환한다", () => {
	const clock = createFakeClock("2026-10-28T09:00:00.000Z");
	const ctx = fresh({ clock });
	const order = seedOrder(ctx, {
		items: [["P1", 2], ["P2", 1]],
		address: "서울시",
	});

	const detail = getOrderDetail(ctx, "u1", order.id);
	// P1: 15000 × 2 = 30000, P2: 59000 × 1 = 59000, 합계: 30000 + 59000 = 89000.
	assert.deepEqual(detail, {
		id: "ORD-0001",
		status: "PENDING_PAYMENT",
		createdAt: "2026-10-28T09:00:00.000Z",
		address: "서울시",
		items: [
			{ productId: "P1", name: "무선 마우스", unitPrice: 15000, quantity: 2, lineTotal: 30000 },
			{ productId: "P2", name: "기계식 키보드", unitPrice: 59000, quantity: 1, lineTotal: 59000 },
		],
		totalAmount: 89000,
	});
});

// 잡는 결함: 남의 주문을 조회 가능하게 하거나 NOT_FOUND 대신 FORBIDDEN으로 존재를 노출하는 결함.
test("[TC-Q-01b] 남의 주문 상세 조회는 NOT_FOUND다", () => {
	const ctx = fresh({ clock: createFakeClock() });
	const order = seedOrder(ctx, { userId: "u1" });

	expectCode(() => getOrderDetail(ctx, "u2", order.id), "NOT_FOUND");
});

// 잡는 결함: 존재하지 않는 주문을 성공 처리하거나 계약과 다른 오류 코드로 응답하는 결함.
test("[TC-Q-01c] 없는 주문 상세 조회는 NOT_FOUND다", () => {
	const ctx = fresh({ clock: createFakeClock() });
	seedOrder(ctx, { userId: "u1" });

	// ORD-9999는 주문 ID 형식에 맞고, 이 컨텍스트의 ORD-0001과 겹치지 않는다.
	expectCode(() => getOrderDetail(ctx, "u1", "ORD-9999"), "NOT_FOUND");
});

// 근거: API_CONTRACT.md 142줄(주문 시점 값).
test("[TC-Q-01d] 주문 뒤 상품 가격이 바뀌어도 주문 시점 금액을 반환한다", () => {
	const ctx = fresh({ clock: createFakeClock() });
	const order = seedOrder(ctx, { items: [["P1", 2]], userId: "u1" });

	// 계약이 저장소 구조를 공개해 허용, 17000과 직접 가격 변경 방식은 팀 가정.
	ctx.store.products.get("P1").price = 17000;

	const detail = getOrderDetail(ctx, "u1", order.id);
	assert.equal(detail.items[0].unitPrice, 15000);
	assert.equal(detail.items[0].quantity, 2);
	// lineTotal은 주문 시점 단가 15000 × 2 = 30000, totalAmount도 그 합계 30000.
	assert.equal(detail.items[0].lineTotal, 30000);
	assert.equal(detail.totalAmount, 30000);
});

// 근거: API_CONTRACT.md 35줄(products Map), 142줄(주문 시점 값).
test("[TC-Q-01e] 주문 뒤 상품이 삭제되어도 주문 시점 상품 정보와 금액을 반환한다", () => {
	const ctx = fresh({ clock: createFakeClock() });
	const order = seedOrder(ctx, { items: [["P2", 1]], userId: "u1" });

	// 계약이 저장소 구조를 공개해 허용, 상품 삭제 방식은 팀 가정.
	ctx.store.products.delete("P2");

	const detail = getOrderDetail(ctx, "u1", order.id);
	assert.deepEqual(detail.items, [{
		productId: "P2",
		name: "기계식 키보드",
		unitPrice: 59000,
		quantity: 1,
		lineTotal: 59000,
	}]);
	// lineTotal은 주문 시점 단가 59000 × 1 = 59000, totalAmount는 항목 합계 59000.
	assert.equal(detail.totalAmount, 59000);
});

test("[TC-Q-01f] 주문 상세 반환값을 수정해도 저장된 주문은 바뀌지 않는다", () => {
	const clock = createFakeClock("2026-10-28T09:00:00.000Z");
	const ctx = fresh({ clock });
	const order = seedOrder(ctx, {
		items: [["P1", 1]],
		address: "서울시",
	});

	const firstDetail = getOrderDetail(ctx, "u1", order.id);
	firstDetail.address = "변경된 주소";
	firstDetail.items[0].name = "변경된 상품명";
	firstDetail.items[0].quantity = 9;
	firstDetail.items[0].lineTotal = 135000;
	firstDetail.totalAmount = 135000;

	assert.deepEqual(getOrderDetail(ctx, "u1", order.id), {
		id: "ORD-0001",
		status: "PENDING_PAYMENT",
		createdAt: "2026-10-28T09:00:00.000Z",
		address: "서울시",
		items: [{
			productId: "P1",
			name: "무선 마우스",
			unitPrice: 15000,
			quantity: 1,
			lineTotal: 15000,
		}],
		totalAmount: 15000,
	});
});

test.todo("[TC-Q-02] TODO: 주문 목록 — 정렬 · 페이지 · 대표 상품명");
test.todo("[TC-E-01] TODO: 자동 취소 — 경계 시각 · 여러 건 · 재고 복원");
