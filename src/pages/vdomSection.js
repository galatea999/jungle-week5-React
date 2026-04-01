// ============================================================
// vdomSection.js — 섹션 4 학습 콘텐츠
// ============================================================
//
// 이 파일은 "state가 바뀌면 내부에서 어떤 일이 일어나는가?"를
// 순서대로 보여 주는 Virtual DOM 섹션을 만든다.
//
// 이 섹션의 핵심은 추상적인 설명에 머물지 않고,
// 실제 old tree / new tree / patch 목록을 함께 보게 만드는 것이다.
// ============================================================

import { h } from '../framework/createElement.js';
import { createChallengeToggle } from '../ui/contentBlocks.js';
import { createDiffVisualizer } from '../ui/diffVisualizer.js';

// 학생이 setState 이후의 흐름을 한 줄씩 따라가도록 만든 파이프라인 목록이다.
// 이 순서는 project-plan의 핵심 개념과도 맞물린다.
const PIPELINE = [
  'setState가 호출된다.',
  '컴포넌트 함수가 다시 실행된다.',
  '새 Virtual DOM 트리가 만들어진다.',
  '이전 트리와 새 트리를 diff로 비교한다.',
  'patch를 실제 DOM에 적용한다.',
];

const VDOM_INTRO =
  'Virtual DOM은 브라우저의 실제 DOM을 바로바로 건드리기 전에, 먼저 자바스크립트 객체 형태로 "다음에 그려야 할 화면"을 표현해 두는 방법입니다. 이렇게 중간 표현을 하나 두면, 이전 화면과 다음 화면을 비교해서 무엇이 달라졌는지 계산하기가 쉬워집니다. React가 빠르다고 말할 때 중요한 점은 "무조건 다시 안 그린다"가 아니라, "정말 바뀐 부분만 골라서 바꿀 수 있게 돕는다"에 더 가깝습니다.';

const VDOM_IMPORTANCE =
  '이 챕터에서는 Virtual DOM을 단순한 용어로 외우기보다, 왜 old tree와 new tree를 비교하는지가 핵심입니다. 텍스트 하나가 바뀌었을 뿐인데 전체 리스트를 통째로 다시 만들 필요는 없습니다. diff와 patch는 바로 이런 낭비를 줄이기 위해 등장하는 개념이며, 어떤 노드는 재사용하고 어떤 노드만 바꾸는지 구분하는 눈을 기르는 것이 중요합니다.';

// 첫 번째 예시는 "무엇이 바뀌고 무엇이 그대로 남는가"를 눈으로 비교하게 만들기 위한 샘플이다.
// challenge도 이 시나리오를 기준으로 진행되므로 코드 예시와 시각화가 같은 이야기를 하게 된다.
const BEFORE_TREE_EXAMPLE = `h('ul', null,
  h('li', null, 'React'),
  h('li', null, 'Hooks')
)`;

const AFTER_TREE_EXAMPLE = `h('ul', null,
  h('li', null, 'React'),
  h('li', null, 'Hooks!'),
  h('li', null, 'Virtual DOM')
)`;

// Virtual DOM 섹션은 코드 실행형 과제보다 "비교와 예측"이 중심이라
// starter와 answer도 실제 patch 객체 대신 읽기 쉬운 의사 코드 형태로 준비한다.
export const VDOM_PRACTICE = {
  starterCode: `const beforeTree = h('ul', null,
  h('li', null, 'React'),
  h('li', null, 'Hooks')
);

const afterTree = h('ul', null,
  h('li', null, 'React'),
  h('li', null, 'Hooks!'),
  h('li', null, 'Virtual DOM')
);

const expectedChanges = [
  // TODO: 바뀌는 점을 순서대로 적어 보세요.
];`,
};

