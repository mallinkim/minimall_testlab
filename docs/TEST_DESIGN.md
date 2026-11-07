## 1. 동등분할 · 경계값 표 (cart · order)

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

## 2. 설계 → 테스트 추적표 (cart · order)
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
- 사람이 확인한 것:## 1. 동등분할 · 경계값 표 (cart · order)

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

## 2. 설계 → 테스트 추적표 (cart · order)
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
| TC-Q-01d, TC-Q-01e | 상품 가격 변경·삭제를 `ctx.store.products`를 직접 고쳐 흉내 낸다 (17000원, `delete("P2")`) | 5장 규칙 2 (142줄), 35줄 | 계약서가 저장소 구조를 공개해 허용하지만 변경 방식은 정해져 있지 않음 | 저장소 구조가 바뀌면 테스트가 깨진다 |
| TC-Q-02j | 주문이 없는 사용자의 목록은 `items: []`, `total: 0`이다 | 5장 규칙 4 (144줄), SRS US-09 50줄 | SRS의 "주문 내역이 없습니다"는 화면 문구이고 계약서의 반환 형태는 `items: []` | 단언이 달라진다 |

계약서에 정의가 없어 테스트하지 않기로 한 것: 주문 목록의 page 0 같은 잘못된 페이지 값, 장바구니에 담긴 상품이 저장소에서 삭제된 뒤의 `getCart`(cart#35), 결제 id 형식(payment#5, #6).
  - 기댓값은 src를 보지 않고 계산: 2×15000+59000=89000, 1×25000=25000, 1×59000=59000
  - 주문 항목 순서는 배열 deepEqual로 검사. createdAt은 고정 시작 시각의 가짜 시계 값과 비교
  - 전이표(90~100행)를 김윤영과 한 칸씩 대조
  - 코드 작성 중 Copilot이 낸 구문 오류·변수 누락·시계 문제를 확인(테스트 쪽 실수, src는 수정하지 않음)
  - 합쳐지다 만 파일을 줄 삭제로 정리하고 node --check, npm test(74개 통과)로 확인
- 일부러 틀린 값으로 실패 확인(김윤영): TC-O-01 총액 89000→89001, TC-O-01 ORD-0001→ORD-0002, TC-O-11 available 0→1, TC-O-14 단가 15000→59000, TC-O-16 ORD-0002→ORD-0003, TC-O-18 shortages 순서 교환 → 6곳 모두 실패 확인. 상태 전이 테스트도 확인 완료
- 변이 점수: order.js 94.9%(37/39) → 100%(39/39). 94.9%일 때 살아남은 order.js:30, :31은 changeStatus 테스트로 해결
- 계약서에 명시되지 않아 가정한 것: 상태 전이의 NOT_FOUND details는 계약에 없어 단언하지 않음. [ ] TC-O-12 "실패한 주문은 주문번호를 소비하지 않는다"는 계약서 명시 여부를 확인해 명시가 없으면 팀 가정으로 표시. [ ] TC-O-13의 근거(1장 규칙 6) 표기 확인