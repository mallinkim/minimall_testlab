# 테스트 설계표 (Mission 1 · 3 · 5)

## 1. 동등분할 · 경계값 표 (cart · order · 결제 · 취소 · 주문 조회 · 자동 취소)

| 케이스 ID | 대상(함수) | 규칙 번호 / 수락 기준 | 입력 조건 (동등분할 그룹) | 대표값 · 경계값 | 기대 결과 | 근거(오라클) |
|---|---|---|---|---|---|---|
| TC-C-01 | addToCart | 1장 규칙 1, US-05 | 유효한 수량(1~99 정수), 재고 충분 | 2 | P1 수량 2, 소계 30000, 합계 30000 | 계약서 1장 규칙 1 / US-05 정상 |
| TC-C-02 | addToCart | 1장 규칙 1 | 무효 수량: 0 (빈 장바구니) | 0 | INVALID_QUANTITY, 장바구니 비어 있음 | 계약서 1장 규칙 1 |
| TC-C-03 | addToCart | 1장 규칙 1 | 무효 수량: 0 (이미 담긴 상품) | 0 | INVALID_QUANTITY | 계약서 1장 규칙 1 |
| TC-C-04 | addToCart | 1장 규칙 1, 3 | 수량 하한 1, 재고 딱 맞음(P5 재고 1) | 1 | P5 수량 1, 소계 25000 | 계약서 1장 규칙 1, 3 |
| TC-C-05 | addToCart | 1장 규칙 3 | 합산 후 재고 초과(P1 재고 10, 이미 1개, +99) | 99 | OUT_OF_STOCK, maxAddable 9, 장바구니 불변 | 계약서 1장 규칙 3 |
| TC-C-06 | addToCart | 1장 규칙 1 | 무효 수량: 상한 바로 위 | 100 | INVALID_QUANTITY | 계약서 1장 규칙 1 |
| TC-C-07 | addToCart | 1장 규칙 1 | 무효 수량: 정수 아님 | 1.5 | INVALID_QUANTITY | 계약서 1장 규칙 1 |
| TC-C-08 | addToCart | 1장 규칙 1 | 무효 수량: 문자열 | "2" | INVALID_QUANTITY | 계약서 1장 규칙 1 |
| TC-C-09 | addToCart | 1장 규칙 1 | 무효 수량: null | null | INVALID_QUANTITY | 계약서 1장 규칙 1 |
| TC-C-11 | addToCart | 1장 규칙 3 | 재고 부족(P5 재고 1, 요청 2) | 2 | OUT_OF_STOCK, maxAddable 1, 장바구니 불변 | 계약서 1장 규칙 3 |
| TC-C-12 | addToCart | 1장 규칙 1, 3 | 재고와 딱 맞음(P2 재고 3) | 3 | P2 수량 3, 소계 177000 | 계약서 1장 규칙 1, 3 |
| TC-C-13 | addToCart | 1장 규칙 1 | 이미 담긴 상품에 합산 | 2 + 3 | P1 수량 5, 소계 75000 | 계약서 1장 규칙 1(합산) |
| TC-C-14 | addToCart | 1장 규칙 2 | 없는 상품 | MISSING | NOT_FOUND | 계약서 1장 규칙 2 |
| TC-C-15 | addToCart | 1장 규칙 2 | 판매 중지 상품(P4) | 1 | NOT_FOUND | 계약서 1장 규칙 2 |
| TC-C-16 | addToCart | 1장 규칙 3 | 품절 상품(P3 재고 0) | 1 | OUT_OF_STOCK, maxAddable 0, 장바구니 불변 | 계약서 1장 규칙 3 |
| TC-C-17 | addToCart | 1장 규칙 1 | 수량 상한 99 성공(재고 99) | 99 | 수량 99, 소계 9900 | 계약서 1장 규칙 1 |
| TC-C-18 | addToCart | 1장 규칙 3 | 합산 후 재고와 딱 맞음(재고 10, 이미 7, +3) | 3 | 수량 10, 소계 150000 | 계약서 1장 규칙 3 |
| TC-C-19 | addToCart | 1장 규칙 3 | 합산 후 재고 바로 위(이미 7, +4) | 4 | OUT_OF_STOCK, maxAddable 3, 장바구니 불변 | 계약서 1장 규칙 3 |
| TC-C-20 | addToCart | 1장 규칙 3 | 합산 후 재고 초과(이미 7, +5) | 5 | OUT_OF_STOCK, maxAddable 3, 장바구니 불변 | 계약서 1장 규칙 3 |
| TC-C-21 | addToCart | 0장 공통 규칙 | 반환값은 복사본 | 반환값 수정 | 수정해도 getCart 결과 불변 | 계약서 0장 공통 규칙(복사본) |
| TC-C-22 | changeQuantity | 1장 규칙 1 | 수량을 줄여 교체 | 2 → 1 | P1 수량 1, 소계 15000 | 계약서 1장 changeQuantity 정의(교체), 규칙 1 |
| TC-C-23 | changeQuantity | 1장 규칙 1, 3 | 수량 상한 99 (재고 99) | 2 → 99 | 수량 99, 소계 1485000 | 계약서 1장 규칙 1, 3 |
| TC-C-24 | changeQuantity | 1장 규칙 1 | 무효 수량: 0 (삭제 아님) | 0 | INVALID_QUANTITY, 장바구니 불변 | 계약서 1장 규칙 1 |
| TC-C-25 | changeQuantity | 1장 규칙 1 | 무효 수량: 상한 바로 위 | 100 | INVALID_QUANTITY, 장바구니 불변 | 계약서 1장 규칙 1 |
| TC-C-26 | changeQuantity | 1장 규칙 1 | 무효 수량: 정수 아님 | 1.5 | INVALID_QUANTITY, 장바구니 불변 | 계약서 1장 규칙 1 |
| TC-C-27 | changeQuantity | 1장 규칙 1 | 무효 수량: 문자열 | "2" | INVALID_QUANTITY, 장바구니 불변 | 계약서 1장 규칙 1 |
| TC-C-28 | changeQuantity | 1장 규칙 1 | 무효 수량: null | null | INVALID_QUANTITY, 장바구니 불변 | 계약서 1장 규칙 1 |
| TC-C-29 | changeQuantity | 1장 규칙 1 | 무효 수량: 음수 | -1 | INVALID_QUANTITY, 장바구니 불변 | 계약서 1장 규칙 1 |
| TC-C-30 | changeQuantity | 1장 규칙 3 | 재고 초과(재고 3, 요청 4) | 4 | OUT_OF_STOCK, 장바구니 불변 (maxAddable 값은 계약서에 정의 없어 단언하지 않음) | 계약서 1장 규칙 3 |
| TC-C-31 | changeQuantity | 1장 규칙 3 | 재고와 딱 맞음(재고 10) | 10 | 수량 10, 소계 150000 | 계약서 1장 규칙 3 |
| TC-C-32 | changeQuantity | 1장 규칙 3 | 재고 바로 위 | 11 | OUT_OF_STOCK, 장바구니 불변 | 계약서 1장 규칙 3 |
| TC-C-33 | changeQuantity | 1장 규칙 4 | 장바구니에 없는 상품(P2) | 1 | NOT_FOUND, 장바구니 불변 | 계약서 1장 규칙 4 |
| TC-C-34 | changeQuantity | 1장 규칙 2 | 담은 뒤 판매 중지된 상품 | 3 | NOT_FOUND, 장바구니 불변 | 계약서 1장 규칙 2(괄호 설명) |
| TC-C-35 | changeQuantity | 1장 규칙 5 | 여러 상품 중 하나만 변경(순서 유지) | P1 2 → 3, P2 1 | P1 3개(45000), P2 1개(59000) 순서 유지, 합계 104000 | 계약서 1장 규칙 5 |
| TC-C-36 | changeQuantity | 1장 changeQuantity 정의 | 수량을 늘려 교체(합산 아님) | 2 → 5 | P1 수량 5(합산 7이 아님), 소계 75000 | 계약서 1장 changeQuantity 정의(교체) |
| TC-C-37 | changeQuantity | 1장 규칙 2 | 없는 상품 ID | PX | NOT_FOUND, 장바구니 불변 | 계약서 1장 규칙 2 |
| TC-C-38 | removeItem | 1장 규칙 5 | 여러 상품 중 가운데 삭제 | P1, P2, P5 중 P2 | P1, P5 순서 유지, 합계 40000, getCart와 동일 | 계약서 1장 규칙 5 |
| TC-C-39 | removeItem | 1장 규칙 5 | 마지막 남은 상품 삭제 | P5 | items [], 합계 0, getCart와 동일 | 계약서 1장 규칙 5 |
| TC-C-40 | removeItem | 1장 규칙 5 | 삭제 후 다시 담기(맨 뒤 순서) | P2 삭제 후 재추가, P1 삭제 | P5, P2 순서, 합계 84000, getCart와 동일 | 계약서 1장 규칙 5(담은 순서) |
| TC-C-41 | removeItem | 1장 규칙 4 | 장바구니에 없는 상품(P2) | P2 | NOT_FOUND, 장바구니 불변 | 계약서 1장 규칙 4 |
| TC-C-42 | removeItem | 1장 규칙 4 | 없는 상품 ID | P999 | NOT_FOUND, 장바구니 불변 | 계약서 1장 규칙 4 |
| TC-C-43 | removeItem | 1장 규칙 4, 5 | 장바구니를 만든 적 없는 구매자 | P1 | NOT_FOUND, 상태 불변 | 계약서 1장 규칙 4, 5 |
| TC-C-44 | removeItem | 1장 규칙 1 | 수량 2 이상인 상품이 남는 경우 | P1 3개 + P2 2개 중 P2 삭제 | P1 3개(45000), 합계 45000 | 계약서 1장 규칙 1 |
| TC-C-45 | removeItem | 1장 규칙 6 | 구매자 분리 | u1이 P1 삭제 | u1 빈 장바구니, u2 장바구니 유지(15000) | 계약서 1장 규칙 6 |
| TC-C-46 | getCart | 1장 규칙 5 | 장바구니를 만든 적 없는 구매자 | u1 | {userId u1, items [], totalAmount 0} | 계약서 1장 규칙 5 |
| TC-C-47 | getCart | 1장 규칙 5 | 여러 상품의 소계·합계·담은 순서 | P2 2개, P1 2개 | P2(118000), P1(30000) 순서, 합계 148000 | 계약서 1장 규칙 5 |
| TC-C-48 | getCart | 0장 공통 규칙 | 반환값은 복사본 | 반환 객체 수정 | 수정해도 다음 getCart 결과 불변 | 계약서 0장 공통 규칙(복사본) |
| TC-C-49 | getCart | 1장 규칙 1, 5 | 같은 상품을 다시 담아도 처음 위치 유지 | P1, P2, P1 | P1(수량 2, 30000), P2(59000) 순서, 합계 89000 | 계약서 1장 규칙 1, 5 |
| TC-C-50 | getCart | 1장 규칙 5, 6 | 다른 구매자의 빈 장바구니 | u1이 담은 뒤 getCart(u2) | {userId u2, items [], totalAmount 0} | 계약서 1장 규칙 5, 6 |
| TC-O-01 | createOrder | 2장 규칙 4, FR-ORD-01, FR-STK-01, US-07 | 재고 충분한 두 상품 | P1 2개 + P2 1개, 유효한 배송지 | ORD-0001, PENDING_PAYMENT, 항목 순서 P1·P2, 총액 89000, 재고 P1 8·P2 2, 장바구니 비움, createdAt은 고정 시계 값 | 계약서 2장 규칙 4 / SRS FR-ORD-01 |
| TC-O-02 | createOrder | 2장 규칙 4, FR-STK-01, FR-STK-02 | 재고와 주문 수량이 딱 맞음 | P5 재고 1, 수량 1 | 총액 25000, P5 재고 0, 장바구니 비움 | 계약서 2장 규칙 4 / SRS FR-STK-02 |
| TC-O-03 | createOrder | 2장 규칙 1, US-07 | 배송지 앞뒤 공백 | "  서울시 중구 세종대로 110  " | address는 공백 제거 값, 총액 15000 | 계약서 2장 규칙 1 |
| TC-O-04 | createOrder | 2장 규칙 1, US-07 | 무효 배송지: 빈 문자열 | "" | INVALID_ADDRESS, 장바구니·재고 불변, 주문 0건 | 계약서 2장 규칙 1 |
| TC-O-05 | createOrder | 2장 규칙 1, US-07 | 무효 배송지: 공백뿐 | "   " | INVALID_ADDRESS, 장바구니·재고 불변, 주문 0건 | 계약서 2장 규칙 1 |
| TC-O-06 | createOrder | 2장 규칙 1, US-07 | 무효 배송지: 누락 | {} | INVALID_ADDRESS, 장바구니·재고 불변, 주문 0건 | 계약서 2장 규칙 1 |
| TC-O-07 | createOrder | 2장 규칙 1, US-07 | 무효 배송지: 문자열 아님 | null | INVALID_ADDRESS, 장바구니·재고 불변, 주문 0건 | 계약서 2장 규칙 1 |
| TC-O-08 | createOrder | 2장 규칙 2, FR-ORD-01 | 빈 장바구니 | 장바구니 없음 | EMPTY_CART, 재고 불변, 주문 0건, 이후 첫 성공 주문은 ORD-0001 | 계약서 2장 규칙 2 |
| TC-O-09 | createOrder | 2장 규칙 3, FR-ORD-01, US-07 | 재고가 요청량보다 부족 | P1 요청 2, 재고 1 | OUT_OF_STOCK, shortages [{P1, 무선 마우스, requested 2, available 1}], 장바구니·재고 불변 | 계약서 2장 규칙 3 |
| TC-O-10 | createOrder | 2장 규칙 3, FR-STK-02 | 판매 중지 상품 | P1 STOPPED, 요청 1 | OUT_OF_STOCK, shortages [{P1, requested 1, available 0}], 장바구니·재고 불변 | 계약서 2장 규칙 3(판매 중지는 available 0) |
| TC-O-11 | createOrder | 2장 규칙 3, FR-ORD-01 | 일부 상품만 부족 | P1 1개(충분) + P2 1개(재고 0) | OUT_OF_STOCK, shortages 길이 1(P2만), P1 재고 10 유지, 주문 0건 | 계약서 2장 규칙 3(전체 거부) |
| TC-O-12 | createOrder | 2장 규칙 3, 4 | 실패한 주문 뒤 재시도 | 재고 0으로 실패 후 재고 1로 복원해 재시도 | 첫 시도 OUT_OF_STOCK, 재시도는 ORD-0001, 총액 15000 | 계약서 2장 규칙 3, 4 |
| TC-O-13 | createOrder | 1장 규칙 6, 2장 규칙 4 | 구매자 분리 | u1 주문, u2 장바구니에 P2 1개 | u1 장바구니만 비움, u2 장바구니(59000) 유지, 재고 P1 9·P2 3 | 계약서 1장 규칙 6, 2장 규칙 4 |
| TC-O-14 | createOrder | 2장 규칙 4 | 주문 뒤 상품 가격 변경 | 주문 후 P1 가격을 59000으로 변경 | 저장된 주문의 단가 15000, 총액 30000 유지 | 계약서 2장 규칙 4(주문 시점 값) |
| TC-O-15 | createOrder | 0장 공통 규칙 | 반환값은 복사본 | 반환 주문의 주소·총액·수량 수정 | 저장된 주문은 원래 값(수량 2, 총액 30000) | 계약서 0장 공통 규칙(복사본) |
| TC-O-16 | createOrder | 2장 규칙 4 | 주문번호 순차 발급 | 연속 두 번 주문 | ORD-0001(15000), ORD-0002(59000) | 계약서 2장 규칙 4 |
| TC-O-17 | createOrder | 2장 규칙 3, 5, FR-STK-03, US-07 | 마지막 재고를 순차로 주문 | P5 재고 1, u1 성공 뒤 u2 주문 | u1 성공(25000), u2 OUT_OF_STOCK(shortages P5, available 0), 재고 0, 주문 1건 | 계약서 2장 규칙 3, 5 |
| TC-O-18 | createOrder | 2장 규칙 3 | 부족 상품이 둘 | 장바구니 P2 2개, P1 2개, 각 재고 1 | OUT_OF_STOCK, shortages 길이 2, 장바구니 순서 P2, P1, 장바구니·재고 불변 | 계약서 2장 규칙 3 |
| TC-O-19 | canTransition | 2장 상태 전이표 90~100행, FR-ORD-02 | 상태 6개 × 6개 = 36개 조합 | 허용 6개, 거부 30개(같은 상태로 전이 포함) | 허용 true, 나머지 false (기대값 표를 테스트 안에 직접 적음) | 계약서 2장 상태 전이표 |
| TC-O-20 | changeStatus | 2장 상태 전이표, FR-ORD-02 | 허용된 전이 6개 | PENDING→PAID·CANCELED, PAID→PREPARING·CANCELED, PREPARING→SHIPPING, SHIPPING→DELIVERED | 반환 주문과 저장 주문의 상태가 모두 변경됨 | 계약서 2장 상태 전이표 |
| TC-O-21 | changeStatus | 2장 상태 전이표 100행 | 허용되지 않은 전이 30개 | 표에 없는 모든 (현재, 다음) 조합 | INVALID_STATE, details { from, to }, 저장된 상태 그대로 | 계약서 2장 100행 |
| TC-O-22 | changeStatus | 2장 상태 전이 설명 | 존재하지 않는 주문 | 없는 주문 번호 | NOT_FOUND (details는 계약에 없어 단언하지 않음) | 계약서 2장 상태 전이 설명 |
| TC-O-23 | changeStatus | 0장 공통 규칙 | 반환값은 복사본 | 반환 주문 수정 | 저장된 주문은 그대로 | 계약서 0장 공통 규칙(복사본) |
| TC-P-01 | payOrder | 3장 도입부 (102~108줄) [줄 번호 확인] | 본인의 결제대기 주문, PG 성공 | P1×2 (30000), txId "TX-P-001" | 반환값 전체 deepEqual, 주문 PAID, 결제 기록 SUCCEEDED·amount 30000·paidAt 있음, PG 요청 1건(orderId·amount 30000·멱등성 키 비어 있지 않음), 카드 정보 필드 없음 | 계약서 3장 도입부 (102~108줄) [줄 번호 확인] |
| TC-P-02 | payOrder | 3장 규칙 6-1 (115줄) [줄 번호 확인], 데이터 38줄 | 성공 1회 | P1×2 | 결제 기록 1건, attempt 1 | 계약서 3장 규칙 6-1 (115줄) [줄 번호 확인], 데이터 38줄 |
| TC-P-03 | payOrder | 공통 13줄 | 성공 후 반환 객체를 변경 | 반환 order·payment 수정 | 저장된 주문(PAID, 수량 2)·결제 기록(SUCCEEDED, 30000, txId) 불변 | 계약서 공통 13줄 |
| TC-P-04 | payOrder | 3장 (112줄) [줄 번호 확인] | PG 실패 응답 | `{ok:false, reason:"LIMIT_EXCEEDED"}` | PAYMENT_FAILED, details.reason "LIMIT_EXCEEDED", 주문 PENDING_PAYMENT 유지, 실패 기록 1건(attempt 1, failureReason), PG 1회 | 계약서 3장 (112줄) [줄 번호 확인] |
| TC-P-05 | payOrder | 3장 (113줄) [줄 번호 확인] | PG 시간 초과(예외) | `new Error("PG_TIMEOUT")` | PAYMENT_FAILED, details.reason "PG_ERROR"(≠ PG_TIMEOUT), 주문 PENDING_PAYMENT, 실패 기록 failureReason "PG_ERROR" | 계약서 3장 (113줄) [줄 번호 확인] |
| TC-P-06 | payOrder | 3장 규칙 6, 6-1 (114~115줄) [줄 번호 확인] | 실패 후 같은 주문 재결제 | 1차 LIMIT_EXCEEDED, 2차 성공 | 기록 2건(FAILED attempt 1 / SUCCEEDED attempt 2), alreadyPaid false, PAID, PG 2회·금액 30000·멱등성 키 서로 다름 | 계약서 3장 규칙 6, 6-1 (114~115줄) [줄 번호 확인] |
| TC-P-07 | payOrder | 3장 규칙 6, 6-1 (114~115줄) [줄 번호 확인] | 시간 초과 후 재결제 | 1차 예외, 2차 성공 | TC-P-06과 같은 구조, 1차 failureReason "PG_ERROR" | 계약서 3장 규칙 6, 6-1 (114~115줄) [줄 번호 확인] |
| TC-P-08 | payOrder | 3장 규칙 6, 6-1 (114~115줄) [줄 번호 확인] | 연속 실패 2회 후 성공 | 실패, 실패, 성공 | attempt 1·2·3, 멱등성 키 3개 모두 서로 다름, PAID | 계약서 3장 규칙 6, 6-1 (114~115줄) [줄 번호 확인] |
| TC-P-09 | payOrder | 3장 규칙 2 (110줄) | 이미 결제된 주문 재결제 | 성공 후 같은 주문 다시 호출 | 첫 성공 결과 + alreadyPaid true, PG 미호출(1회 유지), 기록 1건 | 계약서 3장 규칙 2 (110줄) ("기존 결과" 해석은 팀 가정) |
| TC-P-10 | payOrder | 3장 규칙 2 (110줄) | 실패 후 성공한 주문 재결제 | 실패→성공→재호출 | 성공 결과(attempt 2) 반환, alreadyPaid true, PG 2회·기록 2건 유지 | 계약서 3장 규칙 2 (110줄) |
| TC-P-11 | payOrder | 공통 13줄 | 이미 결제된 주문의 반환값 변경 | alreadyPaid 결과 수정 | 저장소(PAID, 수량 2, 기록 1건) 불변 | 계약서 공통 13줄 |
| TC-P-12 | payOrder | 3장 규칙 3 (111줄) | 취소된 주문 | status CANCELED | 오류 거부, PG 미호출·결제 기록 없음·CANCELED 유지 | 계약서 3장 규칙 3 (111줄) (PG 미호출·기록 없음은 팀 가정) |
| TC-P-13 | payOrder | 3장 규칙 1 (109줄), 공통 12·15줄 | 다른 사용자의 주문 | 소유자 u1, 요청자 u2 | NOT_FOUND, PG 미호출·기록 없음·PENDING_PAYMENT 유지 | 계약서 3장 규칙 1 (109줄), 공통 12·15줄 (부수 상태 불변은 팀 가정) |
| TC-P-14 | payOrder | 3장 규칙 1 (109줄), 공통 12·24줄 | 존재하지 않는 주문 ID | 없는 ID | NOT_FOUND, PG 미호출·기록 없음 | 계약서 3장 규칙 1 (109줄), 공통 12·24줄 (부수 상태 불변은 팀 가정) |
| TC-P-15 | payOrder | 3장 규칙 7 (116줄) | 같은 주문 동시 결제(성공) | 제어형 PG, 호출 2개 겹침 | PG 1회, PAID, 기록 1건 SUCCEEDED | 계약서 3장 규칙 7 (116줄) (기록 1건은 팀 가정) |
| TC-P-16 | payOrder | 3장 규칙 7 (116줄) | 같은 주문 동시 결제(실패) | 제어형 PG, LIMIT_EXCEEDED | 두 호출 모두 PAYMENT_FAILED·LIMIT_EXCEEDED, PG 1회, PENDING_PAYMENT, 실패 기록 1건 | 계약서 3장 규칙 7 (116줄) (기록 1건은 팀 가정) |
| TC-P-17 | payOrder | 3장 규칙 8 (117줄) | 서로 다른 주문 동시 결제 | A: P1×2 30000, B: P2×1 59000 | 각각 성공, PG 2회(A 30000, B 59000), 둘 다 PAID, 기록 각 1건 | 계약서 3장 규칙 8 (117줄) |
| TC-P-18 | payOrder | 3장 규칙 8 (117줄) | 한 주문 실패 + 다른 주문 성공(동시) | A 실패, B 성공 | A: PAYMENT_FAILED·PENDING_PAYMENT·FAILED 기록, B: PAID·SUCCEEDED 기록 | 계약서 3장 규칙 8 (117줄) |
| TC-P-19a | payOrder | 데이터 구조 38·39·45줄 | 서로 다른 두 주문을 각각 결제 | 인라인 PG 성공 2회 | 각 주문 결제 기록 1건, id는 비어 있지 않은 문자열이고 서로 다름 | 계약서 데이터 구조 38·39·45줄 (id 고유성은 팀 가정, 형식은 단정하지 않음) |
| TC-P-19b | payOrder | 데이터 구조 38·39·45줄 | 같은 주문 실패 후 재시도 성공 | 실패→성공 | 기록 2건, id 서로 다름 | 계약서 데이터 구조 38·39·45줄 (id 고유성은 팀 가정) |
| TC-X-01 | cancelOrder | 4장 규칙 3 (129줄) | 결제 전(PENDING) 주문 취소 | P1×3, 재고 10→7 | CANCELED, 재고 10 복원, 환불 호출 0회 | 계약서 4장 규칙 3 (129줄) |
| TC-X-02 | cancelOrder | 4장 규칙 3 (129줄), PG 응답 124줄 | 결제된(PAID) 주문 취소, 환불 성공 | P1×2 PAID, 재고 8, `{ok:true, refundId:"RF-X-02"}` | 환불 1회(amount 30000, txId 일치), 결제 REFUNDED·refund SUCCEEDED·refundId, 주문 CANCELED, 재고 10, 반환 키는 order만 | 계약서 4장 규칙 3 (129줄), PG 응답 124줄 (refund.at은 존재만 확인(팀 가정)) |
| TC-X-03 | cancelOrder | 공통 13줄 | 취소 후 반환 order 변경 | 반환 객체 수정 | 저장된 주문(CANCELED, 수량 2) 불변 | 계약서 공통 13줄 |
| TC-X-04 | cancelOrder | 4장 규칙 4 (130~132줄) | 환불 거부 응답 | `{ok:false, reason:"REFUND_REJECTED"}` | REFUND_FAILED·details.reason "REFUND_REJECTED", 주문 PAID 유지, 재고 8 유지, refund FAILED·reason | 계약서 4장 규칙 4 (130~132줄) (결제 status 비변경은 팀 가정) |
| TC-X-05 | cancelOrder | 4장 규칙 4 (130~132줄) | 환불 실패 후 재시도 | 1차 거부, 2차 성공 | 환불 2회, 최종 CANCELED·REFUNDED·재고 10, 이전 reason 남지 않음 | 계약서 4장 규칙 4 (130~132줄) (reason 제거는 팀 가정) |
| TC-X-06 | cancelOrder | 4장 규칙 4 (132줄) | 환불 중 PG 예외 | `new Error("PG_TIMEOUT")` | REFUND_FAILED·details.reason "PG_ERROR", 주문 PAID, 재고 8 | 계약서 4장 규칙 4 (132줄) (refund.reason "PG_ERROR"는 팀 가정) |
| TC-X-07a | cancelOrder | 4장 규칙 2 (128줄), 상태 전이표 90~100줄 | 준비중(PREPARING) 주문 취소 | 재고 8 | INVALID_STATE, 환불 0회, 주문·재고·결제 기록 불변 | 계약서 4장 규칙 2 (128줄), 상태 전이표 90~100줄 (결제 기록 불변은 팀 가정) |
| TC-X-07b | cancelOrder | 4장 규칙 2 (128줄), 상태 전이표 90~100줄 | 배송중(SHIPPING) 주문 취소 | 재고 8 | INVALID_STATE, 환불 0회, 주문·재고·결제 기록 불변 | 계약서 4장 규칙 2 (128줄), 상태 전이표 90~100줄 |
| TC-X-07c | cancelOrder | 4장 규칙 2 (128줄), 상태 전이표 90~100줄 | 배송완료(DELIVERED) 주문 취소 | 재고 8 | INVALID_STATE, 환불 0회, 주문·재고·결제 기록 불변 | 계약서 4장 규칙 2 (128줄), 상태 전이표 90~100줄 |
| TC-X-07d | cancelOrder | 4장 규칙 2 (128줄), 상태 전이표 90~100줄 | 이미 취소된 주문 재취소 | 첫 취소 후 재호출 | INVALID_STATE, 환불 0회, CANCELED, 재고 10 유지 | 계약서 4장 규칙 2 (128줄), 상태 전이표 90~100줄 |
| TC-X-08a | cancelOrder | 4장 규칙 1 (127줄), 공통 15줄 | 남의 PENDING 주문 취소 | 요청자 "intruder" | NOT_FOUND, 저장소 전체·재고 불변 | 계약서 4장 규칙 1 (127줄), 공통 15줄 |
| TC-X-08b | cancelOrder | 4장 규칙 1 (127줄), 공통 15줄 | 남의 PAID 주문 취소 | 요청자 "intruder" | NOT_FOUND, 환불 0회, 주문 PAID, 재고 8, 결제 기록에 refund 없음 | 계약서 4장 규칙 1 (127줄), 공통 15줄 |
| TC-X-08c | cancelOrder | 4장 규칙 1 (127줄), 공통 24줄 | 존재하지 않는 주문 | 없는 ID | NOT_FOUND, 저장소·재고 불변 | 계약서 4장 규칙 1 (127줄), 공통 24줄 |
| TC-X-09a | cancelOrder | 4장 규칙 5 (133줄) | 같은 PAID 주문 동시 취소 | 제어형 환불 PG | 환불 1회(30000), 한 호출 성공·다른 호출은 성공 또는 INVALID_STATE, 최종 CANCELED·REFUNDED·재고 10(12 아님) | 계약서 4장 규칙 5 (133줄) (두 번째 호출 결과는 팀 가정) |
| TC-X-09b | cancelOrder | 4장 규칙 5 (133줄) | 같은 PENDING 주문 동시 취소 | 제어형 환불 PG | 환불 0회, 최종 CANCELED, 재고 10(12 아님) | 계약서 4장 규칙 5 (133줄) |
| TC-X-10a | cancelOrder | 4장 규칙 3 (129줄), 5장 규칙 2 (142줄) | 주문 뒤 상품(P2)이 삭제된 주문 취소 | P2 삭제 후 cancelOrder | 취소 성공, 반환·저장 모두 CANCELED | 계약서 4장 규칙 3 (129줄), 5장 규칙 2 (142줄) (삭제된 상품이 있어도 성공은 팀 가정) |
| TC-X-10b | cancelOrder | 4장 규칙 3 (129줄), 5장 규칙 2 (142줄) | 삭제된 상품 + 존재하는 상품이 섞인 주문 | items [["P2",1],["P1",2]], P2 삭제 | 취소 성공, 존재하는 P1 재고는 10으로 복원 | 계약서 4장 규칙 3 (129줄), 5장 규칙 2 (142줄) |
| TC-X-11a | cancelOrder | 4장 규칙 3 (129줄), 데이터 구조 35줄 | 주문 뒤 상품이 판매 중지(STOPPED)된 결제대기 주문 취소 | P1×2, 재고 10→8, P1 status "STOPPED" | CANCELED, PG 환불 0회, 재고 10 | 계약서 4장 규칙 3 (129줄), 데이터 구조 35줄 (STOPPED여도 복원은 팀 가정) |
| TC-X-11b | cancelOrder | 4장 규칙 4 (130~131줄), 데이터 구조 35줄 | 주문 뒤 상품이 STOPPED된 PAID 주문 취소(환불 성공) | P1×2, 재고 10→8, 환불 30000 | 환불 1회(amount 30000, txId 일치), 결제 REFUNDED·refund SUCCEEDED, CANCELED, 재고 10 | 계약서 4장 규칙 4 (130~131줄), 데이터 구조 35줄 (STOPPED여도 복원은 팀 가정) |
| TC-Q-01a | getOrderDetail | 5장 (137줄) | 본인 주문 상세 | ORD-0001, 서울시, P1×2·P2×1 | createdAt "2026-10-28T09:00:00.000Z", address, 품목별 lineTotal 30000/59000, totalAmount 89000 | 계약서 5장 (137줄) (기본 배송지 값은 fresh 픽스처 기준) |
| TC-Q-01b | getOrderDetail | 5장 규칙 1 (141줄) | 남의 주문 | u2가 u1 주문 조회 | NOT_FOUND | 계약서 5장 규칙 1 (141줄) |
| TC-Q-01c | getOrderDetail | 5장 규칙 1 (141줄) | 없는 주문 | ORD-9999 | NOT_FOUND | 계약서 5장 규칙 1 (141줄) |
| TC-Q-01d | getOrderDetail | 5장 규칙 2 (142줄) | 주문 후 상품 가격 변경 | P1 15000→17000 | 단가 15000, lineTotal 30000 유지(주문 시점 값) | 계약서 5장 규칙 2 (142줄) |
| TC-Q-01e | getOrderDetail | 5장 규칙 2 (142줄) | 주문 후 상품 삭제 | P2 삭제 | 주문 시점 스냅샷 59000 유지 | 계약서 5장 규칙 2 (142줄) |
| TC-Q-01f | getOrderDetail | 공통 13줄 | 반환 사본 변경 | 반환 객체 수정 | 저장소 불변 | 계약서 공통 13줄 |
| TC-Q-02a | listOrders | 5장 규칙 3 (143줄) | 서로 다른 생성 시각 3건 | 0/1/2분 간격(고정 시계) | ORD-0003, 0002, 0001 순(최신순) | 계약서 5장 규칙 3 (143줄) |
| TC-Q-02b | listOrders | 5장 규칙 3 (143줄) | 같은 생성 시각 2건 | 시각 동일 | ORD-0002, 0001 순 | 계약서 5장 규칙 3 (143줄) (동시각 순서는 계약 문구 확인 필요) |
| TC-Q-02c | listOrders | 5장 규칙 4 (144줄) | 11건, 기본 페이지 | page 1, pageSize 10 | page 1, pageSize 10, total 11, items 10건, 첫 ORD-0011, 마지막 ORD-0002 | 계약서 5장 규칙 4 (144줄) |
| TC-Q-02d | listOrders | 5장 규칙 4 (144줄) | 11건, 2쪽 | page 2 | items ["ORD-0001"] | 계약서 5장 규칙 4 (144줄) |
| TC-Q-02e | listOrders | 5장 규칙 4 (144줄) | 11건, 3쪽(범위 밖) | page 3 | items [] | 계약서 5장 규칙 4 (144줄) |
| TC-Q-02f | listOrders | 5장 규칙 5 (145줄), 목록 항목 형태 138줄 | 한 종류 상품(수량 2) | P1×2 | 대표 이름 "무선 마우스" | 계약서 5장 규칙 5 (145줄), 목록 항목 형태 138줄 |
| TC-Q-02g | listOrders | 5장 규칙 5 (145줄), 목록 항목 형태 138줄 | 두 종류 상품 | P1×2 + P2×1 | 항목 deepEqual: orderId, createdAt, "무선 마우스 외 1건", totalAmount 89000, status PENDING_PAYMENT | 계약서 5장 규칙 5 (145줄), 목록 항목 형태 138줄 |
| TC-Q-02h | listOrders | 5장 규칙 5 (145줄), 목록 항목 형태 138줄 | 세 종류 상품 | 3종 | "무선 마우스 외 2건" | 계약서 5장 규칙 5 (145줄), 목록 항목 형태 138줄 |
| TC-Q-02i | listOrders | 5장 규칙 6 (146줄) | 다른 사용자 주문이 섞임 | u2 주문 먼저, u1 주문 나중 | u1 목록 ["ORD-0002"], total 1 | 계약서 5장 규칙 6 (146줄) |
| TC-Q-02j | listOrders | 5장 규칙 4 (144줄), SRS US-09 50줄 | 주문이 없는 사용자 | 주문 0건 | total 0, items [] | 계약서 5장 규칙 4 (144줄), SRS US-09 50줄 (빈 목록 형태는 팀 가정) |
| TC-Q-02k | listOrders | 5장 규칙 4 (144줄) | 정확히 10건, 2쪽 | 경계값 10 | items [] | 계약서 5장 규칙 4 (144줄) |
| TC-E-01a | expirePendingOrders | 6장 규칙 2 (153줄) | PAID, 31분 경과 | deductStock true | 결과 [], 상태 PAID, 재고 9 | 계약서 6장 규칙 2 (153줄) |
| TC-E-01b | expirePendingOrders | 6장 규칙 2 (153줄) | PREPARING, 31분 경과 | deductStock true | 〃 (PREPARING 유지) | 계약서 6장 규칙 2 (153줄) |
| TC-E-01c | expirePendingOrders | 6장 규칙 2 (153줄) | SHIPPING, 31분 경과 | deductStock true | 〃 (SHIPPING 유지) | 계약서 6장 규칙 2 (153줄) |
| TC-E-01d | expirePendingOrders | 6장 규칙 2 (153줄) | DELIVERED, 31분 경과 | deductStock true | 〃 (DELIVERED 유지) | 계약서 6장 규칙 2 (153줄) |
| TC-E-01e | expirePendingOrders | 6장 규칙 2 (153줄) | CANCELED, 31분 경과 | deductStock false | 결과 [], 재고 10 (재복원 없음) | 계약서 6장 규칙 2 (153줄) |
| TC-E-01f | expirePendingOrders | 6장 규칙 1 (152줄) | PENDING, 31분 경과 | 기본 타임아웃 | 결과 ["ORD-0001"], CANCELED, 재고 10 복원 | 계약서 6장 규칙 1 (152줄) |
| TC-E-01g | expirePendingOrders | 6장 규칙 1 (152줄), 오름차순 150줄 | PENDING 3건(0/1/2분 생성), 33분 경과 | 3건 모두 경과 | ["ORD-0001","ORD-0002","ORD-0003"] 오름차순, 모두 CANCELED | 계약서 6장 규칙 1 (152줄), 오름차순 150줄 |
| TC-E-01h | expirePendingOrders | 6장 규칙 1 (152줄) | 21분 간격 두 주문, 경계 | 한쪽만 30분 이상 | 오래된 ORD-0001만 취소, 재고 9(다른 주문 유지) | 계약서 6장 규칙 1 (152줄) |
| TC-E-01i | expirePendingOrders | 6장 규칙 1 (152줄) | 수량 2 주문 | P1×2 | 재고가 정확히 10으로 복원 | 계약서 6장 규칙 1 (152줄) |
| TC-E-01j | expirePendingOrders | 6장 규칙 2 (153줄) | 반복 호출 | 두 번 연속 | 1차 ["ORD-0001"], 2차 [], 재고 10 유지(복원 한 번) | 계약서 6장 규칙 2 (153줄) |
| TC-E-01k | expirePendingOrders | 6장 (150줄) | 사용자 지정 타임아웃 10분 | {timeoutMinutes:10}, 11분 경과 | 취소됨 | 계약서 6장 (150줄) |
| TC-E-01l | expirePendingOrders | 6장 (150줄) | 사용자 지정 타임아웃 60분 | {timeoutMinutes:60}, 31분 경과 | [], PENDING 유지, 재고 9 | 계약서 6장 (150줄) |
| TC-E-01m | expirePendingOrders | 6장 규칙 1 (152줄), 데이터 구조 35줄 | 주문 뒤 상품이 STOPPED된 결제대기 주문, 31분 경과 | P1×2, 재고 10→8, STOPPED | ["ORD-0001"], CANCELED, 재고 10 | 계약서 6장 규칙 1 (152줄), 데이터 구조 35줄 (STOPPED여도 복원은 팀 가정) |