// 시각화 패널에 넣을 예시 시나리오들이다.
// 텍스트/추가뿐 아니라 props 변경과 제거도 볼 수 있게 두 가지를 준비했다.
const VDOM_SCENARIOS = [
  {
    id: 'text-and-create',
    label: '텍스트 변경 + 노드 추가',
    summary:
      '두 번째 li의 글자가 바뀌고, 세 번째 li가 새로 추가됩니다. 루트 ul과 첫 번째 li는 그대로 재사용됩니다.',
    focusPoints: [
      'TEXT patch가 두 번째 li의 자식 text 노드를 가리키는지 본다.',
      'CREATE patch가 세 번째 li 위치에 생기는지 본다.',
      '변화가 없는 루트 ul과 첫 번째 li는 그대로 남는다는 점을 확인한다.',
    ],
    beforeVdom: h(
      'ul',
      null,
      h('li', null, 'React'),
      h('li', null, 'Hooks'),
    ),
    afterVdom: h(
      'ul',
      null,
      h('li', null, 'React'),
      h('li', null, 'Hooks!'),
      h('li', null, 'Virtual DOM'),
    ),
  },
  {
    id: 'props-and-remove',
    label: '속성 변경 + 노드 제거',
    summary:
      '루트 카드의 class 속성이 바뀌고, 마지막 small 설명 노드가 제거됩니다. 중간 문장도 새 상태에 맞게 바뀝니다.',
    focusPoints: [
      '루트 article에서 PROPS patch가 생기는지 본다.',
      '설명 문장이 바뀌면서 TEXT patch가 같이 나오는지 본다.',
      '마지막 small 노드가 사라질 때 REMOVE patch가 어떤 path를 가리키는지 확인한다.',
    ],
    beforeVdom: h(
      'article',
      { class: 'lesson-card before' },
      h('h3', null, 'Virtual DOM'),
      h('p', null, '이전 상태를 보고 있습니다.'),
      h('small', null, '곧 새 트리와 비교됩니다.'),
    ),
    afterVdom: h(
      'article',
      { class: 'lesson-card after' },
      h('h3', null, 'Virtual DOM'),
      h('p', null, '새 상태로 비교가 끝났습니다.'),
    ),
  },
];

const VDOM_CHALLENGE = {
  title: '어떤 patch가 필요할까?',
  goal: '이전 트리와 다음 트리를 비교해 어떤 patch가 필요한지 순서대로 예상해 보세요.',
  tasks: [
    '어떤 노드는 그대로 재사용되고, 어떤 노드만 바뀌는지 먼저 표시한다.',
    '두 번째 li에서 어떤 TEXT 변화가 생기는지 설명한다.',
    '세 번째 li가 새로 생길 때 어떤 CREATE 성격의 patch가 필요할지 예상한다.',
    '왜 루트 ul 전체를 다시 만들 필요는 없는지 한 문장으로 설명한다.',
  ],
  success: [
    '두 번째 항목의 텍스트만 바뀐다는 점을 잡아낸다.',
    '세 번째 항목이 새로 추가된다는 점을 잡아낸다.',
    '전체 트리를 통째로 교체하는 대신 필요한 부분만 업데이트한다는 개념을 설명할 수 있다.',
  ],
  hint: '루트에서부터 같은 태그끼리 차례대로 비교하고, 바뀐 텍스트와 새로 생긴 노드를 따로 생각해 보세요.',
};

const VDOM_CHALLENGES = [VDOM_CHALLENGE];

// 섹션 4 전체를 조립하는 공개 함수다.
// 코드 예시, 실제 시각화, patch 예측 과제를 한 흐름으로 이어 준다.
export function createVdomSection() {
  const section = document.createElement('section');
  section.id = 'vdom-section';
  section.className = 'panel-card learning-section';

  section.appendChild(
    createHeader(
      '4. Virtual DOM이 하는 일',
      '같은 화면이라도 무엇이 재사용되고 무엇이 바뀌는지, old tree와 new tree를 비교하며 배우는 시각화 섹션입니다.',
    ),
  );

  section.appendChild(
    createParagraphCard(
      '먼저 이해하기',
      VDOM_INTRO,
    ),
  );
  section.appendChild(createParagraphCard('왜 이 과정을 배우는가', VDOM_IMPORTANCE));
  section.appendChild(createPipelineCard());
  section.appendChild(createCodeCard('챌린지 예시: 이전 트리', BEFORE_TREE_EXAMPLE));
  section.appendChild(createCodeCard('챌린지 예시: 다음 트리', AFTER_TREE_EXAMPLE));
  section.appendChild(createVisualizerCard());
  section.appendChild(createCodeCard('직접 해보기 starter code', VDOM_PRACTICE.starterCode));
  for (const [index, challenge] of VDOM_CHALLENGES.entries()) {
    section.appendChild(createChallengeToggle({
      number: index + 1,
      ...challenge,
    }));
  }

  return section;
}

