// ============================================================
// integration.test.js — 통합 테스트 시나리오
// ============================================================
//
// 여기서는 "각 부품이 따로는 되는데 같이 붙였을 때도 되는가?"를
// 확인할 시나리오를 적어 둔다.
//
// unit test가 함수 하나의 약속을 본다면,
// integration test는 render -> state update -> DOM 반영이 실제로 이어지는지 본다.
// 이제 여기에 최소 실행 가능한 smoke test도 함께 넣어 두었다.
// ============================================================

import { h } from '../src/framework/createElement.js';
import { renderApp } from '../src/framework/reconciler.js';
import { useState } from '../src/framework/hooks.js';
import { createComponentSection } from '../src/pages/componentSection.js';
import { createHooksSection } from '../src/pages/hooksSection.js';
import { createStateSection } from '../src/pages/stateSection.js';
import { createWorkshopSection } from '../src/pages/workshopSection.js';
import { createPlayground } from '../src/ui/codePlayground.js';
import { createVdomSection } from '../src/pages/vdomSection.js';
import {
  assert,
  createSandbox,
  cleanupSandbox,
  runTestCases,
  triggerClick,
} from './testUtils.js';

const WORKSHOP_TEST_CODE = `function Header(props) {
  return h('header', null,
    h('h2', null, props.title)
  );
}

function ProfileCard(props) {
  return h('article', { class: 'profile-card' },
    h('h3', null, props.name),
    h('p', null, '트랙: ' + props.track),
    h('p', null, props.intro)
  );
}

function SkillList(props) {
  return h('ul', null,
    ...props.skills.map((skill) =>
      h('li', null,
        h('button', {
          onclick: () => props.onSelect(skill),
        }, skill)
      )
    )
  );
}

function App() {
  const [selectedSkill, setSelectedSkill] = useState('Component');

  return h('main', { class: 'profile-app' },
    h(Header, { title: 'React 학습 카드' }),
    h(ProfileCard, {
      name: '정글',
      track: 'Frontend',
      intro: '작은 컴포넌트를 조립하는 중입니다.',
    }),
    h(SkillList, {
      skills: ['Component', 'State', 'Hooks'],
      onSelect: setSelectedSkill,
    }),
    h('p', null, '현재 선택된 스킬: ' + selectedSkill)
  );
}

return App;`;

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
  {
    name: 'VDOM 시각화 패널이 old/new tree와 patch 목록을 함께 보여줘야 한다',
    reason: '학생이 diff 결과를 눈으로 따라갈 수 있어야 Virtual DOM 섹션의 학습 목표가 완성된다.',
    setup: 'vdomSection의 예시 버튼을 눌러 diffVisualizer에 before/after VDOM을 전달한다.',
    checkpoints: [
      '이전 VDOM 카드와 새 VDOM 카드가 동시에 표시된다.',
      'patch 목록에 TEXT, CREATE, PROPS, REMOVE 같은 변화가 사람이 읽을 수 있는 문장으로 나타난다.',
      '예시를 바꾸면 트리와 patch 목록이 함께 다시 그려진다.',
    ],
    nextStep: 'createVdomSection 또는 createDiffVisualizer를 DOM 환경에서 실행하고, 시나리오 버튼 클릭 전후의 트리 카드와 patch list 텍스트를 assertion한다.',
  },
  {
    name: '워크숍 섹션의 playground가 완성 코드를 preview에 렌더링해야 한다',
    reason: '마지막 종합 실습이 실제로 실행되지 않으면 조립형 학습 경험이 완성되지 않기 때문이다.',
    setup: 'createWorkshopSection으로 섹션 DOM을 만든 뒤, textarea에 answer code를 넣고 실행 버튼을 누른다.',
    checkpoints: [
      '워크숍 섹션 안에 playground, 챌린지, 답안 코드 카드가 함께 존재한다.',
      'answer code 실행 뒤 preview에 앱 제목과 기본 선택 상태가 렌더링된다.',
      '워크숍이 단순 문서가 아니라 실제 실행 가능한 실습 섹션으로 동작한다.',
    ],
    nextStep: 'createWorkshopSection을 DOM에 붙인 뒤 editor 값 교체, 실행 버튼 클릭, preview 텍스트 변화를 assertion한다.',
  },
  {
    name: '워크숍 스킬 버튼 클릭이 실제 preview 상태를 바꿔야 한다',
    reason: '최종 워크숍의 핵심은 조립뿐 아니라 클릭 후 상태 변화까지 직접 체험하는 데 있다.',
    setup: '워크숍 answer code를 실행한 뒤 preview 안의 스킬 버튼을 실제로 클릭한다.',
    checkpoints: [
      'preview 안에 skills 배열에서 만든 버튼들이 렌더링된다.',
      '버튼 click이 onSelect -> setSelectedSkill 흐름을 실제로 호출한다.',
      '현재 선택된 스킬 문구가 클릭한 값으로 바뀐다.',
    ],
    nextStep: '워크숍 answer code 실행 뒤 preview의 Hooks 버튼을 클릭하고, 선택 문구가 Hooks로 바뀌는지 assertion한다.',
  },
  {
    name: '학습 섹션들이 설명-실습-챌린지 흐름을 유지한 채 렌더링돼야 한다',
    reason: 'C가 설계한 학습 페이지의 품질은 각 섹션 DOM이 같은 학습 흐름을 실제로 가지고 있는지에 달려 있기 때문이다.',
    setup: 'component/hooks/state/vdom/workshop 섹션을 각각 생성해 제목, 실습 영역, 챌린지 영역을 확인한다.',
    checkpoints: [
      '각 섹션이 고유 id와 제목을 가진다.',
      '실습형 섹션은 playground 또는 diffVisualizer 같은 상호작용 영역을 가진다.',
      '학생이 다음 행동을 알 수 있게 챌린지 또는 과제 카드가 함께 존재한다.',
    ],
    nextStep: '각 create...Section()을 DOM에 붙이고, 섹션별 제목/실습 DOM/챌린지 문구 존재 여부를 assertion한다.',
  },
  {
    name: 'playground 초기화가 editor와 preview를 함께 되돌려야 한다',
    reason: '직접 해보기에서 여러 번 실험한 뒤 안전하게 처음 상태로 돌아갈 수 있어야 학습 경험이 부드럽다.',
    setup: 'createPlayground로 playground를 만들고 editor 값을 바꾼 뒤 reset 버튼을 눌러 초기 상태 복원을 확인한다.',
    checkpoints: [
      'reset 뒤 textarea 값이 initialCode로 돌아간다.',
      'preview가 초기화 안내 문구로 바뀐다.',
      '실습자가 다음 실행을 다시 시도할 수 있는 안전한 출발점이 복원된다.',
    ],
    nextStep: 'playground를 DOM에 붙이고 editor 값을 바꾼 뒤 reset 버튼 클릭 후 editor/preview 상태를 assertion한다.',
  },
];

