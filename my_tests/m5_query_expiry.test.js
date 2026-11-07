// Mission 5 — 주문 조회 · 자동 취소 테스트, 변이 생존자를 죽이는 테스트
const test = require("node:test");
const assert = require("node:assert/strict");
const { seedOrder, createFakeClock } = require("../src/testkit");
const { getOrderDetail, listOrders } = require("../src/orderQuery");
const { expirePendingOrders } = require("../src/expiry");
const { payOrder } = require("../src/payment");
const { cancelOrder } = require("../src/cancel");
const { expectCode, expectRejectCode, fresh } = require("./_helpers");

function createImmediateRefundPg(responses) {
	const pg = {
		refunds: [],
		async refund(request) {
			pg.refunds.push({ ...request });
			const response = responses.shift();
			if (response instanceof Error) throw response;
			return response;
		},
	};
	return pg;
}

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

// 근거: API_CONTRACT.md 153줄.
// 잡는 결함: 결제된 주문을 시간이 지났다고 취소하거나 재고를 복원하는 결함.
test("[TC-E-01a] 시간이 지난 PAID 주문은 건드리지 않는다", () => {
	const clock = createFakeClock("2026-10-28T09:00:00.000Z");
	const ctx = fresh({ clock });
	const order = seedOrder(ctx, { status: "PAID", deductStock: true });
	clock.advanceMinutes(31);

	assert.deepEqual(expirePendingOrders(ctx), []);
	assert.equal(ctx.store.orders.get(order.id).status, "PAID");
	assert.equal(ctx.store.products.get("P1").stock, 9);
});

// 근거: API_CONTRACT.md 153줄.
// 잡는 결함: 준비 중인 주문을 시간이 지났다고 취소하거나 재고를 복원하는 결함.
test("[TC-E-01b] 시간이 지난 PREPARING 주문은 건드리지 않는다", () => {
	const clock = createFakeClock("2026-10-28T09:00:00.000Z");
	const ctx = fresh({ clock });
	const order = seedOrder(ctx, { status: "PREPARING", deductStock: true });
	clock.advanceMinutes(31);

	assert.deepEqual(expirePendingOrders(ctx), []);
	assert.equal(ctx.store.orders.get(order.id).status, "PREPARING");
	assert.equal(ctx.store.products.get("P1").stock, 9);
});

// 근거: API_CONTRACT.md 153줄.
// 잡는 결함: 배송 중인 주문을 시간이 지났다고 취소하거나 재고를 복원하는 결함.
test("[TC-E-01c] 시간이 지난 SHIPPING 주문은 건드리지 않는다", () => {
	const clock = createFakeClock("2026-10-28T09:00:00.000Z");
	const ctx = fresh({ clock });
	const order = seedOrder(ctx, { status: "SHIPPING", deductStock: true });
	clock.advanceMinutes(31);

	assert.deepEqual(expirePendingOrders(ctx), []);
	assert.equal(ctx.store.orders.get(order.id).status, "SHIPPING");
	assert.equal(ctx.store.products.get("P1").stock, 9);
});

// 근거: API_CONTRACT.md 153줄.
// 잡는 결함: 배송 완료 주문을 시간이 지났다고 취소하거나 재고를 복원하는 결함.
test("[TC-E-01d] 시간이 지난 DELIVERED 주문은 건드리지 않는다", () => {
	const clock = createFakeClock("2026-10-28T09:00:00.000Z");
	const ctx = fresh({ clock });
	const order = seedOrder(ctx, { status: "DELIVERED", deductStock: true });
	clock.advanceMinutes(31);

	assert.deepEqual(expirePendingOrders(ctx), []);
	assert.equal(ctx.store.orders.get(order.id).status, "DELIVERED");
	assert.equal(ctx.store.products.get("P1").stock, 9);
});

// 근거: API_CONTRACT.md 153줄.
// 잡는 결함: 이미 취소된 주문을 다시 처리해 재고를 복원하는 결함.
test("[TC-E-01e] 시간이 지난 CANCELED 주문은 건드리지 않는다", () => {
	const clock = createFakeClock("2026-10-28T09:00:00.000Z");
	const ctx = fresh({ clock });
	const order = seedOrder(ctx, { status: "CANCELED", deductStock: false });
	clock.advanceMinutes(31);

	assert.deepEqual(expirePendingOrders(ctx), []);
	assert.equal(ctx.store.orders.get(order.id).status, "CANCELED");
	assert.equal(ctx.store.products.get("P1").stock, 10);
});

