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

// 근거: API_CONTRACT.md 143줄, SRS US-09 49줄.
test("[TC-Q-02a] 시각이 다른 주문은 최신순으로 반환한다", () => {
	const clock = createFakeClock("2026-10-28T09:00:00.000Z");
	const ctx = fresh({ clock });
	seedOrder(ctx, { deductStock: false });
	clock.advanceMinutes(1);
	seedOrder(ctx, { deductStock: false });
	clock.advanceMinutes(1);
	seedOrder(ctx, { deductStock: false });

	const result = listOrders(ctx, "u1");
	assert.deepEqual(result.items.map((item) => item.orderId), ["ORD-0003", "ORD-0002", "ORD-0001"]);
});

// 근거: API_CONTRACT.md 143줄.
test("[TC-Q-02b] 같은 시각이면 주문번호가 큰 주문을 먼저 반환한다", () => {
	const ctx = fresh({ clock: createFakeClock("2026-10-28T09:00:00.000Z") });
	seedOrder(ctx, { deductStock: false });
	seedOrder(ctx, { deductStock: false });

	const result = listOrders(ctx, "u1");
	assert.deepEqual(result.items.map((item) => item.orderId), ["ORD-0002", "ORD-0001"]);
});

// 근거: API_CONTRACT.md 144줄.
test("[TC-Q-02c] 기본 페이지는 10건을 반환하고 전체 건수와 양끝 주문을 표시한다", () => {
	const ctx = fresh({ clock: createFakeClock("2026-10-28T09:00:00.000Z") });
	for (let index = 0; index < 11; index += 1) {
		seedOrder(ctx, { deductStock: false });
	}

	const result = listOrders(ctx, "u1");
	assert.equal(result.page, 1);
	assert.equal(result.pageSize, 10);
	assert.equal(result.total, 11);
	assert.equal(result.items.length, 10);
	assert.equal(result.items[0].orderId, "ORD-0011");
	assert.equal(result.items[9].orderId, "ORD-0002");
});

// 근거: API_CONTRACT.md 144줄.
test("[TC-Q-02d] 11건 중 두 번째 페이지에는 마지막 주문 한 건이 나온다", () => {
	const ctx = fresh({ clock: createFakeClock("2026-10-28T09:00:00.000Z") });
	for (let index = 0; index < 11; index += 1) {
		seedOrder(ctx, { deductStock: false });
	}

	const result = listOrders(ctx, "u1", { page: 2, pageSize: 10 });
	assert.equal(result.page, 2);
	assert.equal(result.pageSize, 10);
	assert.equal(result.total, 11);
	assert.deepEqual(result.items.map((item) => item.orderId), ["ORD-0001"]);
});

// 근거: API_CONTRACT.md 144줄.
test("[TC-Q-02e] 범위를 벗어난 페이지의 items는 빈 배열이다", () => {
	const ctx = fresh({ clock: createFakeClock("2026-10-28T09:00:00.000Z") });
	for (let index = 0; index < 11; index += 1) {
		seedOrder(ctx, { deductStock: false });
	}

	const result = listOrders(ctx, "u1", { page: 3, pageSize: 10 });
	assert.equal(result.page, 3);
	assert.equal(result.pageSize, 10);
	assert.equal(result.total, 11);
	assert.deepEqual(result.items, []);
});

// 근거: API_CONTRACT.md 145줄. 잡는 결함: 한 종류 주문에 " 외 0건"을 붙이는 결함.
test("[TC-Q-02f] 한 종류 상품의 대표 상품명은 상품명 그대로다", () => {
	const ctx = fresh({ clock: createFakeClock("2026-10-28T09:00:00.000Z") });
	seedOrder(ctx, { items: [["P1", 2]], deductStock: false });

	const result = listOrders(ctx, "u1");
	assert.equal(result.items[0].representativeName, "무선 마우스");
});

// 근거: API_CONTRACT.md 145줄.
test("[TC-Q-02g] 두 종류 상품의 대표 상품명과 목록 항목 전체를 반환한다", () => {
	const ctx = fresh({ clock: createFakeClock("2026-10-28T09:00:00.000Z") });
	seedOrder(ctx, { items: [["P1", 2], ["P2", 1]], deductStock: false });

	const result = listOrders(ctx, "u1");
	assert.deepEqual(result.items[0], {
		orderId: "ORD-0001",
		createdAt: "2026-10-28T09:00:00.000Z",
		representativeName: "무선 마우스 외 1건",
		totalAmount: 89000,
		status: "PENDING_PAYMENT",
	});
});

// 근거: API_CONTRACT.md 145줄.
test("[TC-Q-02h] 세 종류 상품의 대표 상품명에는 나머지 두 종류 수가 붙는다", () => {
	const ctx = fresh({ clock: createFakeClock("2026-10-28T09:00:00.000Z") });
	seedOrder(ctx, { items: [["P1", 1], ["P2", 1], ["P5", 1]], deductStock: false });

	const result = listOrders(ctx, "u1");
	assert.equal(result.items[0].representativeName, "무선 마우스 외 2건");
});

// 근거: API_CONTRACT.md 146줄.
test("[TC-Q-02i] u1의 목록에는 u2의 주문이 포함되지 않는다", () => {
	const ctx = fresh({ clock: createFakeClock("2026-10-28T09:00:00.000Z") });
	seedOrder(ctx, { userId: "u2", deductStock: false });
	seedOrder(ctx, { userId: "u1", deductStock: false });

	const result = listOrders(ctx, "u1");
	assert.equal(result.total, 1);
	assert.deepEqual(result.items.map((item) => item.orderId), ["ORD-0002"]);
});

// 근거: API_CONTRACT.md 144, 146줄, SRS US-09 50줄. items: []는 계약을 따른 팀 가정.
test("[TC-Q-02j] 주문이 없는 사용자의 목록은 빈 결과다", () => {
	const ctx = fresh({ clock: createFakeClock("2026-10-28T09:00:00.000Z") });
	seedOrder(ctx, { userId: "u2", deductStock: false });

	const result = listOrders(ctx, "u1");
	assert.equal(result.page, 1);
	assert.equal(result.pageSize, 10);
	assert.equal(result.total, 0);
	assert.deepEqual(result.items, []);
});

// 근거: API_CONTRACT.md 144줄.
test("[TC-Q-02k] 정확히 10건이면 두 번째 페이지는 빈 배열이다", () => {
	const ctx = fresh({ clock: createFakeClock("2026-10-28T09:00:00.000Z") });
	for (let index = 0; index < 10; index += 1) {
		seedOrder(ctx, { deductStock: false });
	}

	const result = listOrders(ctx, "u1", { page: 2, pageSize: 10 });
	assert.equal(result.page, 2);
	assert.equal(result.pageSize, 10);
	assert.equal(result.total, 10);
	assert.deepEqual(result.items, []);
});

test.todo("[TC-E-01] TODO: 자동 취소 — 경계 시각 · 여러 건 · 재고 복원");