## 2. 설계 → 테스트 추적표 (cart · order · 결제 · 취소 · 주문 조회 · 자동 취소)
| 케이스 ID | 테스트 파일 · 이름 | 결과(통과 / 변이를 죽임 / 보류) |
|---|---|---|
| TC-C-01 | my_tests/m1_cart.test.js · [TC-C-01] 재고가 충분한 상품을 담으면 수량과 소계가 장바구니에 기록된다 | 통과 |
| TC-C-02 | my_tests/m1_cart.test.js · [TC-C-02] 수량이 0 이면 INVALID_QUANTITY 이고 장바구니는 바뀌지 않는다 | 통과 |
| TC-C-03 | my_tests/m1_cart.test.js · [TC-C-03] 이미 담긴 상품에 수량 0을 추가하면 INVALID_QUANTITY | 통과 |
| TC-C-04 | my_tests/m1_cart.test.js · [TC-C-04] 재고 1개인 P5에 1개를 담으면 성공한다 | 통과 |
| TC-C-05 | my_tests/m1_cart.test.js · [TC-C-05] 재고 10개인 P1에 이미 1개가 있을 때 99개를 더 담으면 재고 부족이고 장바구니는 바뀌지 않는다 | 통과 |
| TC-C-06 | my_tests/m1_cart.test.js · [TC-C-06] 수량 100은 INVALID_QUANTITY | 통과 |
| TC-C-07 | my_tests/m1_cart.test.js · [TC-C-07] 수량 1.5는 INVALID_QUANTITY | 통과 |
| TC-C-08 | my_tests/m1_cart.test.js · [TC-C-08] 문자열 수량 "2"는 INVALID_QUANTITY | 통과 |
| TC-C-09 | my_tests/m1_cart.test.js · [TC-C-09] 수량 null은 INVALID_QUANTITY | 통과 |
| TC-C-11 | my_tests/m1_cart.test.js · [TC-C-11] 재고 1개인 P5에 2개를 더 담으면 maxAddable 1이고 장바구니는 바뀌지 않는다 | 통과 |
| TC-C-12 | my_tests/m1_cart.test.js · [TC-C-12] 재고 3개인 P2에 3개를 담으면 성공한다 | 통과 |
| TC-C-13 | my_tests/m1_cart.test.js · [TC-C-13] P1에 이미 2개가 있을 때 3개를 더 담으면 합계 5개가 된다 | 통과 |
| TC-C-14 | my_tests/m1_cart.test.js · [TC-C-14] 존재하지 않는 상품을 담으면 NOT_FOUND | 통과 |
| TC-C-15 | my_tests/m1_cart.test.js · [TC-C-15] 판매 중지 상품 P4를 담으면 NOT_FOUND | 통과 |
| TC-C-16 | my_tests/m1_cart.test.js · [TC-C-16] 품절 상품 P3를 담으면 maxAddable 0이고 장바구니는 바뀌지 않는다 | 통과 |
| TC-C-17 | my_tests/m1_cart.test.js · [TC-C-17] 재고가 99개인 상품에 수량 99를 담으면 성공한다 | 통과 |
| TC-C-18 | my_tests/m1_cart.test.js · [TC-C-18] P1 재고 10개에 이미 7개가 있을 때 3개를 더 담으면 합계 10개가 된다 | 통과 |
| TC-C-19 | my_tests/m1_cart.test.js · [TC-C-19] P1 재고 10개에 이미 7개가 있을 때 4개를 더 담으면 maxAddable 3이고 장바구니는 바뀌지 않는다 | 통과 |
| TC-C-20 | my_tests/m1_cart.test.js · [TC-C-20] P1 재고 10개에 이미 7개가 있을 때 5개를 더 담으면 maxAddable 3이고 장바구니는 바뀌지 않는다 | 통과 |
| TC-C-21 | my_tests/m1_cart.test.js · [TC-C-21] addToCart 반환값을 수정해도 getCart 결과는 바뀌지 않는다 | 통과 |
| TC-C-22 | my_tests/m1_cart.test.js · [TC-C-22] P1 수량을 1로 변경하면 소계와 합계가 갱신된다 | 통과 |
| TC-C-23 | my_tests/m1_cart.test.js · [TC-C-23] 재고 99개인 P1의 수량을 99로 변경할 수 있다 | 통과 |
| TC-C-24 | my_tests/m1_cart.test.js · [TC-C-24] 수량 0은 INVALID_QUANTITY이고 장바구니는 바뀌지 않는다 | 통과 |
| TC-C-25 | my_tests/m1_cart.test.js · [TC-C-25] 수량 100은 INVALID_QUANTITY이고 장바구니는 바뀌지 않는다 | 통과 |
| TC-C-26 | my_tests/m1_cart.test.js · [TC-C-26] 수량 1.5는 INVALID_QUANTITY이고 장바구니는 바뀌지 않는다 | 통과 |
| TC-C-27 | my_tests/m1_cart.test.js · [TC-C-27] 문자열 수량 "2"는 INVALID_QUANTITY이고 장바구니는 바뀌지 않는다 | 통과 |
| TC-C-28 | my_tests/m1_cart.test.js · [TC-C-28] 수량 null은 INVALID_QUANTITY이고 장바구니는 바뀌지 않는다 | 통과 |
| TC-C-29 | my_tests/m1_cart.test.js · [TC-C-29] 음수 수량은 INVALID_QUANTITY이고 장바구니는 바뀌지 않는다 | 통과 |
| TC-C-30 | my_tests/m1_cart.test.js · [TC-C-30] 재고보다 큰 수량으로 변경하면 OUT_OF_STOCK이고 장바구니는 바뀌지 않는다 | 통과 |
| TC-C-31 | my_tests/m1_cart.test.js · [TC-C-31] P1 수량을 재고와 같은 10으로 변경할 수 있다 | 통과 |
| TC-C-32 | my_tests/m1_cart.test.js · [TC-C-32] 재고보다 하나 많은 수량으로 변경하면 OUT_OF_STOCK이고 장바구니는 바뀌지 않는다 | 통과 |
| TC-C-33 | my_tests/m1_cart.test.js · [TC-C-33] 장바구니에 없는 P2의 수량을 변경하면 NOT_FOUND이고 장바구니는 바뀌지 않는다 | 통과 |
| TC-C-34 | my_tests/m1_cart.test.js · [TC-C-34] 담은 뒤 판매 중지된 P1의 수량을 변경하면 NOT_FOUND이고 장바구니는 바뀌지 않는다 | 통과 |
| TC-C-35 | my_tests/m1_cart.test.js · [TC-C-35] P1 수량 변경 후에도 P1, P2 순서와 P2 수량이 유지된다 | 통과 |
| TC-C-36 | my_tests/m1_cart.test.js · [TC-C-36] P1 수량을 2에서 5로 변경하면 합산하지 않고 5가 된다 | 통과 |
| TC-C-37 | my_tests/m1_cart.test.js · [TC-C-37] 존재하지 않는 상품 ID의 수량을 변경하면 NOT_FOUND이고 장바구니는 바뀌지 않는다 | 통과 |
| TC-C-38 | my_tests/m1_cart.test.js · [TC-C-38] 여러 상품 중 가운데 P2를 삭제하면 나머지 순서를 유지하고 getCart와 같은 값을 반환한다 | 통과 |
| TC-C-39 | my_tests/m1_cart.test.js · [TC-C-39] 마지막 남은 상품을 삭제하면 빈 장바구니를 반환하고 getCart와 값이 같다 | 통과 |
| TC-C-40 | my_tests/m1_cart.test.js · [TC-C-40] 삭제한 P2를 다시 담으면 맨 뒤 순서가 되고 getCart와 같은 값을 반환한다 | 통과 |
| TC-C-41 | my_tests/m1_cart.test.js · [TC-C-41] 장바구니에 없는 상품을 삭제하면 NOT_FOUND이고 장바구니는 바뀌지 않는다 | 통과 |
| TC-C-42 | my_tests/m1_cart.test.js · [TC-C-42] 존재하지 않는 상품 ID를 삭제하면 NOT_FOUND이고 장바구니는 바뀌지 않는다 | 통과 |
| TC-C-43 | my_tests/m1_cart.test.js · [TC-C-43] 장바구니를 만든 적 없는 구매자가 삭제하면 NOT_FOUND이고 상태는 바뀌지 않는다 | 통과 |
| TC-C-44 | my_tests/m1_cart.test.js · [TC-C-44] P1 3개와 P2 2개 중 P2를 삭제하면 P1의 수량과 합계를 유지한다 | 통과 |
| TC-C-45 | my_tests/m1_cart.test.js · [TC-C-45] u1의 P1을 삭제해도 u2의 장바구니는 유지된다 | 통과 |
| TC-C-46 | my_tests/m1_cart.test.js · [TC-C-46] 장바구니를 만든 적 없는 구매자의 getCart는 빈 장바구니를 반환한다 | 통과 |
| TC-C-47 | my_tests/m1_cart.test.js · [TC-C-47] getCart는 담은 순서와 여러 상품의 소계 및 합계를 반환한다 | 통과 |
| TC-C-48 | my_tests/m1_cart.test.js · [TC-C-48] getCart 반환 객체를 수정해도 다음 조회 결과는 바뀌지 않는다 | 통과 |
| TC-C-49 | my_tests/m1_cart.test.js · [TC-C-49] 같은 상품을 다시 담아도 처음 담은 순서가 유지되고 수량이 합산된다 | 통과 |
| TC-C-50 | my_tests/m1_cart.test.js · [TC-C-50] u1의 장바구니가 있어도 u2의 getCart는 빈 장바구니를 반환한다 | 통과 |
| TC-O-01 | my_tests/m1_order.test.js · [TC-O-01] 두 상품 주문 성공 | 통과 |
| TC-O-02 | my_tests/m1_order.test.js · [TC-O-02] 재고와 주문 수량이 정확히 일치 | 통과 |
| TC-O-03 | my_tests/m1_order.test.js · [TC-O-03] 배송지 앞뒤 공백 제거 | 통과 |
| TC-O-04 | my_tests/m1_order.test.js · [TC-O-04] 빈 배송지 거부 시 장바구니·재고 불변 | 통과 |
| TC-O-05 | my_tests/m1_order.test.js · [TC-O-05] 공백뿐인 배송지 거부 시 장바구니·재고 불변 | 통과 |
| TC-O-06 | my_tests/m1_order.test.js · [TC-O-06] 배송지 누락 시 장바구니·재고 불변 | 통과 |
| TC-O-07 | my_tests/m1_order.test.js · [TC-O-07] 문자열이 아닌 배송지 거부 시 장바구니·재고 불변 | 통과 |
| TC-O-08 | my_tests/m1_order.test.js · [TC-O-08] 빈 장바구니 주문 거부 | 통과 |
| TC-O-09 | my_tests/m1_order.test.js · [TC-O-09] 재고가 요청량보다 부족 | 통과 |
| TC-O-10 | my_tests/m1_order.test.js · [TC-O-10] 판매 중지 상품 부족 처리 | 통과 |
| TC-O-11 | my_tests/m1_order.test.js · [TC-O-11] 한 상품만 부족해도 전체 주문 거부 | 통과 |
| TC-O-12 | my_tests/m1_order.test.js · [TC-O-12] 실패 후 첫 성공 주문번호 확인 | 통과 |
| TC-O-13 | my_tests/m1_order.test.js · [TC-O-13] 다른 구매자의 장바구니는 비우지 않음 | 통과 |
| TC-O-14 | my_tests/m1_order.test.js · [TC-O-14] 주문 시점의 상품 정보 유지 | 통과 |
| TC-O-15 | my_tests/m1_order.test.js · [TC-O-15] 반환 주문은 저장 주문의 복사본 | 통과 |
| TC-O-16 | my_tests/m1_order.test.js · [TC-O-16] 성공 주문번호 순차 발급 | 통과 |
| TC-O-17 | my_tests/m1_order.test.js · [TC-O-17] 마지막 재고를 순차 주문 | 통과 |
| TC-O-18 | my_tests/m1_order.test.js · [TC-O-18] 부족 상품 두 개를 shortages에 장바구니 순서대로 반환한다 | 통과 |
| TC-O-19 | my_tests/m1_order.test.js · [TC-O-19] canTransition의 전체 상태 조합 기대값 표 | 통과 |
| TC-O-20 | my_tests/m1_order.test.js · [TC-O-20] changeStatus는 허용된 상태 전이를 적용한다 | 통과 |
| TC-O-21 | my_tests/m1_order.test.js · [TC-O-21] changeStatus는 허용되지 않은 모든 전이를 거부하고 상태를 유지한다 | 통과, order.js:31 변이를 죽임 |
| TC-O-22 | my_tests/m1_order.test.js · [TC-O-22] 존재하지 않는 주문 상태 변경은 NOT_FOUND다 | 통과, order.js:30 변이를 죽임 |
| TC-O-23 | my_tests/m1_order.test.js · [TC-O-23] changeStatus 반환 주문을 수정해도 저장 주문은 변하지 않는다 | 통과 |
| TC-P-01 | my_tests/m3_payment.test.js · [TC-P-01] 성공 시 전체 반환값과 PG 요청을 확인한다 | 통과 |
| TC-P-02 | my_tests/m3_payment.test.js · [TC-P-02] 성공 시 결제 기록은 1건이고 attempt는 1이다 | 통과 |
| TC-P-03 | my_tests/m3_payment.test.js · [TC-P-03] 반환 객체를 변경해도 저장된 주문과 결제 기록은 바뀌지 않는다 | 통과 |
| TC-P-04 | my_tests/m3_payment.test.js · [TC-P-04] PG 실패 시 오류 사유와 결제대기 상태 및 실패 기록을 확인한다 | 통과 (잡는 결함: PG 실패를 성공으로 처리) |
| TC-P-05 | my_tests/m3_payment.test.js · [TC-P-05] PG 시간 초과 시 PG_ERROR와 결제대기 상태 및 실패 기록을 확인한다 | 통과 (잡는 결함: 예외를 성공 처리·메시지 노출) |
| TC-P-06 | my_tests/m3_payment.test.js · [TC-P-06] PG 실패 후 재시도하면 성공하고 시도별 기록을 남긴다 | 통과 |
| TC-P-07 | my_tests/m3_payment.test.js · [TC-P-07] PG 시간 초과 후 재시도하면 성공하고 시도별 기록을 남긴다 | 통과 |
| TC-P-08 | my_tests/m3_payment.test.js · [TC-P-08] 실패 후 다시 시도해 성공하면 attempt와 멱등성 키가 증가한다 | 통과 |
| TC-P-09 | my_tests/m3_payment.test.js · [TC-P-09] 이미 결제된 주문은 첫 성공 결과를 반환하고 PG를 다시 호출하지 않는다 | 통과 |
| TC-P-10 | my_tests/m3_payment.test.js · [TC-P-10] 실패 후 성공한 주문을 다시 결제하면 성공 결과를 반환하고 기록을 늘리지 않는다 | 통과 |
| TC-P-11 | my_tests/m3_payment.test.js · [TC-P-11] 이미 결제된 주문 반환값을 변경해도 저장소는 바뀌지 않는다 | 통과 |
| TC-P-12 | my_tests/m3_payment.test.js · [TC-P-12] 취소된 주문은 결제를 거부하고 PG와 결제 기록을 만들지 않는다 | 통과 (잡는 결함: 결제대기가 아닌 주문 결제 허용) |
| TC-P-13 | my_tests/m3_payment.test.js · [TC-P-13] 다른 사용자의 주문은 결제를 거부한다 | 통과 |
| TC-P-14 | my_tests/m3_payment.test.js · [TC-P-14] 존재하지 않는 주문 ID의 결제를 거부한다 | 통과 |
| TC-P-15 | my_tests/m3_payment.test.js · [TC-P-15] 같은 주문 동시 결제 성공은 PG를 한 번만 호출한다 | 통과, payment.js:62·65 진행 중 요청 공유 변이를 죽임 |
| TC-P-16 | my_tests/m3_payment.test.js · [TC-P-16] 같은 주문 동시 결제 실패는 두 호출에 같은 오류를 돌려준다 | 통과, payment.js:62·65 변이를 죽임 |
| TC-P-17 | my_tests/m3_payment.test.js · [TC-P-17] 서로 다른 주문의 동시 결제는 각각 한 번 성공한다 | 통과 |
| TC-P-18 | my_tests/m3_payment.test.js · [TC-P-18] 한 주문의 결제 실패는 다른 주문의 성공에 영향을 주지 않는다 | 통과 |
| TC-P-19a | my_tests/m5_query_expiry.test.js · [TC-P-19a] 서로 다른 주문의 결제 기록은 서로 다른 id를 가진다 | 통과, payment#26 (payment.js:17 카운터 증가 삭제)를 죽임 |
| TC-P-19b | my_tests/m5_query_expiry.test.js · [TC-P-19b] 실패 뒤 재시도한 결제 기록은 서로 다른 id를 가진다 | 통과, payment#26을 죽임 |
| TC-X-01 | my_tests/m3_cancel.test.js · [TC-X-01] 결제 전 주문을 취소하면 PG 호출 없이 CANCELED 가 되고 재고가 복원된다 | 통과 |
| TC-X-02 | my_tests/m3_cancel.test.js · [TC-X-02] 결제된 주문을 취소하면 환불 성공 후 주문과 재고가 복원된다 | 통과 |
| TC-X-03 | my_tests/m3_cancel.test.js · [TC-X-03] 반환된 주문을 바꿔도 저장된 주문은 바뀌지 않는다 | 통과 |
| TC-X-04 | my_tests/m3_cancel.test.js · [TC-X-04] 환불 실패 시 오류와 PAID 상태 및 미복원 재고를 확인한다 | 통과 |
| TC-X-05 | my_tests/m3_cancel.test.js · [TC-X-05] 환불 실패 뒤 재시도 성공 시 주문·결제·재고가 성공 상태가 된다 | 통과 |
| TC-X-06 | my_tests/m3_cancel.test.js · [TC-X-06] 환불 시간 초과 시 PG_ERROR와 실패 상태 및 미복원 재고를 확인한다 | 통과, cancel#5·#21 (cancel.js:13 환불 예외 처리)를 죽임 |
| TC-X-07a | my_tests/m3_cancel.test.js · [TC-X-07a] PREPARING 주문 취소는 거부되고 주문·결제·재고를 유지한다 | 통과 |
| TC-X-07b | my_tests/m3_cancel.test.js · [TC-X-07b] SHIPPING 주문 취소는 거부되고 주문·결제·재고를 유지한다 | 통과 |
| TC-X-07c | my_tests/m3_cancel.test.js · [TC-X-07c] DELIVERED 주문 취소는 거부되고 주문·결제·재고를 유지한다 | 통과 |
| TC-X-07d | my_tests/m3_cancel.test.js · [TC-X-07d] CANCELED 주문 재취소는 거부되고 주문·재고를 유지한다 | 통과 |
| TC-X-08a | my_tests/m3_cancel.test.js · [TC-X-08a] 남의 PENDING_PAYMENT 주문 취소는 NOT_FOUND이고 상태를 바꾸지 않는다 | 통과 |
| TC-X-08b | my_tests/m3_cancel.test.js · [TC-X-08b] 남의 PAID 주문 취소는 NOT_FOUND이고 결제 기록을 바꾸지 않는다 | 통과 |
| TC-X-08c | my_tests/m3_cancel.test.js · [TC-X-08c] 없는 주문 취소는 NOT_FOUND이고 저장소 상태를 바꾸지 않는다 | 통과 |
| TC-X-09a | my_tests/m3_cancel.test.js · [TC-X-09a] 같은 PAID 주문 동시 취소는 환불과 재고 복원을 한 번만 한다 | 통과, cancel#18·#26 (cancel.js:33·36 동시 취소 중복 방지)를 죽임 |
| TC-X-09b | my_tests/m3_cancel.test.js · [TC-X-09b] 같은 PENDING_PAYMENT 주문 동시 취소는 재고를 한 번만 복원한다 | 통과, cancel#18·#26을 죽임 |
| TC-X-10a | my_tests/m5_query_expiry.test.js · [TC-X-10a] 상품이 삭제된 단일 상품 주문도 취소된다 | 통과, util#7 (util.js:18)을 죽임 |
| TC-X-10b | my_tests/m5_query_expiry.test.js · [TC-X-10b] 삭제 상품 뒤에 있는 상품도 재고를 복원하며 취소된다 | 통과, util#7을 죽임 |
| TC-X-11a | my_tests/m5_query_expiry.test.js · [TC-X-11a] STOPPED 상품의 결제대기 주문도 재고를 복원한다 | 통과 (잡는 결함: STOPPED 상품의 취소에서 재고를 복원하지 않는 결함) |
| TC-X-11b | my_tests/m5_query_expiry.test.js · [TC-X-11b] STOPPED 상품의 PAID 주문도 환불 후 재고를 복원한다 | 통과 (같은 결함) |
| TC-Q-01a | my_tests/m5_query_expiry.test.js · [TC-Q-01a] 주문 상세는 본인 주문의 모든 필드를 반환한다 | 통과 |
| TC-Q-01b | my_tests/m5_query_expiry.test.js · [TC-Q-01b] 남의 주문 상세 조회는 NOT_FOUND다 | 통과, orderQuery#1·#4 (orderQuery.js:6)를 죽임 |
| TC-Q-01c | my_tests/m5_query_expiry.test.js · [TC-Q-01c] 없는 주문 상세 조회는 NOT_FOUND다 | 통과, orderQuery#1·#4를 죽임 |
| TC-Q-01d | my_tests/m5_query_expiry.test.js · [TC-Q-01d] 주문 뒤 상품 가격이 바뀌어도 주문 시점 금액을 반환한다 | 통과 |
| TC-Q-01e | my_tests/m5_query_expiry.test.js · [TC-Q-01e] 주문 뒤 상품이 삭제되어도 주문 시점 상품 정보와 금액을 반환한다 | 통과 |
| TC-Q-01f | my_tests/m5_query_expiry.test.js · [TC-Q-01f] 주문 상세 반환값을 수정해도 저장된 주문은 바뀌지 않는다 | 통과 |
| TC-Q-02a | my_tests/m5_query_expiry.test.js · [TC-Q-02a] 시각이 다른 주문은 최신순으로 반환한다 | 통과 |
| TC-Q-02b | my_tests/m5_query_expiry.test.js · [TC-Q-02b] 같은 시각이면 주문번호가 큰 주문을 먼저 반환한다 | 통과 |
| TC-Q-02c | my_tests/m5_query_expiry.test.js · [TC-Q-02c] 기본 페이지는 10건을 반환하고 전체 건수와 양끝 주문을 표시한다 | 통과 |
| TC-Q-02d | my_tests/m5_query_expiry.test.js · [TC-Q-02d] 11건 중 두 번째 페이지에는 마지막 주문 한 건이 나온다 | 통과 |
| TC-Q-02e | my_tests/m5_query_expiry.test.js · [TC-Q-02e] 범위를 벗어난 페이지의 items는 빈 배열이다 | 통과 |
| TC-Q-02f | my_tests/m5_query_expiry.test.js · [TC-Q-02f] 한 종류 상품의 대표 상품명은 상품명 그대로다 | 통과, orderQuery#10 (orderQuery.js:20 `>`→`>=`)을 죽임 |
| TC-Q-02g | my_tests/m5_query_expiry.test.js · [TC-Q-02g] 두 종류 상품의 대표 상품명과 목록 항목 전체를 반환한다 | 통과, orderQuery#10을 죽임 |
| TC-Q-02h | my_tests/m5_query_expiry.test.js · [TC-Q-02h] 세 종류 상품의 대표 상품명에는 나머지 두 종류 수가 붙는다 | 통과, orderQuery#10을 죽임 |
| TC-Q-02i | my_tests/m5_query_expiry.test.js · [TC-Q-02i] u1의 목록에는 u2의 주문이 포함되지 않는다 | 통과 |
| TC-Q-02j | my_tests/m5_query_expiry.test.js · [TC-Q-02j] 주문이 없는 사용자의 목록은 빈 결과다 | 통과 |
| TC-Q-02k | my_tests/m5_query_expiry.test.js · [TC-Q-02k] 정확히 10건이면 두 번째 페이지는 빈 배열이다 | 통과 |
| TC-E-01a | my_tests/m5_query_expiry.test.js · [TC-E-01a] 시간이 지난 PAID 주문은 건드리지 않는다 | 통과, expiry#2 (expiry.js:11)를 죽임 |
| TC-E-01b | my_tests/m5_query_expiry.test.js · [TC-E-01b] 시간이 지난 PREPARING 주문은 건드리지 않는다 | 통과, expiry#2 (expiry.js:11)를 죽임 |
| TC-E-01c | my_tests/m5_query_expiry.test.js · [TC-E-01c] 시간이 지난 SHIPPING 주문은 건드리지 않는다 | 통과, expiry#2 (expiry.js:11)를 죽임 |
| TC-E-01d | my_tests/m5_query_expiry.test.js · [TC-E-01d] 시간이 지난 DELIVERED 주문은 건드리지 않는다 | 통과, expiry#2 (expiry.js:11)를 죽임 |
| TC-E-01e | my_tests/m5_query_expiry.test.js · [TC-E-01e] 시간이 지난 CANCELED 주문은 건드리지 않는다 | 통과, expiry#2 (expiry.js:11)를 죽임 |
| TC-E-01f | my_tests/m5_query_expiry.test.js · [TC-E-01f] 30분 이상 지난 PENDING_PAYMENT 주문을 취소하고 재고를 복원한다 | 통과 |
| TC-E-01g | my_tests/m5_query_expiry.test.js · [TC-E-01g] 취소된 주문번호를 오름차순으로 반환한다 | 통과 |
| TC-E-01h | my_tests/m5_query_expiry.test.js · [TC-E-01h] 만료된 주문만 취소하고 아직 유효한 주문은 유지한다 | 통과 |
| TC-E-01i | my_tests/m5_query_expiry.test.js · [TC-E-01i] 취소 시 주문 수량만큼 재고를 복원한다 | 통과 |
| TC-E-01j | my_tests/m5_query_expiry.test.js · [TC-E-01j] 반복 호출은 재고를 한 번만 복원한다 | 통과, expiry#2를 죽임 |
| TC-E-01k | my_tests/m5_query_expiry.test.js · [TC-E-01k] 지정한 10분 제한 시간을 적용한다 | 통과 |
| TC-E-01l | my_tests/m5_query_expiry.test.js · [TC-E-01l] 60분 제한 시간에 아직 이른 주문은 유지한다 | 통과 |
| TC-E-01m | my_tests/m5_query_expiry.test.js · [TC-E-01m] STOPPED 상품의 만료 주문도 재고를 복원한다 | 통과 (같은 결함) |

