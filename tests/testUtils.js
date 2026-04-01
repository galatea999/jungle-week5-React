// ============================================================
// testUtils.js — 브라우저 스모크 테스트 공용 helper
// ============================================================
//
// 지금 단계의 tests 폴더는 정식 테스트 러너까지는 아니지만,
// 최소한 "브라우저에서 바로 돌려 볼 수 있는 assertion"은 갖추기 시작했다.
//
// 이 helper는 각 테스트 파일이 같은 패턴으로
// sandbox 생성 -> assertion -> 결과 정리 흐름을 재사용하게 도와준다.
// ============================================================

// 조건이 거짓이면 즉시 테스트를 실패시킨다.
export function assert(condition, message) {
  if (!condition) {
    throw new Error(message);
  }
}

// 실제값과 기대값이 정확히 같은지 검사한다.
export function assertEqual(actual, expected, message) {
  if (!Object.is(actual, expected)) {
    throw new Error(
      `${message} (expected: ${formatValue(expected)}, actual: ${formatValue(actual)})`,
    );
  }
}

// 각 테스트가 사용할 임시 DOM 공간을 만든다.
// hidden 속성을 써 두면 페이지를 크게 흔들지 않으면서도 실제 DOM 연산은 그대로 할 수 있다.
export function createSandbox() {
  const sandbox = document.createElement('div');

  sandbox.hidden = true;
  sandbox.dataset.testSandbox = 'true';
  document.body.appendChild(sandbox);

  return sandbox;
}

// 테스트가 끝난 뒤 임시 DOM을 정리한다.
export function cleanupSandbox(sandbox) {
  if (sandbox?.remove) {
    sandbox.remove();
  }
}

// 버튼 클릭처럼 가장 기본적인 사용자 동작을 흉내 낸다.
export function triggerClick(element) {
  if (!element) {
    throw new Error('클릭할 대상 요소가 없습니다.');
  }

  element.click();
}

// input 요소 값 변경과 input 이벤트 dispatch를 함께 처리한다.
export function triggerInput(element, value) {
  if (!element) {
    throw new Error('입력 이벤트를 보낼 대상 요소가 없습니다.');
  }

  element.value = value;
  element.dispatchEvent(new Event('input', { bubbles: true }));
}

// 테스트 케이스 배열을 순회하며 passed/failed 결과 배열로 바꾼다.
export function runTestCases(testCases = []) {
  return testCases.map((testCase) => {
    try {
      const details = testCase.run();

      return {
        name: testCase.name,
        status: 'passed',
        details: typeof details === 'string' ? details : '검증이 통과했습니다.',
      };
    } catch (error) {
      return {
        name: testCase.name,
        status: 'failed',
        details: error?.message || '알 수 없는 테스트 오류가 발생했습니다.',
      };
    }
  });
}

function formatValue(value) {
  if (typeof value === 'string') {
    return `"${value}"`;
  }

  try {
    return JSON.stringify(value);
  } catch {
    return String(value);
  }
}
