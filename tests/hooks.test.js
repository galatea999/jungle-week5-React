// ============================================================
// hooks.test.js — hooks 테스트 시나리오
// ============================================================
//
// 아직 자동 assertion 단계는 아니지만,
// Hook마다 어떤 입력과 어떤 결과를 검증해야 하는지는
// 바로 옮겨 적을 수 있게 구체적으로 정리해 둔다.
//
// Hook은 "호출 순서"와 "이전 값 기억"이 핵심이라서,
// 단순 성공/실패 목록보다 상황 설명이 자세한 시나리오 형태가 더 도움이 된다.
// ============================================================

// 각 시나리오는 Hook 하나의 대표 동작을 설명한다.
// hook 필드는 framework.test.html에서 그룹을 읽기 쉽게 보조하는 역할도 한다.
const HOOK_TEST_SCENARIOS = [
  {
    hook: 'useState',
    name: 'useState가 첫 렌더링에서 초기값을 저장해야 한다',
    reason: '카운터나 입력창 예제가 모두 여기서 시작하기 때문이다.',
    setup: 'Counter 컴포넌트가 useState(0)을 호출하고, 버튼 또는 문장에 현재 count를 렌더링한다.',
    checkpoints: [
      '첫 렌더링에서 첫 번째 hook 칸에 초기값 0이 저장된다.',
      '렌더링 결과 DOM에 count 0이 보인다.',
      '다음 렌더링 전까지 초기값 계산이 다시 일어나지 않는다.',
    ],
    nextStep: 'Counter 예제를 mount한 뒤 초기 DOM과 첫 번째 hook 슬롯 값을 assertion으로 확인한다.',
  },
  {
    hook: 'useState',
    name: '여러 useState가 각자 자기 자리 값을 따로 기억해야 한다',
    reason: 'Hook은 호출 순서로 자리를 찾기 때문에, 슬롯이 섞이면 모든 예제가 불안정해진다.',
    setup: '같은 컴포넌트에서 title과 count를 각각 다른 useState로 선언한다.',
    checkpoints: [
      '첫 번째 state와 두 번째 state가 서로 다른 hook 칸에 저장된다.',
      '두 번째 setter를 호출해도 첫 번째 state 값은 그대로 유지된다.',
      '렌더링 결과에서 두 값이 각자 올바른 위치에 남아 있다.',
    ],
    nextStep: 'state 두 개를 가진 예제를 만들고, 각 setter 호출 뒤 hooks 배열과 DOM이 독립적으로 바뀌는지 확인한다.',
  },
  {
    hook: 'useState',
    name: 'setState 호출 후 update가 다시 실행돼야 한다',
    reason: '상태가 바뀌었는데 화면이 그대로면 Hook 학습이 성립하지 않는다.',
    setup: '버튼 클릭 이벤트에서 setCount(count + 1)을 호출하는 Counter 예제를 사용한다.',
    checkpoints: [
      'setter 호출 뒤 컴포넌트 update가 다시 실행된다.',
      '새 Virtual DOM과 이전 Virtual DOM이 비교된다.',
      '실제 DOM 텍스트가 0에서 1로 바뀐다.',
    ],
    nextStep: '클릭 이벤트 이후 update 호출 횟수와 DOM 텍스트 변경을 연결해 assertion한다.',
  },
  {
    hook: 'useEffect',
    name: 'useEffect가 의존성 배열에 따라 실행 여부를 결정해야 한다',
    reason: '무한 실행을 막고, 필요한 때만 effect가 동작해야 하기 때문이다.',
    setup: '같은 effect를 첫 렌더링, 같은 deps 재렌더링, 다른 deps 재렌더링에 차례로 노출한다.',
    checkpoints: [
      '첫 렌더링 뒤 effect가 한 번 실행된다.',
      'deps가 같으면 다음 렌더링에서는 effect가 다시 실행되지 않는다.',
      'deps가 바뀌면 다음 렌더링 뒤 effect가 다시 실행된다.',
    ],
    nextStep: 'effect 실행 횟수를 기록하는 카운터를 두고, deps 조합을 바꿔 가며 호출 수를 assertion한다.',
  },
  {
    hook: 'useMemo',
    name: 'useMemo가 같은 deps에서는 이전 계산 결과를 재사용해야 한다',
    reason: '비싼 계산을 줄이는 목적을 실제로 검증해야 하기 때문이다.',
    setup: 'numbers 배열로 합계를 구하는 factory 함수 호출 횟수를 기록한다.',
    checkpoints: [
      '첫 렌더링에서 factory가 한 번 실행된다.',
      'deps가 같으면 다음 렌더링에서는 이전 결과를 그대로 돌려준다.',
      'deps가 바뀌면 factory가 다시 실행되고 새 결과가 반환된다.',
    ],
    nextStep: 'memo factory 호출 횟수를 측정하면서 같은 deps와 바뀐 deps 상황을 각각 assertion한다.',
  },
];

// 테스트 UI나 문서가 원본 시나리오를 그대로 보고 싶을 때 쓰는 getter다.
export function getHookTestScenarios() {
  return HOOK_TEST_SCENARIOS;
}

// framework.test.html에서 바로 쓰기 쉽게 pending 상태를 붙여 돌려준다.
export function runHookStubTests() {
  return HOOK_TEST_SCENARIOS.map((scenario) => ({
    ...scenario,
    status: 'pending',
  }));
}
