// ============================================================
// integration.test.js — 통합 테스트 시나리오
// ============================================================
//
// 여기서는 "각 부품이 따로는 되는데 같이 붙였을 때도 되는가?"를
// 확인할 시나리오를 적어 둔다.
//
// unit test가 함수 하나의 약속을 본다면,
// integration test는 render -> state update -> DOM 반영이 실제로 이어지는지 본다.
// ============================================================

// 이번 프로젝트에서 특히 중요한 통합 흐름만 먼저 골라 둔 목록이다.
// 학습 페이지의 직접 해보기 경험과 framework 파이프라인이 모두 포함되도록 구성했다.
const INTEGRATION_SCENARIOS = [
  {
    name: '컴포넌트 mount 후 실제 DOM이 컨테이너에 붙어야 한다',
    reason: 'render 단계가 끝나면 사용자가 실제 결과를 눈으로 볼 수 있어야 한다.',
    setup: '루트 컴포넌트를 mount한 뒤 preview 또는 임시 컨테이너를 확인한다.',
    checkpoints: [
      'mount 직후 컨테이너가 비어 있지 않다.',
      '예상한 제목, 버튼, 텍스트 같은 핵심 DOM이 실제로 존재한다.',
      '초기 렌더링 흐름이 끊기지 않고 완료된다.',
    ],
    nextStep: 'HelloApp 같은 최소 예제를 root에 mount하고 컨테이너 자식 노드 존재 여부를 assertion한다.',
  },
  {
    name: 'setState 후 diff와 patch가 연결되어 DOM 일부만 바뀌어야 한다',
    reason: '이번 주 핵심인 Virtual DOM 파이프라인을 검증하는 테스트다.',
    setup: '카운터 버튼 클릭으로 state를 바꾸고, 이전 DOM과 이후 DOM 변화를 비교한다.',
    checkpoints: [
      'setState 뒤 rerender가 일어난다.',
      'diff가 새 트리와 이전 트리를 비교한다.',
      '최종 DOM에는 필요한 텍스트 또는 속성만 바뀐 결과가 남는다.',
    ],
    nextStep: '카운터 예제를 사용해 클릭 전후 DOM 텍스트와 patch 적용 결과를 함께 assertion한다.',
  },
  {
    name: '학습용 playground에서 실행한 코드가 preview 컨테이너에 렌더링돼야 한다',
    reason: '직접 해보기 섹션의 가장 중요한 사용자 경험이기 때문이다.',
    setup: 'playground 입력 코드를 실행한 뒤 preview 영역에 결과가 생기는지 확인한다.',
    checkpoints: [
      '코드 실행 버튼이 preview 갱신 흐름을 시작한다.',
      '예제 코드가 framework 진입점과 연결된다.',
      'preview 영역에서 학생이 눈으로 결과를 바로 확인할 수 있다.',
    ],
    nextStep: 'codePlayground가 연결되면 실행 버튼 클릭 이후 preview DOM 변화를 assertion한다.',
  },
];

// 원본 시나리오 배열을 그대로 돌려주는 getter다.
export function getIntegrationScenarios() {
  return INTEGRATION_SCENARIOS;
}

// 브라우저 시나리오 러너에서 쓰기 쉬운 형태로 status를 덧붙인다.
export function runIntegrationStubTests() {
  return INTEGRATION_SCENARIOS.map((scenario) => ({
    ...scenario,
    status: 'pending',
  }));
}