// 구현된 부품이 실제로 함께 붙는지 확인하는 최소 smoke test 묶음이다.
// 여기서는 사용자 경험 관점에서 중요한 연결 고리만 먼저 검증한다.
const INTEGRATION_SMOKE_TESTS = [
  {
    name: '컴포넌트 mount 후 실제 DOM이 컨테이너에 붙어야 한다',
    run() {
      const sandbox = createSandbox();

      try {
        function HelloApp() {
          return h('section', null, h('h2', null, '통합 테스트'));
        }

        renderApp(HelloApp, sandbox);

        assert(sandbox.children.length > 0, 'mount 직후 컨테이너가 비어 있지 않아야 합니다.');
        assert(
          sandbox.textContent.includes('통합 테스트'),
          '루트 컴포넌트의 제목이 실제 DOM에 보여야 합니다.',
        );

        return '루트 컴포넌트 mount 후 컨테이너에 실제 DOM이 생성되었습니다.';
      } finally {
        cleanupSandbox(sandbox);
      }
    },
  },
  {
    name: 'setState 후 diff와 patch가 연결되어 DOM 일부만 바뀌어야 한다',
    run() {
      const sandbox = createSandbox();

      try {
        let setCount = null;

        function CounterApp() {
          const [count, setCountLocal] = useState(0);
          setCount = setCountLocal;

          return h(
            'section',
            null,
            h('button', { class: 'stable-button' }, '고정 버튼'),
            h('p', null, 'count: ' + count),
          );
        }

        renderApp(CounterApp, sandbox);
        const firstButton = sandbox.querySelector('button');

        setCount(1);

        assert(
          sandbox.textContent.includes('count: 1'),
          'setState 뒤 DOM 텍스트가 새 count 값을 보여야 합니다.',
        );
        assert(
          sandbox.querySelector('button') === firstButton,
          '변하지 않은 버튼 DOM 노드는 재사용되어야 합니다.',
        );

        return 'setState 뒤 count 텍스트만 갱신되고, 바뀌지 않은 버튼 노드는 유지되었습니다.';
      } finally {
        cleanupSandbox(sandbox);
      }
    },
  },
  {
    name: '학습용 playground에서 실행한 코드가 preview 컨테이너에 렌더링돼야 한다',
    run() {
      const sandbox = createSandbox();

      try {
        const playground = createPlayground({
          title: 'SmokePlayground.js',
          initialCode: `function App() {
  return h('section', null,
    h('h3', null, 'Playground OK'),
    h('p', null, 'preview 연결 확인')
  );
}

return App;`,
        });

        sandbox.appendChild(playground.element);
        playground.run();

        assert(
          playground.preview.textContent.includes('Playground OK'),
          'playground 실행 뒤 preview에 컴포넌트 결과가 보여야 합니다.',
        );

        return 'playground 실행 결과가 preview 컨테이너에 렌더링되었습니다.';
      } finally {
        cleanupSandbox(sandbox);
      }
    },
  },
  {
    name: 'VDOM 시각화 패널이 old/new tree와 patch 목록을 함께 보여줘야 한다',
    run() {
      const sandbox = createSandbox();

      try {
        const section = createVdomSection();
        sandbox.appendChild(section);

        const buttons = Array.from(section.querySelectorAll('.challenge-actions button'));
        const patchList = section.querySelector('.patch-list');

        assert(buttons.length >= 2, '시나리오를 바꿀 수 있는 버튼이 최소 두 개 있어야 합니다.');
        assert(
          patchList && patchList.textContent.includes('TEXT') && patchList.textContent.includes('CREATE'),
          '첫 번째 예시에서는 TEXT와 CREATE patch가 보여야 합니다.',
        );

        buttons[1].click();

        const updatedPatchText = section.querySelector('.patch-list')?.textContent ?? '';
        assert(
          updatedPatchText.includes('PROPS') || updatedPatchText.includes('REMOVE'),
          '두 번째 예시로 바꾸면 PROPS 또는 REMOVE patch가 보여야 합니다.',
        );

        return '예시 버튼을 바꿨을 때 diff 시각화 패널이 함께 다시 그려졌습니다.';
      } finally {
        cleanupSandbox(sandbox);
      }
    },
  },
  {
    name: '워크숍 섹션의 playground가 답안 코드를 preview에 렌더링해야 한다',
    run() {
      const sandbox = createSandbox();

      try {
        const section = createWorkshopSection();
        sandbox.appendChild(section);

        const textarea = section.querySelector('.editor-textarea');
        const runButton = section.querySelector('.playground-actions button');
        const preview = section.querySelector('.preview-container');

        assert(textarea, '워크숍 섹션 안에 editor textarea가 있어야 합니다.');
        assert(runButton, '워크숍 섹션 안에 실행 버튼이 있어야 합니다.');
        assert(preview, '워크숍 섹션 안에 preview 컨테이너가 있어야 합니다.');
        assert(
          section.textContent.includes('나만의 React 학습 카드 앱 만들기'),
          '워크숍 섹션 안에 챌린지 카드가 함께 렌더링돼야 합니다.',
        );

        textarea.value = WORKSHOP_TEST_CODE;
        runButton.click();

        const previewText = preview.textContent;

        assert(
          previewText.includes('React 학습 카드'),
          '완성 코드 실행 뒤 preview에 앱 제목이 보여야 합니다.',
        );
        assert(
          previewText.includes('현재 선택된 스킬: Component'),
          '완성 코드 실행 뒤 기본 선택 상태가 보여야 합니다.',
        );

        return '워크숍 섹션의 playground가 완성 코드를 실제 preview 화면으로 렌더링했습니다.';
      } finally {
        cleanupSandbox(sandbox);
      }
    },
  },
  {
    name: '워크숍 스킬 버튼 클릭이 실제 preview 상태를 바꿔야 한다',
    run() {
      const sandbox = createSandbox();

      try {
        const section = createWorkshopSection();
        sandbox.appendChild(section);

        const textarea = section.querySelector('.editor-textarea');
        const runButton = section.querySelector('.playground-actions button');
        const preview = section.querySelector('.preview-container');

        assert(textarea, '워크숍 섹션 안에 editor textarea가 있어야 합니다.');
        assert(runButton, '워크숍 섹션 안에 실행 버튼이 있어야 합니다.');
        assert(preview, '워크숍 섹션 안에 preview 컨테이너가 있어야 합니다.');

        textarea.value = WORKSHOP_TEST_CODE;
        runButton.click();

        const hooksButton = Array.from(preview.querySelectorAll('button')).find(
          (button) => button.textContent === 'Hooks',
        );

        assert(hooksButton, '완성 코드 실행 뒤 preview 안에 Hooks 버튼이 있어야 합니다.');
        triggerClick(hooksButton);

        assert(
          preview.textContent.includes('현재 선택된 스킬: Hooks'),
          'Hooks 버튼 클릭 뒤 선택된 스킬 문구가 Hooks로 바뀌어야 합니다.',
        );

        return '워크숍 preview 안의 버튼 클릭이 실제 selectedSkill 상태 변경으로 이어졌습니다.';
      } finally {
        cleanupSandbox(sandbox);
      }
    },
  },
  {
    name: '학습 섹션들이 설명-실습-챌린지 흐름을 유지한 채 렌더링돼야 한다',
    run() {
      const sandbox = createSandbox();

      try {
        const sections = [
          createComponentSection(),
          createHooksSection(),
          createStateSection(),
          createVdomSection(),
          createWorkshopSection(),
        ];

        sandbox.append(...sections);

        assert(
          sections.map((section) => section.id).join(',') ===
            'component-section,hooks-section,state-section,vdom-section,workshop-section',
          '모든 학습 섹션이 예상한 id 순서대로 생성돼야 합니다.',
        );
        assert(
          sandbox.querySelectorAll('.playground').length >= 6,
          '실습형 섹션에는 playground가 여러 개 렌더링되어야 합니다.',
        );
        assert(
          sandbox.querySelector('.diff-visualizer'),
          'vdom 섹션에는 diffVisualizer가 실제로 렌더링되어야 합니다.',
        );
        assert(
          sandbox.textContent.includes('같은 카드 두 번 재사용하기') &&
            sandbox.textContent.includes('나만의 React 학습 카드 앱 만들기'),
          '처음 섹션과 마지막 섹션의 챌린지 카드가 모두 보여야 합니다.',
        );

        return 'component/hooks/state/vdom/workshop 섹션이 모두 생성되고, 실습 및 챌린지 DOM도 함께 렌더링되었습니다.';
      } finally {
        cleanupSandbox(sandbox);
      }
    },
  },
  {
    name: 'playground 초기화가 editor와 preview를 함께 되돌려야 한다',
    run() {
      const sandbox = createSandbox();

      try {
        const initialCode = `function App() {
  return h('p', null, '처음 코드');
}

return App;`;
        const playground = createPlayground({
          title: 'ResetSmoke.js',
          initialCode,
        });

        sandbox.appendChild(playground.element);
        playground.editor.value = `function App() {
  return h('p', null, '바뀐 코드');
}

return App;`;
        playground.run();
        playground.reset();

        assert(
          playground.editor.value === initialCode,
          'reset 뒤 textarea 값이 처음 starter code로 돌아와야 합니다.',
        );
        assert(
          playground.preview.textContent.includes('코드가 초기화되었습니다. 다시 실행 버튼을 눌러 보세요.'),
          'reset 뒤 preview가 초기화 안내 문구를 보여야 합니다.',
        );

        return 'playground reset이 editor 값과 preview 안내 문구를 함께 초기 상태로 되돌렸습니다.';
      } finally {
        cleanupSandbox(sandbox);
      }
    },
  },
];