## 3. AI 에게 맡긴 부분과 사람이 확인한 부분 (cart · order)

### cart 부분

- 에이전트에게 요청한 것(프롬프트 요약): 함수 하나씩(addToCart → changeQuantity → removeItem → getCart) 먼저 케이스 목록만 표로 받고(코드·파일 수정 금지, 기대값은 계약서에서만), 사람이 승인한 뒤에 테스트 코드를 작성하게 함
- 사람이 추가·삭제·수정한 것:
  - addToCart: 수량 99 성공(TC-C-17), 합산 후 재고 경계(TC-C-18~20), 반환값 복사본(TC-C-21) 추가. TC-C-10은 TC-C-01과 중복이라 삭제(번호는 비워 둠)
  - changeQuantity: Copilot이 지어낸 P1 단가(1000원)·이름을 실제 기본 상품 값(무선 마우스 15000)으로 수정. 순서 유지(TC-C-35), 수량 늘리기(TC-C-36), 없는 상품(TC-C-37) 추가. maxAddable 값은 계약서에 정의가 없어 단언하지 않음
  - removeItem: 구매자 ID를 u1로 통일, 수량 2 이상 케이스(TC-C-44)와 구매자 분리(TC-C-45) 추가, 반환값과 getCart 일치 확인 추가
  - getCart: 같은 상품을 다시 담아도 순서 유지(TC-C-49)와 다른 구매자의 userId(TC-C-50) 추가, TC-C-46 근거에서 맞지 않는 "0장 복사본" 삭제
