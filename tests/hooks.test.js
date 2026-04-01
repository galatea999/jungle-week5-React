// ============================================================
// hooks.test.js — hooks 테스트 시나리오
// ============================================================
//
// Hook마다 어떤 입력과 어떤 결과를 검증해야 하는지
// 시나리오와 스모크 테스트 두 층으로 정리한다.
//
// Hook은 "호출 순서"와 "이전 값 기억"이 핵심이라서,
// 단순 성공/실패 목록보다 상황 설명이 자세한 시나리오 형태가 더 도움이 된다.
// ============================================================

import { h } from '../src/framework/createElement.js';
import { renderApp } from '../src/framework/reconciler.js';
import { useEffect, useMemo, useState } from '../src/framework/hooks.js';
import {
  assert,
  assertEqual,
  createSandbox,
  cleanupSandbox,
  runTestCases,
  triggerClick,
  triggerInput,
} from './testUtils.js';

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
    hook: 'useState',
    name: '버튼 클릭이 실제 DOM 이벤트로 setState를 트리거해야 한다',
    reason: '학생이 직접 버튼을 눌렀을 때 화면이 바뀌지 않으면 playground 학습 경험이 완성되지 않는다.',
    setup: 'Counter 컴포넌트를 DOM에 렌더링한 뒤 실제 button.click()을 호출한다.',
    checkpoints: [
      'button click이 onclick handler를 실제로 호출한다.',
      'handler 안의 setState가 다시 렌더링을 시작한다.',
      'DOM 텍스트가 클릭 전후에 달라진다.',
    ],
    nextStep: 'Counter 예제를 mount하고 실제 button.click() 이후 count 문구가 바뀌는지 assertion한다.',
  },
  {
    hook: 'useEffect',
    name: '입력 이벤트가 실제 DOM을 통해 effect 재실행으로 이어져야 한다',
    reason: '이름 입력 같은 학습 예제가 실제 input 이벤트에 반응해야 학생이 deps 변화를 눈으로 확인할 수 있다.',
    setup: 'input과 effect log를 가진 컴포넌트를 렌더링한 뒤 input 이벤트를 dispatch한다.',
    checkpoints: [
      'input event가 oninput handler를 호출한다.',
      'state 변경 뒤 effect가 새 deps 값으로 다시 실행된다.',
      'effect log나 DOM 문구가 새 입력값 기준으로 갱신된다.',
    ],
    nextStep: 'input 요소에 새 값을 넣고 input 이벤트를 보낸 뒤 effect log 텍스트가 바뀌는지 assertion한다.',
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

// 실제 브라우저에서 바로 돌려 볼 수 있는 최소 Hook assertion 묶음이다.
// useState/useEffect/useMemo의 가장 중요한 회귀 포인트부터 먼저 잡는다.
const HOOK_SMOKE_TESTS = [
  {
    name: 'useState가 첫 렌더링에서 초기값을 저장해야 한다',
    run() {
      const sandbox = createSandbox();

      try {
        let appRef = null;

        function Counter() {
          const [count] = useState(0);
          return h('p', null, 'count: ' + count);
        }

        appRef = renderApp(Counter, sandbox);

        assertEqual(appRef.hooks[0], 0, '첫 번째 hook 슬롯에 초기값 0이 저장돼야 합니다.');
        assert(
          sandbox.textContent.includes('count: 0'),
          '초기 렌더링 결과 DOM에 count 0이 보여야 합니다.',
        );

        return 'useState 초기값이 hook 슬롯과 DOM에 함께 반영되었습니다.';
      } finally {
        cleanupSandbox(sandbox);
      }
    },
  },
  {
    name: '여러 useState가 각자 자기 자리 값을 따로 기억해야 한다',
    run() {
      const sandbox = createSandbox();

      try {
        let setCount = null;
        let appRef = null;

        function DualStateCard() {
          const [title] = useState('React');
          const [count, setCountLocal] = useState(0);

          setCount = setCountLocal;

          return h('p', null, title + ' / ' + count);
        }

        appRef = renderApp(DualStateCard, sandbox);
        setCount(1);

        assertEqual(appRef.hooks[0], 'React', '첫 번째 state 값은 그대로 유지돼야 합니다.');
        assertEqual(appRef.hooks[1], 1, '두 번째 state 값만 1로 바뀌어야 합니다.');
        assert(
          sandbox.textContent.includes('React / 1'),
          '두 번째 state 변경 뒤 DOM이 새 값을 보여야 합니다.',
        );

        return '여러 useState 슬롯이 서로 섞이지 않고 독립적으로 유지되었습니다.';
      } finally {
        cleanupSandbox(sandbox);
      }
    },
  },
  {
    name: 'setState 호출 후 update가 다시 실행돼야 한다',
    run() {
      const sandbox = createSandbox();

      try {
        let setCount = null;

        function Counter() {
          const [count, setCountLocal] = useState(0);
          setCount = setCountLocal;

          return h('p', null, 'value: ' + count);
        }

        renderApp(Counter, sandbox);
        setCount(1);

        assert(
          sandbox.textContent.includes('value: 1'),
          'setState 뒤 DOM 텍스트가 1로 바뀌어야 합니다.',
        );

        return 'setter 호출 뒤 rerender가 일어나 새 count 값이 DOM에 반영되었습니다.';
      } finally {
        cleanupSandbox(sandbox);
      }
    },
  },
  {
    name: 'useEffect가 의존성 배열에 따라 실행 여부를 결정해야 한다',
    run() {
      const sandbox = createSandbox();

      try {
        let runs = 0;
        let setValue = null;

        function EffectExample() {
          const [value, setValueLocal] = useState('A');
          setValue = setValueLocal;

          useEffect(() => {
            runs += 1;
          }, [value]);

          return h('p', null, value);
        }

        renderApp(EffectExample, sandbox);
        setValue('A');
        setValue('B');
        setValue('B');

        assertEqual(runs, 2, '첫 렌더링 1회와 deps 변경 1회를 합쳐 총 2번만 실행돼야 합니다.');
        assert(
          sandbox.textContent.includes('B'),
          'deps가 바뀐 뒤 마지막 DOM도 새 값을 보여야 합니다.',
        );

        return 'useEffect가 같은 값에서는 재실행되지 않고, deps 변경 때만 다시 실행되었습니다.';
      } finally {
        cleanupSandbox(sandbox);
      }
    },
  },
  {
    name: 'useMemo가 같은 deps에서는 이전 계산 결과를 재사용해야 한다',
    run() {
      const sandbox = createSandbox();

      try {
        let computeCount = 0;
        const numbers = [1, 2];

        function ScoreSummary(props) {
          const total = useMemo(() => {
            computeCount += 1;
            return props.numbers.reduce((sum, value) => sum + value, 0);
          }, [props.numbers]);

          return h('p', null, props.label + ': ' + total);
        }

        const app = renderApp(ScoreSummary, sandbox, {
          numbers,
          label: 'first',
        });

        app.props = {
          numbers,
          label: 'second',
        };
        app.update();

        app.props = {
          numbers: [1, 2, 3],
          label: 'third',
        };
        app.update();

        assertEqual(
          computeCount,
          2,
          '첫 렌더링 1회와 deps 변경 1회만 계산이 일어나야 합니다.',
        );
        assert(
          sandbox.textContent.includes('third: 6'),
          '마지막 렌더링 결과가 새 합계를 보여야 합니다.',
        );

        return '같은 deps에서는 memo를 재사용하고, 새 배열이 들어왔을 때만 다시 계산했습니다.';
      } finally {
        cleanupSandbox(sandbox);
      }
    },
  },
  {
    name: '버튼 클릭이 실제 DOM 이벤트로 setState를 트리거해야 한다',
    run() {
      const sandbox = createSandbox();

      try {
        function Counter() {
          const [count, setCount] = useState(0);

          return h(
            'section',
            null,
            h('p', null, 'count: ' + count),
            h(
              'button',
              {
                onclick: () => setCount(count + 1),
              },
              '+1',
            ),
          );
        }

        renderApp(Counter, sandbox);

        const button = sandbox.querySelector('button');
        triggerClick(button);

        assert(
          sandbox.textContent.includes('count: 1'),
          '실제 버튼 클릭 뒤 count 문구가 1로 바뀌어야 합니다.',
        );

        return '실제 DOM click 이벤트가 onclick -> setState -> rerender 흐름으로 이어졌습니다.';
      } finally {
        cleanupSandbox(sandbox);
      }
    },
  },
  {
    name: '입력 이벤트가 실제 DOM을 통해 effect 재실행으로 이어져야 한다',
    run() {
      const sandbox = createSandbox();

      try {
        function WelcomeLogger() {
          const [name, setName] = useState('정글');

          useEffect(() => {
            const log = sandbox.querySelector('[data-effect-log]');

            if (log) {
              log.textContent = 'effect: ' + name;
            }
          }, [name]);

          return h(
            'section',
            null,
            h('input', {
              value: name,
              oninput: (event) => setName(event.target.value),
            }),
            h('p', { 'data-effect-log': 'true' }, 'effect: waiting'),
          );
        }

        renderApp(WelcomeLogger, sandbox);

        const input = sandbox.querySelector('input');
        triggerInput(input, '리액트');

        assert(
          sandbox.textContent.includes('effect: 리액트'),
          'input 이벤트 뒤 effect 로그가 새 이름으로 바뀌어야 합니다.',
        );

        return '실제 input 이벤트가 oninput -> setState -> useEffect 재실행 흐름으로 이어졌습니다.';
      } finally {
        cleanupSandbox(sandbox);
      }
    },
  },
];

const HOOK_SCENARIO_METADATA = new Map([
  [
    'useState가 첫 렌더마다 초기값을 유지해야 한다',
    {
      status: 'covered',
      coverage: 'runHookSmokeTests()에서 hook 저장값과 초기 DOM을 함께 assertion합니다.',
    },
  ],
  [
    '여러 useState가 각자 자기 자리 값을 따로 기억해야 한다',
    {
      status: 'covered',
      coverage: 'runHookSmokeTests()에서 여러 state 슬롯이 독립적으로 유지되는지 assertion합니다.',
    },
  ],
  [
    'setState 호출 뒤 update가 다시 실행돼야 한다',
    {
      status: 'covered',
      coverage: 'runHookSmokeTests()에서 setter 호출 뒤 rerender 결과 DOM을 assertion합니다.',
    },
  ],
  [
    'useEffect가 의존성 배열에 따라 실행 여부를 결정해야 한다',
    {
      status: 'covered',
      coverage: 'runHookSmokeTests()에서 deps 변경 횟수와 effect 재실행 횟수를 assertion합니다.',
    },
  ],
  [
    '버튼 클릭이 실제 DOM 이벤트로 setState를 트리거해야 한다',
    {
      status: 'blocked',
      coverage: 'runHookSmokeTests()에 실제 button.click() 기반 smoke test가 연결돼 있습니다.',
      blocker: '현재 framework가 onclick/oninput 같은 이벤트 props를 실제 DOM listener로 연결하지 않아 실패 가능성이 큽니다.',
      owner: 'A 역할: framework event props 연결',
    },
  ],
  [
    '입력 이벤트가 실제 DOM을 통해 effect 재실행으로 이어져야 한다',
    {
      status: 'blocked',
      coverage: 'runHookSmokeTests()에 실제 input 이벤트 dispatch 기반 smoke test가 연결돼 있습니다.',
      blocker: '현재 framework가 oninput 같은 이벤트 props를 실제 DOM listener로 연결하지 않아 실패 가능성이 큽니다.',
      owner: 'A 역할: framework event props 연결',
    },
  ],
  [
    'useMemo가 같은 deps에서는 이전 계산 결과를 재사용해야 한다',
    {
      status: 'covered',
      coverage: 'runHookSmokeTests()에서 factory 실행 횟수와 결과 재사용 여부를 assertion합니다.',
    },
  ],
  [
    'useState가 첫 렌더링에서 초기값을 저장해야 한다',
    {
      status: 'covered',
      coverage: 'runHookSmokeTests()에서 hook 저장값과 초기 DOM을 함께 assertion합니다.',
    },
  ],
  [
    'setState 호출 후 update가 다시 실행돼야 한다',
    {
      status: 'covered',
      coverage: 'runHookSmokeTests()에서 setter 호출 뒤 rerender 결과 DOM을 assertion합니다.',
    },
  ],
]);

const HOOK_SCENARIO_STATUS_BY_INDEX = [
  {
    status: 'covered',
    coverage: 'runHookSmokeTests()에서 hook 저장값과 초기 DOM을 함께 assertion합니다.',
  },
  {
    status: 'covered',
    coverage: 'runHookSmokeTests()에서 여러 state 슬롯이 독립적으로 유지되는지 assertion합니다.',
  },
  {
    status: 'covered',
    coverage: 'runHookSmokeTests()에서 setter 호출 뒤 rerender 결과 DOM을 assertion합니다.',
  },
  {
    status: 'covered',
    coverage: 'runHookSmokeTests()에서 deps 변경 횟수와 effect 재실행 횟수를 assertion합니다.',
  },
  {
    status: 'covered',
    coverage: 'runHookSmokeTests()에서 button.click() 기반 상호작용 smoke test가 브라우저에서 passed로 확인됐습니다.',
  },
  {
    status: 'covered',
    coverage: 'runHookSmokeTests()에서 input dispatch 기반 상호작용 smoke test가 브라우저에서 passed로 확인됐습니다.',
  },
  {
    status: 'covered',
    coverage: 'runHookSmokeTests()에서 factory 실행 횟수와 결과 재사용 여부를 assertion합니다.',
  },
];

function decorateHookScenario(scenario, index) {
  const decorated = {
    ...scenario,
    status: 'pending',
    ...(HOOK_SCENARIO_METADATA.get(scenario.name) ?? {}),
    ...(HOOK_SCENARIO_STATUS_BY_INDEX[index] ?? {}),
  };

  if (decorated.status !== 'blocked') {
    delete decorated.blocker;
    delete decorated.owner;
  }

  return decorated;
}

// 테스트 UI나 문서가 원본 시나리오를 그대로 보고 싶을 때 쓰는 getter다.
export function getHookTestScenarios() {
  return HOOK_TEST_SCENARIOS.map((scenario, index) => decorateHookScenario(scenario, index));
}

// 실제 브라우저에서 실행 가능한 Hook smoke test 결과를 돌려준다.
export function runHookSmokeTests() {
  return runTestCases(HOOK_SMOKE_TESTS);
}

// framework.test.html에서 바로 쓰기 쉽게 pending 상태를 붙여 돌려준다.
export function runHookStubTests() {
  return HOOK_TEST_SCENARIOS.map((scenario, index) => decorateHookScenario(scenario, index));
}