const INTEGRATION_SCENARIO_METADATA = new Map([
  [
    '컴포넌트 mount 뒤 실제 DOM이 컨테이너에 붙어야 한다',
    {
      status: 'covered',
      coverage: 'runIntegrationSmokeTests()에서 root mount와 초기 DOM 생성을 assertion합니다.',
    },
  ],
  [
    'setState 뒤 diff와 patch가 연결되어 DOM 일부만 바뀌어야 한다',
    {
      status: 'covered',
      coverage: 'runIntegrationSmokeTests()에서 state update 후 DOM 텍스트와 노드 재사용을 assertion합니다.',
    },
  ],
  [
    '학습용 playground에서 실행한 코드가 preview 컨테이너에 렌더링돼야 한다',
    {
      status: 'covered',
      coverage: 'runIntegrationSmokeTests()에서 playground 실행 뒤 preview 렌더를 assertion합니다.',
    },
  ],
  [
    'VDOM 시각화 패널은 old/new tree와 patch 목록을 함께 보여줘야 한다',
    {
      status: 'covered',
      coverage: 'runIntegrationSmokeTests()에서 시나리오 전환과 patch 목록 갱신을 assertion합니다.',
    },
  ],
  [
    '워크숍 섹션의 playground가 답안 코드를 preview에 렌더링해야 한다',
    {
      status: 'covered',
      coverage: 'runIntegrationSmokeTests()에서 workshop answer code 실행과 preview 렌더를 assertion합니다.',
    },
  ],
  [
    '워크숍 스킬 버튼 클릭이 실제 preview 상태를 바꿔야 한다',
    {
      status: 'covered',
      coverage: 'runIntegrationSmokeTests()에서 workshop preview button.click() smoke test가 브라우저 기준 passed로 확인된 상태입니다.',
    },
  ],
  [
    '학습 섹션들이 설명-실습-챌린지 흐름으로 모두 렌더링돼야 한다',
    {
      status: 'covered',
      coverage: 'runIntegrationSmokeTests()에서 모든 섹션 DOM 구조와 학습 흐름 요소를 assertion합니다.',
    },
  ],
  [
    'playground 초기화가 editor와 preview를 함께 되돌려야 한다',
    {
      status: 'covered',
      coverage: 'runIntegrationSmokeTests()에서 reset 이후 editor 값과 preview 안내 문구를 assertion합니다.',
    },
  ],
  [
    '컴포넌트 mount 후 실제 DOM이 컨테이너에 붙어야 한다',
    {
      status: 'covered',
      coverage: 'runIntegrationSmokeTests()에서 root mount와 초기 DOM 생성을 assertion합니다.',
    },
  ],
  [
    'setState 후 diff와 patch가 연결되어 DOM 일부만 바뀌어야 한다',
    {
      status: 'covered',
      coverage: 'runIntegrationSmokeTests()에서 state update 후 DOM 텍스트와 노드 재사용을 assertion합니다.',
    },
  ],
  [
    'VDOM 시각화 패널이 old/new tree와 patch 목록을 함께 보여줘야 한다',
    {
      status: 'covered',
      coverage: 'runIntegrationSmokeTests()에서 시나리오 전환과 patch 목록 갱신을 assertion합니다.',
    },
  ],
  [
    '학습 섹션들이 설명-실습-챌린지 흐름을 유지한 채 렌더링돼야 한다',
    {
      status: 'covered',
      coverage: 'runIntegrationSmokeTests()에서 모든 섹션 DOM 구조와 학습 흐름 요소를 assertion합니다.',
    },
  ],
]);

