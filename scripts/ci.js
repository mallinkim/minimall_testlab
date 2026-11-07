#!/usr/bin/env node
// Mission 4 — CI 게이트: "이 변경을 합쳐도 되는가?"를 사람이 아니라 스크립트가 판단한다.
//   npm run ci          (종료 코드 0 = 통과, 1 = 실패 — CI 서비스는 종료 코드를 본다)
//
// 아래 TODO 를 완성하세요. 완성한 게이트는 두 가지를 모두 만족해야 합니다.
//   (1) 여러분의 테스트(my_tests/)로 실행하면 통과한다.
//   (2) 'AI 가 만든 약한 테스트(ai_tests/)'로 바꿔 넣으면 실패한다.  ← 줄 커버리지만으로는 (2)를 만족하기 어렵다!
const { listTests, runTests, coverage } = require("./lib");
const { spawnSync } = require("child_process");
const path = require("path");

const THRESHOLDS = {
  lineCoverage: 95,
  mutationScore: 85,
};

const args = process.argv.slice(2);
const testsOption = args.indexOf("--tests");
const testsDir = testsOption >= 0 && args[testsOption + 1] && !args[testsOption + 1].startsWith("--")
  ? args[testsOption + 1]
  : "my_tests";
const testFiles = listTests(testsDir);

const results = [];
function step(name, ok, detail) {
  results.push({ name, ok });
  console.log(`${ok ? "✔" : "✘"} ${name} — ${detail}`);
}

// 1단계: 테스트가 통과한다 (제공됨)
const t = testFiles.length ? runTests(testFiles) : { ok: false, pass: 0, tests: 0, todo: 0 };
step("테스트", t.ok, `${testsDir}: ${t.pass}/${t.tests - t.todo} 통과 (todo ${t.todo}개 제외)`);

// 2단계: 줄 커버리지가 기준 이상이다
const c = testFiles.length ? coverage(testFiles) : { ok: false, line: 0 };
step(
  "줄 커버리지",
  c.ok && c.line >= THRESHOLDS.lineCoverage,
  `${testsDir}: ${c.line}% (기준 ${THRESHOLDS.lineCoverage}%)`,
);

// 3단계: 변이 점수가 기준 이상이다
const mutation = spawnSync(
  process.execPath,
  [path.join(__dirname, "mutate.js"), "--tests", testsDir, "--json"],
  { encoding: "utf8", cwd: path.resolve(__dirname, ".."), maxBuffer: 10 * 1024 * 1024 },
);
let mutationOk = false;
let mutationDetail;
if (mutation.error) {
  mutationDetail = `변이 도구 실행 실패: ${mutation.error.message}`;
} else if (mutation.status !== 0) {
  const diagnostic = (mutation.stderr || "").trim();
  mutationDetail = `변이 도구 종료 코드 ${mutation.status}${diagnostic ? `: ${diagnostic}` : ""}`;
} else {
  try {
    const report = JSON.parse(mutation.stdout);
    if (typeof report.score !== "number" || !Number.isFinite(report.score)) {
      mutationDetail = "변이 도구 JSON에 유효한 score가 없습니다.";
    } else {
      mutationOk = report.score >= THRESHOLDS.mutationScore;
      mutationDetail = `${testsDir}: ${report.score}% (기준 ${THRESHOLDS.mutationScore}%)`;
    }
  } catch (error) {
    mutationDetail = `변이 도구 JSON을 읽을 수 없습니다: ${error.message}`;
  }
}
step("변이 점수", mutationOk, mutationDetail);

// 4단계(선택): 불안정 검사 — node scripts/repeat.js flaky_tests --times 10 --json 이 통과하는가?

const failed = results.some((r) => !r.ok);
console.log(failed ? "\nCI 실패" : "\nCI 통과");
process.exit(failed ? 1 : 0);
