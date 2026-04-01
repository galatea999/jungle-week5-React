// ============================================================
// component.test.js — 컴포넌트 테스트 시나리오
// ============================================================
//
// 이 파일은 아직 자동 assertion을 실행하지는 않지만,
// "FunctionComponent가 최소한 어디까지는 되어야 하는가?"를
// 시나리오 형태로 먼저 정리해 두는 테스트 명세서 역할을 한다.
//
// framework가 완성되면 이 데이터를 기반으로 실제 테스트 코드를 붙이기 쉽다.
// ============================================================

// 각 객체는 "검증 항목 하나"를 뜻한다.
// name, reason만 있던 초기 스텁에서 한 단계 더 나아가
// setup, checkpoints, nextStep까지 적어 두어 실제 테스트 작성 준비도를 높였다.
const COMPONENT_TEST_SCENARIOS = [
  {
    name: 'FunctionComponent가 mount 시 첫 화면을 렌더링해야 한다',
    reason: '학습 페이지의 모든 예제는 처음 진입했을 때 바로 보여야 하기 때문이다.',
    setup: 'FunctionComponent 인스턴스를 만든 뒤 빈 컨테이너에 mount를 호출한다.',
    checkpoints: [
      'mount 직후 컨테이너 안에 첫 DOM 결과가 생긴다.',
      '컴포넌트 함수가 반환한 Virtual DOM 구조가 실제 DOM으로 반영된다.',
      '첫 렌더링 과정에서 예외 없이 종료된다.',
    ],
    nextStep: '간단한 Hello 컴포넌트를 mount하고 컨테이너 내부 텍스트를 assertion으로 확인한다.',
  },
  {
    name: 'props를 바꾸면 새 Virtual DOM이 만들어져야 한다',
    reason: '부모가 값을 바꾸면 자식 화면도 함께 바뀌어야 하기 때문이다.',
    setup: '같은 컴포넌트에 서로 다른 props를 넣어 두 번 렌더링한다.',
    checkpoints: [
      '새 props로 컴포넌트 함수가 다시 실행된다.',
      '이전 값이 아니라 새 props 값이 텍스트나 속성에 반영된다.',
      '전체 DOM을 새로 만들지 않고 필요한 부분만 업데이트할 준비가 된다.',
    ],
    nextStep: '이름을 props로 받는 카드 예제를 만든 뒤 props 변경 전후 DOM 텍스트를 비교한다.',
  },
  {
    name: '컴포넌트가 text node를 반환해도 깨지지 않아야 한다',
    reason: '아주 단순한 예제도 실습에서 자주 쓰이기 때문이다.',
    setup: '컴포넌트 함수가 element 대신 문자열 또는 text node 성격의 값을 반환한다.',
    checkpoints: [
      '렌더러가 text 결과를 예외 없이 처리한다.',
      '컨테이너 안에 실제 텍스트가 보인다.',
      '이후 rerender에서도 text 업데이트 경로가 유지된다.',
    ],
    nextStep: 'TextOnly 컴포넌트를 만들어 mount 후 컨테이너 textContent를 바로 확인한다.',
  },
];

// 시나리오 원본을 그대로 돌려주는 getter다.
// 테스트 UI와 실제 테스트 코드가 같은 데이터를 참고할 수 있게 만들려는 의도다.
export function getComponentTestScenarios() {
  return COMPONENT_TEST_SCENARIOS;
}

// 브라우저 러너에서 바로 렌더링하기 쉬운 형태로 결과를 만든다.
// 지금은 모두 pending이지만, 나중에 실제 실행 결과로 교체할 수 있다.
export function runComponentStubTests() {
  return COMPONENT_TEST_SCENARIOS.map((scenario) => ({
    ...scenario,
    status: 'pending',
  }));
}