// 근거: API_CONTRACT.md 150, 152줄.
test("[TC-E-01f] 30분 이상 지난 PENDING_PAYMENT 주문을 취소하고 재고를 복원한다", () => {
	const clock = createFakeClock("2026-10-28T09:00:00.000Z");
	const ctx = fresh({ clock });
	const order = seedOrder(ctx, { deductStock: true });
	clock.advanceMinutes(31);

	assert.deepEqual(expirePendingOrders(ctx), ["ORD-0001"]);
	assert.equal(ctx.store.orders.get(order.id).status, "CANCELED");
	assert.equal(ctx.store.products.get("P1").stock, 10);
});

// 근거: API_CONTRACT.md 150, 152줄.
test("[TC-E-01g] 취소된 주문번호를 오름차순으로 반환한다", () => {
	const clock = createFakeClock("2026-10-28T09:00:00.000Z");
	const ctx = fresh({ clock });
	seedOrder(ctx, { deductStock: false });
	clock.advanceMinutes(1);
	seedOrder(ctx, { deductStock: false });
	clock.advanceMinutes(1);
	seedOrder(ctx, { deductStock: false });
	clock.advanceMinutes(33);

	assert.equal(ctx.store.products.get("P1").stock, 10);
	assert.deepEqual(expirePendingOrders(ctx), ["ORD-0001", "ORD-0002", "ORD-0003"]);
});

// 근거: API_CONTRACT.md 152줄.
test("[TC-E-01h] 만료된 주문만 취소하고 아직 유효한 주문은 유지한다", () => {
	const clock = createFakeClock("2026-10-28T09:00:00.000Z");
	const ctx = fresh({ clock });
	const expiredOrder = seedOrder(ctx, { deductStock: true });
	clock.advanceMinutes(21);
	const pendingOrder = seedOrder(ctx, { deductStock: true });
	clock.advanceMinutes(10);

	assert.deepEqual(expirePendingOrders(ctx), ["ORD-0001"]);
	assert.equal(ctx.store.orders.get(expiredOrder.id).status, "CANCELED");
	assert.equal(ctx.store.orders.get(pendingOrder.id).status, "PENDING_PAYMENT");
	assert.equal(ctx.store.products.get("P1").stock, 9);
});

// 근거: API_CONTRACT.md 152줄.
test("[TC-E-01i] 취소 시 주문 수량만큼 재고를 복원한다", () => {
	const clock = createFakeClock("2026-10-28T09:00:00.000Z");
	const ctx = fresh({ clock });
	seedOrder(ctx, { items: [["P1", 2]], deductStock: true });
	clock.advanceMinutes(31);

	expirePendingOrders(ctx);
	assert.equal(ctx.store.products.get("P1").stock, 10);
});

// 근거: API_CONTRACT.md 153줄.
// 잡는 결함: 반복 호출에서 이미 취소된 주문의 재고를 중복 복원하는 결함.
test("[TC-E-01j] 반복 호출은 재고를 한 번만 복원한다", () => {
	const clock = createFakeClock("2026-10-28T09:00:00.000Z");
	const ctx = fresh({ clock });
	seedOrder(ctx, { deductStock: true });
	clock.advanceMinutes(31);

	assert.deepEqual(expirePendingOrders(ctx), ["ORD-0001"]);
	assert.deepEqual(expirePendingOrders(ctx), []);
	assert.equal(ctx.store.products.get("P1").stock, 10);
});

// 근거: API_CONTRACT.md 150, 152줄.
test("[TC-E-01k] 지정한 10분 제한 시간을 적용한다", () => {
	const clock = createFakeClock("2026-10-28T09:00:00.000Z");
	const ctx = fresh({ clock });
	const order = seedOrder(ctx, { deductStock: true });
	clock.advanceMinutes(11);

	assert.deepEqual(expirePendingOrders(ctx, { timeoutMinutes: 10 }), ["ORD-0001"]);
	assert.equal(ctx.store.orders.get(order.id).status, "CANCELED");
	assert.equal(ctx.store.products.get("P1").stock, 10);
});

// 근거: API_CONTRACT.md 150, 152줄.
test("[TC-E-01l] 60분 제한 시간에 아직 이른 주문은 유지한다", () => {
	const clock = createFakeClock("2026-10-28T09:00:00.000Z");
	const ctx = fresh({ clock });
	const order = seedOrder(ctx, { deductStock: true });
	clock.advanceMinutes(31);

	assert.deepEqual(expirePendingOrders(ctx, { timeoutMinutes: 60 }), []);
	assert.equal(ctx.store.orders.get(order.id).status, "PENDING_PAYMENT");
	assert.equal(ctx.store.products.get("P1").stock, 9);
});