- 사람이 대조·검토한 것:
  - Copilot이 낸 목록을 API_CONTRACT.md의 규칙 번호와 하나씩 대조(곽민주 + 김윤영). 근거 없는 케이스는 빼고, 계약에 있는데 빠진 케이스는 추가
  - Copilot이 지어낸 상품 값(1000원, "마우스")을 기본 데이터(무선 마우스 15000원, 재고 10)와 대조해 발견·수정, 대문자 U1을 u1로 통일
  - 수량이 전부 1인 케이스가 많아 수량 99 성공·합산 경계·복사본 반환 케이스가 빠진 것을 발견해 추가
- 사람이 기댓값을 직접 계산한 것: src를 보지 않고 손계산으로 확인. 예) 99×15,000 = 1,485,000원, 3×15,000 + 59,000 = 104,000원, 30,000 + 59,000 = 89,000원. 오류 케이스는 에러 코드와 details.maxAddable을 계약 문구와 대조
- 사람이 테스트 강도를 확인한 것:
  - 테스트 파일에 find(, todo가 남아 있는지 grep으로 확인. 약한 단언이 섞인 버전이 한 번 push된 것을 이 방법으로 찾아 다시 고침
  - npm test를 직접 실행해 68개 중 통과 52, 실패 0, 나머지 16개는 todo(M1 order 이후 작업)임을 확인
  - cart 뮤테이션 점수 71.7% → 89.1% → 97.8%. 남은 생존 뮤턴트 cart.js:61 (if (!p) continue)는 계약에 해당 동작 언급이 없어 테스트를 추가하지 않고 보류
- 아직 확인하지 않은 것(실제로 한 뒤에 [x]로 바꿀 것):
  - [x] 김윤영이 일부러 틀린 기댓값을 넣어 테스트가 실패하는지 확인 (TC-C-47, 49, 50, 40, 44, 45, 41, 19, 13)
  - [x] git status로 src/, ai_tests/ 가 바뀌지 않았는지 확인
- 계약서에 명시되지 않아 가정한 것: 수량 오류와 NOT_FOUND 후 장바구니 불변은 1장 규칙 3의 "오류가 나면 장바구니는 바뀌지 않는다"를 넓게 해석한 팀의 가정. 판매 중지 상품이 담긴 상태의 removeItem·getCart는 명시가 없어 케이스로 만들지 않음

### order 부분

- 에이전트에게 요청한 것(프롬프트 요약): createOrder → 상태 전이(canTransition·changeStatus) 순서로, 먼저 케이스 목록만 표로 받고(코드·파일 수정 금지, 기대값은 계약서·SRS에서만, src 열람 금지, 가격은 fresh() 실제 값만), 사람이 승인한 뒤에 테스트 코드를 작성하게 함
- 사람이 추가·삭제·수정한 것:
  - createOrder: "동시 주문"(TC-O-14)은 JS가 동기 실행이라 순차 주문(TC-O-17)으로 변경. TC-O-04~07에 장바구니·재고 불변 단언 추가. 일부만 부족해도 전체 거부(TC-O-11), 실패 후 주문번호(TC-O-12), 다른 구매자 장바구니(TC-O-13), userId·상품명 단언 추가. 수정본에서 Copilot이 말없이 지운 "부족 상품 두 개일 때 shortages 순서" 케이스를 TC-O-18로 다시 추가. TC-O-11의 shortages는 길이 1과 내용 정확 일치로 강화
  - 상태 전이: 프롬프트에 있던 NOT_FOUND의 details.orderId 단언은 Copilot이 "계약서에 없는 추가 가정"이라고 경고해 코드만 확인(TC-O-22). 상태별 주문은 seedOrder로 준비하게 하고, 36개 조합의 실패 메시지에 from -> to를 넣게 함. 반환 주문 복사본(TC-O-23) 추가
- 사람이 확인한 것:
  - 기댓값은 src를 보지 않고 계산: 2×15000+59000=89000, 1×25000=25000, 1×59000=59000
  - 주문 항목 순서는 배열 deepEqual로 검사. createdAt은 고정 시작 시각의 가짜 시계 값과 비교
  - 전이표(90~100행)를 김윤영과 한 칸씩 대조
  - 코드 작성 중 Copilot이 낸 구문 오류·변수 누락·시계 문제를 확인(테스트 쪽 실수, src는 수정하지 않음)
  - 합쳐지다 만 파일을 줄 삭제로 정리하고 node --check, npm test(74개 통과)로 확인
- 일부러 틀린 값으로 실패 확인(김윤영): TC-O-01 총액 89000→89001, TC-O-01 ORD-0001→ORD-0002, TC-O-11 available 0→1, TC-O-14 단가 15000→59000, TC-O-16 ORD-0002→ORD-0003, TC-O-18 shortages 순서 교환 → 6곳 모두 실패 확인. 상태 전이 테스트도 확인 완료
- 변이 점수: order.js 94.9%(37/39) → 100%(39/39). 94.9%일 때 살아남은 order.js:30, :31은 changeStatus 테스트로 해결
- 계약서에 명시되지 않아 가정한 것: 상태 전이의 NOT_FOUND details는 계약에 없어 단언하지 않음. TC-O-12 "실패한 주문은 주문번호를 소비하지 않는다"는 계약서에 그 문장이 없다. 2장 규칙 3(부족하면 재고·장바구니·주문은 아무것도 바뀌지 않는다)과 규칙 4(id는 ORD-0001, ORD-0002 … 순차)를 함께 읽어 "실패 뒤 첫 성공 주문은 ORD-0001"로 단언한 팀 해석이다 [x]. TC-O-13의 근거 표기(1장 규칙 6 구매자마다 장바구니 분리, 2장 규칙 4의 "주문이 만들어지면 그 구매자의 장바구니는 비워진다")는 계약서 문구와 맞음을 확인했다 [x]

## 4. 계약서에 명시되지 않아 팀이 가정한 것 (결제 · 취소 · 주문 조회 · 자동 취소)
Mission 3, Mission 5 테스트에서 계약서가 직접 정하지 않은 값이나 동작을 단언한 경우를 모았다. 각 테스트 코드 위에도 "팀 가정" 주석으로 표시했다. 이 가정이 실제 의도와 다르면 해당 테스트가 틀린 쪽이 될 수 있다. (장바구니 maxAddable 해석(TC-R-15)은 PLAN.md 5절에 따로 적었다.)

| 관련 케이스 | 가정한 내용 | 관련 계약·SRS | 가정한 이유 | 가정이 틀리면 |
|---|---|---|---|---|
| TC-P-09 | 이미 결제된 주문을 다시 결제하면 "기존 결과"를, 처음 성공 결과(order, payment)에 `alreadyPaid: true`만 다른 것으로 읽는다 | 3장 규칙 2 (110줄) | "기존 결과"의 범위가 정해져 있지 않음 | 반환값 단언이 달라진다 |
| TC-P-12 | 취소된 주문을 결제하면 결제 기록이 생기지 않고 주문은 CANCELED로 유지된다 | 3장 규칙 3 (111줄) | 규칙 3은 INVALID_STATE와 PG 미요청만 정함 | 기록 길이·상태 단언이 달라진다 |
| TC-P-13, TC-P-14 | 남의 주문·없는 주문을 결제하면 PG 미호출, 결제 기록 없음, 주문 상태 유지 | 3장 규칙 1 (109줄), 공통 규칙 15줄 | 규칙 1은 NOT_FOUND만 정함 | PG·기록 단언이 달라진다 |
| TC-P-15 | 같은 주문의 동시 결제가 성공하면 결제 기록은 1건이다. 두 호출의 반환값은 단언하지 않는다 | 3장 규칙 7 (116줄) | 규칙 7은 PG 요청 횟수만 정함 | 기록 길이 단언이 달라진다 |
| TC-P-17, TC-P-18 | 금액(30000, 59000)은 `fresh()` 기본 상품 값으로 계산한 것이다 | 3장 규칙 8 (117줄) | 계약서에 상품 값이 없고 테스트 도구의 기본 데이터 기준 | 기본 데이터가 바뀌면 기대값이 달라진다 |
| TC-P-19a, TC-P-19b | 서로 다른 결제 기록의 id는 서로 달라야 한다. id의 형식은 단정하지 않는다 | 데이터 구조 38, 39, 45줄 | 결제 기록에 id가 있고 번호 발급용 카운터가 있으나 고유성·형식은 적혀 있지 않음 | 두 테스트의 기대가 틀린 쪽이 된다 (payment#5·#6은 형식을 단정해야 죽으므로 남김) |
| TC-X-04, TC-X-06 | 환불 실패 뒤 결제 status는 "REFUNDED"가 아니기만 확인하고, `refund.at`은 존재 여부만 확인한다. 예외일 때 `refund.reason`도 "PG_ERROR"이다 | 4장 규칙 4 (131~132줄) | 결제 status 값과 `refund.at` 형식은 정해져 있지 않고, 예외일 때 `refund.reason` 값은 `details.reason`만 정해져 있음 | 약한 단언이라 영향이 작다 |
| TC-X-05 | 재시도 성공 뒤에는 `refund.reason`이 남지 않는다 | 4장 규칙 4 (131~132줄) | 재시도 성공 뒤 기록 형태가 정해져 있지 않음 | 해당 단언이 틀린 쪽이 된다 |
| TC-X-07a~d | 취소할 수 없는 상태에서 거부되면 결제 기록(refund 필드)이 바뀌지 않는다 | 4장 규칙 2 (128줄) | 규칙 2는 환불·재고에 아무 일도 일어나지 않는다고만 정함 | 결제 기록 단언이 달라진다 |
| TC-X-08a~c | 남의 주문이면서 취소할 수 없는 상태인 경우의 검사 순서는 정하지 않고 케이스로 만들지 않았다. 남의 주문·없는 주문을 취소하면 저장소 전체가 바뀌지 않는다 | 4장 규칙 1, 2 (127, 128줄) | 규칙 1과 2의 우선순위가 계약에 없음 | 영향 없음 (케이스 없음), 불변 단언은 달라질 수 있다 |
| TC-X-09a, TC-X-09b | 같은 주문의 동시 취소에서 두 번째 호출의 결과는 "성공 또는 INVALID_STATE"이다 | 4장 규칙 5 (133줄) | 규칙 5는 환불·재고 복원이 한 번이라고만 정함 | 거부 분기 단언이 달라진다 |
| TC-X-10a, TC-X-10b | 주문 뒤 상품이 저장소에서 삭제되어도 취소는 성공하고, 삭제된 상품은 건너뛰고 나머지 상품은 복원된다. 삭제는 `ctx.store.products.delete`로 흉내 낸다 | 4장 규칙 3 (129줄), 5장 규칙 2 (142줄), 35줄 | 주문 뒤 상품 삭제는 허용되지만 그때의 취소 동작은 정해져 있지 않음 | 두 테스트가 틀린 쪽이 된다 (util#7을 죽이는 근거) |
| TC-X-11a, TC-X-11b, TC-E-01m | 주문 뒤 상품이 STOPPED가 되어도 취소·자동 취소는 주문 수량만큼 재고를 복원한다. 상태 변경은 `ctx.store.products.get("P1").status = "STOPPED"`로 흉내 낸다 | 4장 규칙 3·4 (129~131줄), 6장 규칙 1 (152줄), 데이터 구조 35줄 | 복원 규칙에 상품 상태 조건이 없고, STOPPED일 때의 복원 여부는 직접 정해져 있지 않음 | 세 테스트가 틀린 쪽이 된다 (판매 중지 상품은 복원하지 않는다는 결함을 잡는 근거) |
| TC-Q-01d, TC-Q-01e | 상품 가격 변경·삭제를 `ctx.store.products`를 직접 고쳐 흉내 낸다 (17000원, `delete("P2")`) | 5장 규칙 2 (142줄), 35줄 | 계약서가 저장소 구조를 공개해 허용하지만 변경 방식은 정해져 있지 않음 | 저장소 구조가 바뀌면 테스트가 깨진다 |
| TC-Q-02j | 주문이 없는 사용자의 목록은 `items: []`, `total: 0`이다 | 5장 규칙 4 (144줄), SRS US-09 50줄 | SRS의 "주문 내역이 없습니다"는 화면 문구이고 계약서의 반환 형태는 `items: []` | 단언이 달라진다 |

계약서에 정의가 없어 테스트하지 않기로 한 것: 주문 목록의 page 0 같은 잘못된 페이지 값, 장바구니에 담긴 상품이 저장소에서 삭제된 뒤의 `getCart`(cart#35), 결제 id 형식(payment#5, #6).