// 섹션 제목 블록 helper다.
function createHeader(title, description) {
  const wrapper = document.createElement('div');
  const heading = document.createElement('h2');
  const paragraph = document.createElement('p');

  heading.textContent = title;
  paragraph.textContent = description;
  wrapper.append(heading, paragraph);

  return wrapper;
}

// 긴 설명 문장을 담는 기본 텍스트 카드 helper다.
function createParagraphCard(title, text) {
  const article = createCardShell(title);
  const paragraph = document.createElement('p');

  paragraph.textContent = text;
  article.appendChild(paragraph);

  return article;
}

// Virtual DOM 흐름을 ordered list로 보여주는 카드다.
// 학생이 "어느 단계가 먼저인지"를 분명히 보게 하려는 의도다.
function createPipelineCard() {
  const article = createCardShell('렌더링 파이프라인');
  const list = document.createElement('ol');

  for (const step of PIPELINE) {
    const li = document.createElement('li');
    li.textContent = step;
    list.appendChild(li);
  }

  article.appendChild(list);
  return article;
}

// 이전/다음 트리 예시처럼 읽는 코드 조각을 보여 주는 helper다.
function createCodeCard(title, code) {
  const article = createCardShell(title);
  const pre = document.createElement('pre');
  const codeEl = document.createElement('code');

  codeEl.textContent = code;
  pre.appendChild(codeEl);
  article.appendChild(pre);

  return article;
}

// 실제 diffVisualizer를 섹션 안에 붙이는 카드다.
// 예시 시나리오 버튼을 눌러 old/new tree와 patch 목록을 바꿔 볼 수 있다.
function createVisualizerCard() {
  const article = createCardShell('실시간 diff 시각화');
  const intro = document.createElement('p');
  const buttonRow = document.createElement('div');
  const scenarioHeading = document.createElement('h4');
  const scenarioSummary = document.createElement('p');
  const focusHeading = document.createElement('h4');
  const focusList = document.createElement('ul');
  const visualizer = createDiffVisualizer();
  const buttons = [];

  intro.textContent =
    '아래 예시를 바꾸면 이전 트리, 새 트리, patch 목록이 함께 갱신됩니다. 학생은 어떤 path에 어떤 patch가 생기는지 눈으로 따라가면 됩니다.';
  buttonRow.className = 'challenge-actions';
  scenarioHeading.textContent = '현재 예시';
  focusHeading.textContent = '이 시각화에서 볼 포인트';

  function applyScenario(scenario) {
    scenarioSummary.textContent = scenario.summary;
    focusList.replaceChildren(
      ...scenario.focusPoints.map((point) => {
        const li = document.createElement('li');
        li.textContent = point;
        return li;
      }),
    );

    for (const buttonInfo of buttons) {
      const isActive = buttonInfo.id === scenario.id;
      buttonInfo.button.disabled = isActive;
      buttonInfo.button.setAttribute('aria-pressed', String(isActive));
    }

    visualizer.showDiff(scenario.beforeVdom, scenario.afterVdom);
  }

  for (const scenario of VDOM_SCENARIOS) {
    const button = document.createElement('button');

    button.type = 'button';
    button.textContent = scenario.label;
    button.addEventListener('click', () => applyScenario(scenario));

    buttons.push({ id: scenario.id, button });
    buttonRow.appendChild(button);
  }

  applyScenario(VDOM_SCENARIOS[0]);

  article.append(intro, buttonRow, scenarioHeading, scenarioSummary, focusHeading, focusList, visualizer.element);
  return article;
}

// 카드 공통 껍데기 helper다.
function createCardShell(title) {
  const article = document.createElement('article');
  const heading = document.createElement('h3');

  article.className = 'panel-card learning-subsection';
  heading.textContent = title;
  article.appendChild(heading);

  return article;
}