// 근거: API_CONTRACT.md 35, 152줄.
// 팀 가정: 계약은 STOPPED 상품의 재고 복원 여부를 직접 정하지 않아 상태와 무관하게 복원한다고 해석한다.
// 잡는 결함: STOPPED 상품의 자동 취소에서 재고를 복원하지 않는 결함.
test("[TC-E-01m] STOPPED 상품의 만료 주문도 재고를 복원한다", () => {
	const clock = createFakeClock("2026-10-28T09:00:00.000Z");
	const ctx = fresh({ clock });
	const stockBeforeOrder = ctx.store.products.get("P1").stock;
	const order = seedOrder(ctx, { items: [["P1", 2]], deductStock: true });
	const stockAfterOrder = ctx.store.products.get("P1").stock;

	assert.equal(stockBeforeOrder, 10);
	assert.equal(stockAfterOrder, 8);
	ctx.store.products.get("P1").status = "STOPPED";
	assert.equal(ctx.store.products.get("P1").status, "STOPPED");
	assert.equal(ctx.store.products.get("P1").stock, 8);
	clock.advanceMinutes(31);

	assert.deepEqual(expirePendingOrders(ctx), ["ORD-0001"]);
	assert.equal(ctx.store.orders.get(order.id).status, "CANCELED");
	assert.equal(ctx.store.products.get("P1").stock, 10);
});

// 근거: API_CONTRACT.md 38, 39, 45, 117줄. 팀 가정: 서로 다른 결제 기록의 id는 달라야 한다.
// 잡는 결함: 카운터 증가가 삭제되어 서로 다른 주문의 결제 기록에 같은 id가 발급되는 결함.
test("[TC-P-19a] 서로 다른 주문의 결제 기록은 서로 다른 id를 가진다", async () => {
	const pg = {
		async charge() {
			return { ok: true, txId: "TX-P-19A" };
		},
	};
	const ctx = fresh({
		pg,
		clock: createFakeClock("2026-10-28T09:00:00.000Z"),
	});
	const firstOrder = seedOrder(ctx, { userId: "u1", deductStock: false });
	const secondOrder = seedOrder(ctx, { userId: "u1", deductStock: false });

	await payOrder(ctx, "u1", firstOrder.id);
	await payOrder(ctx, "u1", secondOrder.id);

	const firstPayments = ctx.store.payments.get(firstOrder.id);
	const secondPayments = ctx.store.payments.get(secondOrder.id);
	assert.equal(firstPayments.length, 1);
	assert.equal(secondPayments.length, 1);
	const firstId = firstPayments[0].id;
	const secondId = secondPayments[0].id;
	assert.equal(typeof firstId, "string");
	assert.equal(firstId.length > 0, true);
	assert.equal(typeof secondId, "string");
	assert.equal(secondId.length > 0, true);
	assert.notEqual(firstId, secondId);
});

// 근거: API_CONTRACT.md 129, 142줄. 팀 가정: 삭제 방식은 Map.delete이며, 삭제된 상품이 있어도 취소는 성공한다.
// 잡는 결함: 삭제된 상품의 재고를 복원하려다 TypeError가 나서 취소가 완료되지 않는 결함.
test("[TC-X-10a] 상품이 삭제된 단일 상품 주문도 취소된다", async () => {
	const ctx = fresh({ clock: createFakeClock("2026-10-28T09:00:00.000Z") });
	const order = seedOrder(ctx, { items: [["P2", 1]], deductStock: true });
	ctx.store.products.delete("P2");

	const result = await cancelOrder(ctx, "u1", order.id);

	assert.equal(result.order.status, "CANCELED");
	assert.equal(ctx.store.orders.get(order.id).status, "CANCELED");
});

// 근거: API_CONTRACT.md 129, 142줄. 팀 가정: 삭제 방식은 Map.delete이며, 삭제된 상품이 있어도 취소는 성공한다.
// 잡는 결함: 삭제된 상품의 재고를 복원하려다 TypeError가 나서 취소가 완료되지 않는 결함.
// 잡는 결함: 삭제된 상품을 만나면 중단해 뒤의 상품 재고를 복원하지 않는 결함.
test("[TC-X-10b] 삭제 상품 뒤에 있는 상품도 재고를 복원하며 취소된다", async () => {
	const ctx = fresh({ clock: createFakeClock("2026-10-28T09:00:00.000Z") });
	const order = seedOrder(ctx, {
		items: [["P2", 1], ["P1", 2]],
		deductStock: true,
	});
	ctx.store.products.delete("P2");

	const result = await cancelOrder(ctx, "u1", order.id);

	assert.equal(result.order.status, "CANCELED");
	assert.equal(ctx.store.orders.get(order.id).status, "CANCELED");
	assert.equal(ctx.store.products.get("P1").stock, 10);
});

