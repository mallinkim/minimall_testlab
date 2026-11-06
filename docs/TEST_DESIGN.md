

## 1. 동등분할 · 경계값 표 (cart 부분)

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

## 2. 설계 → 테스트 추적표 (cart 부분)
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

## 3. AI 에게 맡긴 부분과 사람이 확인한 부분 (cart 부분)

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
- 아직 확인하지 않은 것(실제로 한 뒤에 [o]로 바꿀 것):
  - [ ] 김윤영이 일부러 틀린 기댓값을 넣어 테스트가 실패하는지 확인 (TC-C-47, 49, 50, 40, 44, 45, 41, 19, 13)
  - [ ] git status로 src/, ai_tests/ 가 바뀌지 않았는지 확인
- 계약서에 명시되지 않아 가정한 것: 수량 오류와 NOT_FOUND 후 장바구니 불변은 1장 규칙 3의 "오류가 나면 장바구니는 바뀌지 않는다"를 넓게 해석한 팀의 가정. 판매 중지 상품이 담긴 상태의 removeItem·getCart는 명시가 없어 케이스로 만들지 않음