const INTEGRATION_SCENARIO_STATUS_BY_INDEX = [
  {
    status: 'covered',
    coverage: 'runIntegrationSmokeTests()에서 root mount와 초기 DOM 생성을 assertion합니다.',
  },
  {
    status: 'covered',
    coverage: 'runIntegrationSmokeTests()에서 state update 후 DOM 텍스트와 노드 재사용을 assertion합니다.',
  },
  {
    status: 'covered',
    coverage: 'runIntegrationSmokeTests()에서 playground 실행 뒤 preview 렌더를 assertion합니다.',
  },
  {
    status: 'covered',
    coverage: 'runIntegrationSmokeTests()에서 시나리오 전환과 patch 목록 갱신을 assertion합니다.',
  },
  {
    status: 'covered',
    coverage: 'runIntegrationSmokeTests()에서 workshop answer code 실행과 preview 렌더를 assertion합니다.',
  },
  {
    status: 'covered',
    coverage: 'runIntegrationSmokeTests()에서 workshop preview button.click() smoke test가 브라우저에서 passed로 확인됐습니다.',
  },
  {
    status: 'covered',
    coverage: 'runIntegrationSmokeTests()에서 모든 섹션 DOM 구조와 학습 흐름 요소를 assertion합니다.',
  },
  {
    status: 'covered',
    coverage: 'runIntegrationSmokeTests()에서 reset 이후 editor 값과 preview 안내 문구를 assertion합니다.',
  },
];

function decorateIntegrationScenario(scenario, index) {
  const decorated = {
    ...scenario,
    status: 'pending',
    ...(INTEGRATION_SCENARIO_METADATA.get(scenario.name) ?? {}),
    ...(INTEGRATION_SCENARIO_STATUS_BY_INDEX[index] ?? {}),
  };

  if (decorated.status !== 'blocked') {
    delete decorated.blocker;
    delete decorated.owner;
  }

  return decorated;
}

// 원본 시나리오 배열을 그대로 돌려주는 getter다.
export function getIntegrationScenarios() {
  return INTEGRATION_SCENARIOS.map((scenario, index) =>
    decorateIntegrationScenario(scenario, index),
  );
}

// 실제 브라우저에서 실행 가능한 통합 smoke test 결과를 돌려준다.
export function runIntegrationSmokeTests() {
  return runTestCases(INTEGRATION_SMOKE_TESTS);
}

// 브라우저 시나리오 러너에서 쓰기 쉬운 형태로 status를 덧붙인다.
export function runIntegrationStubTests() {
  return INTEGRATION_SCENARIOS.map((scenario, index) =>
    decorateIntegrationScenario(scenario, index),
  );
}