// 근거: API_CONTRACT.md 35, 129줄.
// 팀 가정: 계약은 STOPPED 상품의 재고 복원 여부를 직접 정하지 않아 상태와 무관하게 복원한다고 해석한다.
// 잡는 결함: STOPPED 상품의 결제대기 취소에서 재고를 복원하지 않는 결함.
test("[TC-X-11a] STOPPED 상품의 결제대기 주문도 재고를 복원한다", async () => {
	const ctx = fresh({ clock: createFakeClock("2026-10-28T09:00:00.000Z") });
	const stockBeforeOrder = ctx.store.products.get("P1").stock;
	const order = seedOrder(ctx, { items: [["P1", 2]], deductStock: true });
	const stockAfterOrder = ctx.store.products.get("P1").stock;

	assert.equal(stockBeforeOrder, 10);
	assert.equal(stockAfterOrder, 8);
	ctx.store.products.get("P1").status = "STOPPED";
	assert.equal(ctx.store.products.get("P1").status, "STOPPED");
	assert.equal(ctx.store.products.get("P1").stock, 8);

	const result = await cancelOrder(ctx, "u1", order.id);

	assert.equal(result.order.status, "CANCELED");
	assert.equal(ctx.store.orders.get(order.id).status, "CANCELED");
	assert.equal(ctx.pg.refunds.length, 0);
	assert.equal(ctx.store.products.get("P1").stock, 10);
});

// 근거: API_CONTRACT.md 35, 130-131줄.
// 팀 가정: 계약은 STOPPED 상품의 재고 복원 여부를 직접 정하지 않아 상태와 무관하게 복원한다고 해석한다.
// 잡는 결함: STOPPED 상품의 환불 성공 취소에서 재고를 복원하지 않는 결함.
test("[TC-X-11b] STOPPED 상품의 PAID 주문도 환불 후 재고를 복원한다", async () => {
	const pg = createImmediateRefundPg([{ ok: true, refundId: "RF-X-11B" }]);
	const ctx = fresh({
		pg,
		clock: createFakeClock("2026-10-28T09:00:00.000Z"),
	});
	const stockBeforeOrder = ctx.store.products.get("P1").stock;
	const order = seedOrder(ctx, { items: [["P1", 2]], status: "PAID", deductStock: true });
	const stockAfterOrder = ctx.store.products.get("P1").stock;
	const payment = ctx.store.payments.get(order.id)[0];

	assert.equal(stockBeforeOrder, 10);
	assert.equal(stockAfterOrder, 8);
	assert.equal(payment.amount, 30000);
	ctx.store.products.get("P1").status = "STOPPED";
	assert.equal(ctx.store.products.get("P1").status, "STOPPED");
	assert.equal(ctx.store.products.get("P1").stock, 8);

	const result = await cancelOrder(ctx, "u1", order.id);

	assert.equal(ctx.pg.refunds.length, 1);
	assert.equal(ctx.pg.refunds[0].amount, 30000);
	assert.equal(ctx.pg.refunds[0].txId, payment.txId);
	assert.equal(ctx.store.orders.get(order.id).status, "CANCELED");
	assert.equal(ctx.store.payments.get(order.id)[0].status, "REFUNDED");
	assert.equal(ctx.store.payments.get(order.id)[0].refund.status, "SUCCEEDED");
	assert.equal(result.order.status, "CANCELED");
	assert.equal(ctx.store.products.get("P1").stock, 10);
});

// 근거: API_CONTRACT.md 38, 39, 45, 115줄. 팀 가정: 서로 다른 결제 기록의 id는 달라야 한다.
// 잡는 결함: 카운터 증가가 삭제되어 재시도 결제 기록에 같은 id가 발급되는 결함.
test("[TC-P-19b] 실패 뒤 재시도한 결제 기록은 서로 다른 id를 가진다", async () => {
	const responses = [
		{ ok: false, reason: "DECLINED" },
		{ ok: true, txId: "TX-P-19B" },
	];
	const pg = {
		async charge() {
			return responses.shift();
		},
	};
	const ctx = fresh({
		pg,
		clock: createFakeClock("2026-10-28T09:00:00.000Z"),
	});
	const order = seedOrder(ctx, { userId: "u1", deductStock: false });

	await expectRejectCode(() => payOrder(ctx, "u1", order.id), "PAYMENT_FAILED");
	await payOrder(ctx, "u1", order.id);

	const payments = ctx.store.payments.get(order.id);
	assert.equal(payments.length, 2);
	const firstId = payments[0].id;
	const secondId = payments[1].id;
	assert.equal(typeof firstId, "string");
	assert.equal(firstId.length > 0, true);
	assert.equal(typeof secondId, "string");
	assert.equal(secondId.length > 0, true);
	assert.notEqual(firstId, secondId);
});
