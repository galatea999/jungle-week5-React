// ============================================================
// app.js — 학습 페이지를 실제로 시작시키는 파일
// ============================================================
//
// 이번 버전의 목표는 "한 번에 모든 섹션을 길게 보여 주는 페이지"가 아니라
// "왼쪽 메뉴를 누르면 챕터가 바뀌는 학습 화면"을 만드는 것이다.
//
// 그래서 이 파일은 이제 스크롤 감시보다
// "현재 어떤 챕터를 보고 있는가"를 관리하는 역할이 더 중요하다.
// ============================================================

// 페이지 바깥 구조와 네비게이션 도우미를 가져온다.
import {
  createLayout,
  renderSectionNavigation,
  setActiveSectionLink,
  setProgressText,
} from './ui/layout.js';
import { createPlayground } from './ui/codePlayground.js';

// 실제로 보여 줄 학습 챕터 섹션들을 가져온다.
import {
  COMPONENT_PRACTICE,
  createComponentSection,
} from './pages/componentSection.js';
import { HOOK_PRACTICES, createHooksSection } from './pages/hooksSection.js';
import { STATE_PRACTICE, createStateSection } from './pages/stateSection.js';
import { createVdomSection } from './pages/vdomSection.js';
import {
  WORKSHOP_PRACTICE,
  createWorkshopSection,
} from './pages/workshopSection.js';

// Virtual DOM 섹션은 원본 starter code가 "읽고 예상하기" 중심이라
// rail 프리뷰에서는 바로 실행 가능한 형태로 한 번 더 감싼 버전을 사용한다.
// 이렇게 하면 오른쪽 rail에서도 "코드 + 결과"를 동시에 확인할 수 있다.
const VDOM_RAIL_PRACTICE = {
  fileName: 'VdomPractice.js',
  description:
    'beforeTree와 afterTree를 비교하며 어떤 변화가 생기는지 적어 보고, 아래 프리뷰에서 afterTree 결과도 함께 확인해 보세요.',
  showVdom: true,
  initialCode: `const beforeTree = h('ul', null,
  h('li', null, 'React'),
  h('li', null, 'Hooks')
);

const afterTree = h('ul', null,
  h('li', null, 'React'),
  h('li', null, 'Hooks!'),
  h('li', null, 'Virtual DOM')
);

const expectedChanges = [
  'TODO: 두 번째 li 텍스트가 바뀝니다.',
  'TODO: 세 번째 li가 새로 추가됩니다.',
];

return h('section', null,
  h('p', null, '예상한 변경점'),
  h('ul', null,
    ...expectedChanges.map((change) => h('li', null, change))
  ),
  h('p', null, 'afterTree 렌더링 결과'),
  afterTree
);`,
};

// state 섹션 오른쪽 rail은 "도전 문제 starter"보다
// 먼저 읽은 온도 변환기 예제 흐름을 기본으로 보여 주는 편이 자연스럽다.
// 다만 rail 프리뷰도 바로 동작해야 하므로,
// 예제에 필요한 하위 컴포넌트 정의까지 함께 넣은 실행 가능한 버전으로 준비한다.
const STATE_RAIL_EXAMPLE_CODE = `function TemperatureInput(props) {
  return h('label', null,
    props.label,
    h('input', {
      value: props.value,
      oninput: (event) => props.onChange(event.target.value),
    })
  );
}

function ResultCard(props) {
  return h('p', null, '현재 온도: ' + props.value);
}

function App() {
  const [temperature, setTemperature] = useState('');

  return h('section', null,
    h(TemperatureInput, {
      label: '섭씨',
      value: temperature,
      onChange: setTemperature,
    }),
    h(ResultCard, { value: temperature })
  );
}

return App;`;

// 오른쪽 practice rail이 대신 보여 주는 코드 카드는
// stage 안에서 중복으로 남길 필요가 없다.
const REDUNDANT_STAGE_CODE_TITLES = new Set([
  '예제 코드 스텁',
  '온도 변환기 예제 스텁',
  '직접 해보기 starter code',
]);

const COMMON_SUBSECTION_EMOJIS = {
  '이번 섹션에서 배울 것': '🧭',
  설명: '💡',
  '왜 Component와 Props가 중요한가': '🧱',
  '왜 Hook이 필요한가': '🪝',
  'Hook을 쓸 때 기억할 규칙': '📌',
  '먼저 이해하기': '👀',
  '실습 팁': '🛠️',
  '핵심 개념': '🔑',
  '왜 부모가 state를 가져야 할까': '🏡',
  '실행 순서': '🪜',
  '렌더링 파이프라인': '⚙️',
  '왜 이 과정을 배우는가': '🧠',
  '실시간 diff 시각화': '🔍',
  '조립할 부품': '🧩',
  '워크숍 목표': '🎯',
  '어떤 순서로 만들면 좋은가': '🗺️',
  '완성 목표 예시': '🧱',
  '한 가지 가능한 답안': '✅',
};

const SECTION_SPECIFIC_SUBSECTION_EMOJIS = {
  'component-section': {
    '챌린지: 같은 카드 두 번 재사용하기': '🪪',
  },
  'hooks-section': {
    useState: '🎛️',
    useEffect: '⏱️',
    useMemo: '🧠',
  },
  'state-section': {
    '챌린지: 형제 카드가 같은 값 보기': '🌡️',
  },
  'vdom-section': {
    '챌린지 예시: 이전 트리': '🌲',
    '챌린지 예시: 다음 트리': '🌿',
    '챌린지: 어떤 patch가 필요할까?': '🧪',
  },
  'workshop-section': {
    '최종 챌린지: 나만의 React 학습 카드 앱 만들기': '🚀',
  },
};

// ------------------------------------------------------------
// SECTION_FACTORIES
// ------------------------------------------------------------
// 각 챕터의 id, 제목, 설명, 생성 함수를 한곳에 모아 둔다.
// 이렇게 해 두면 "현재 챕터 목록이 무엇인지"를 한눈에 알 수 있다.
// ------------------------------------------------------------
const SECTION_FACTORIES = [
  {
    // URL hash나 메뉴 선택에 쓸 고유 id다.
    id: 'component-section',
    // 왼쪽 메뉴와 상단 메타 정보에 보일 제목이다.
    title: '1. Component와 Props',
    // 짧은 한 줄 설명이다.
    summary: 'UI를 조각내는 방법과 부모에서 자식으로 데이터를 보내는 방법을 배웁니다.',
    // 실제 DOM 섹션을 만들어 주는 함수다.
    create: createComponentSection,
    // 오른쪽 rail에서 보여 줄 대표 실습이다.
    practice: {
      title: '직접 해보기',
      items: [
        {
          label: 'Components',
          fileName: 'ComponentPractice.js',
          description:
            '같은 ProfileCard를 한 번 더 재사용해 보고, props만 바꿨을 때 카드가 어떻게 달라지는지 확인해 보세요.',
          initialCode: COMPONENT_PRACTICE.starterCode,
        },
      ],
    },
  },
  {
    id: 'hooks-section',
    title: '2. Hooks 배우기',
    summary: 'useState, useEffect, useMemo가 어떤 문제를 해결하는지 살펴봅니다.',
    create: createHooksSection,
    practice: {
      title: 'Hook 실습',
      items: HOOK_PRACTICES.map((lesson) => ({
        label: lesson.name,
        fileName: lesson.fileName,
        description: lesson.playgroundDescription,
        initialCode: lesson.starterCode,
      })),
    },
  },
  {
    id: 'state-section',
    title: '3. State 위치 올리기',
    summary: '여러 컴포넌트가 같은 값을 공유할 때 state를 어디에 두면 좋은지 배웁니다.',
    create: createStateSection,
    practice: {
      title: '직접 해보기',
      items: [
        {
          label: 'Lifting State',
          fileName: 'LiftingStatePractice.js',
          description:
            '온도 변환기 예제를 기본으로 넣었습니다. 부모 App이 state를 가지고, 자식은 props를 받는 흐름을 먼저 확인해 보세요.',
          initialCode: STATE_RAIL_EXAMPLE_CODE,
        },
      ],
    },
  },
  {
    id: 'vdom-section',
    title: '4. Virtual DOM이 하는 일',
    summary: '렌더링, diff, patch가 어떤 순서로 이어지는지 눈으로 확인합니다.',
    create: createVdomSection,
    practice: {
      title: 'VDOM 실습',
      items: [
        {
          label: 'VDOM',
          fileName: VDOM_RAIL_PRACTICE.fileName,
          description: VDOM_RAIL_PRACTICE.description,
          initialCode: VDOM_RAIL_PRACTICE.initialCode,
          showVdom: VDOM_RAIL_PRACTICE.showVdom,
        },
      ],
    },
  },
  {
    id: 'workshop-section',
    title: '5. 컴포넌트 조립 워크숍',
    summary: '앞에서 배운 조각들을 조립해 하나의 작은 앱을 완성합니다.',
    create: createWorkshopSection,
    practice: {
      title: '워크숍 실습',
      items: [
        {
          label: 'Workshop',
          fileName: 'WorkshopPractice.js',
          description:
            '먼저 정적인 카드 앱을 만든 뒤, 마지막에 selectedSkill state와 클릭 이벤트를 붙여 보세요.',
          initialCode: WORKSHOP_PRACTICE.starterCode,
        },
      ],
    },
  },
];

// ------------------------------------------------------------
// buildSections()
// ------------------------------------------------------------
// 챕터 설계도를 실제 DOM 섹션이 들어 있는 배열로 바꾼다.
// ------------------------------------------------------------
function buildSections() {
  // map은 배열의 각 항목을 같은 규칙으로 새 객체로 바꿀 때 편하다.
  return SECTION_FACTORIES.map((sectionInfo, index) => ({
    // 원래 id, title, summary, create 정보도 그대로 살려 둔다.
    ...sectionInfo,
    // 사람이 보기 쉬운 0부터가 아닌 순번도 함께 적어 둔다.
    order: index + 1,
    // create()를 호출해 실제 DOM 섹션을 미리 만들어 둔다.
    element: normalizeSectionElement(sectionInfo.create()),
  }));
}

// ------------------------------------------------------------
// normalizeSectionElement(sectionElement)
// ------------------------------------------------------------
// stage 상단 chapter shell이 이미 제목과 설명을 보여 주므로,
// 각 섹션 맨 앞의 "제목 + 설명" intro 블록은 중복된다.
// C가 만든 원본 섹션 구조는 유지하되, 화면에 꽂기 전에
// 첫 intro 블록만 한 번 정리해 준다.
// ------------------------------------------------------------
function normalizeSectionElement(sectionElement) {
  if (!(sectionElement instanceof HTMLElement)) {
    return sectionElement;
  }

  const firstChild = sectionElement.firstElementChild;

  if (!firstChild) {
    return sectionElement;
  }

  const heading = firstChild.querySelector(':scope > h2');
  const summary = firstChild.querySelector(':scope > p');
  const childElementCount = firstChild.children.length;

  // 첫 블록이 "h2 하나 + p 하나" 형태면
  // stage 상단 제목 카드와 내용이 겹친다고 보고 통째로 제거한다.
  if (heading && summary && childElementCount <= 2) {
    firstChild.remove();
  }

  // 오른쪽 practice rail이 챕터별 실습을 전담하므로,
  // stage 안에 남아 있는 중복 playground 카드는 여기서 함께 제거한다.
  const duplicatedPracticeCards = sectionElement.querySelectorAll('.learning-subsection');

  for (const card of duplicatedPracticeCards) {
    if (card.querySelector('.playground')) {
      card.remove();
    }
  }

  const codeCards = sectionElement.querySelectorAll('.learning-subsection');

  for (const card of codeCards) {
    const title = card.querySelector(':scope > h3')?.textContent?.trim();
    const hasCodeBlock = Boolean(card.querySelector('pre code'));

    if (hasCodeBlock && title && REDUNDANT_STAGE_CODE_TITLES.has(title)) {
      card.remove();
    }
  }

  decorateSubsectionHeadings(sectionElement);

  return sectionElement;
}

// ------------------------------------------------------------
// decorateSubsectionHeadings(sectionElement)
// ------------------------------------------------------------
// 설명 본문은 그대로 두고, 카드 소제목만 친근하게 보이도록
// 이모티콘을 붙여 화면 표현만 살짝 부드럽게 만든다.
// ------------------------------------------------------------
function decorateSubsectionHeadings(sectionElement) {
  const sectionId = sectionElement.id;
  const cards = sectionElement.querySelectorAll('.learning-subsection');

  for (const card of cards) {
    const heading = card.querySelector(':scope > h3');

    if (!heading) {
      continue;
    }

    const baseTitle = heading.dataset.baseTitle || heading.textContent.trim();

    if (!baseTitle) {
      continue;
    }

    heading.dataset.baseTitle = baseTitle;

    const emoji =
      SECTION_SPECIFIC_SUBSECTION_EMOJIS[sectionId]?.[baseTitle] ||
      COMMON_SUBSECTION_EMOJIS[baseTitle];

    if (!emoji) {
      continue;
    }

    heading.textContent = '';
    heading.classList.add('subsection-heading-friendly');

    const emojiSpan = document.createElement('span');
    const textSpan = document.createElement('span');

    emojiSpan.className = 'subsection-heading-emoji';
    textSpan.className = 'subsection-heading-text';

    emojiSpan.textContent = emoji;
    textSpan.textContent = baseTitle;

    heading.append(emojiSpan, textSpan);
  }
}
// ------------------------------------------------------------
// getInitialSectionIndex(sections)
// ------------------------------------------------------------
// 주소창 hash가 있으면 그 챕터부터 열고,
// 없으면 첫 번째 챕터를 연다.
// ------------------------------------------------------------
function getInitialSectionIndex(sections) {
  // location.hash는 '#hooks-section' 같은 문자열이 들어 있다.
  const hash = window.location.hash.replace('#', '');

  // hash가 없으면 첫 챕터부터 시작한다.
  if (!hash) {
    return 0;
  }

  // sections 배열에서 hash와 같은 id를 가진 챕터를 찾는다.
  const matchIndex = sections.findIndex((section) => section.id === hash);

  // 찾았으면 그 인덱스를 쓰고, 못 찾았으면 0번으로 돌아간다.
  return matchIndex >= 0 ? matchIndex : 0;
}

// ------------------------------------------------------------
// renderCurrentSection(ui, sections, index)
// ------------------------------------------------------------
// 현재 선택된 챕터 1개만 오른쪽 영역에 보여 준다.
// ------------------------------------------------------------
function renderCurrentSection(ui, sections, index) {
  // 현재 인덱스에 해당하는 챕터 정보를 꺼낸다.
  const currentSection = sections[index];

  // 안전 장치:
  // 혹시 잘못된 인덱스가 들어오면 화면을 바꾸지 않는다.
  if (!currentSection) {
    return;
  }

  // 기존 오른쪽 내용을 지우고 현재 챕터 1개만 넣는다.
  ui.content.replaceChildren(currentSection.element);

  // 왼쪽 메뉴에서 현재 챕터를 강조 표시한다.
  setActiveSectionLink(ui.nav, currentSection.id);

  // 상단 상태 카드에는 "몇 번째 챕터를 보고 있는지"를 적어 준다.
  setProgressText(
    ui.progressText,
    `${currentSection.order} / ${sections.length} 챕터: ${currentSection.title}`,
  );

  // 챕터 메타 정보 영역도 현재 섹션 기준으로 갱신한다.
  ui.chapterStep.textContent = `Chapter ${currentSection.order}`;
  ui.chapterTitle.textContent = currentSection.title;
  ui.chapterSummary.textContent = currentSection.summary;

  // 오른쪽 rail도 현재 챕터에 맞는 실습으로 교체한다.
  renderPracticeRail(ui.practiceSlot, currentSection.practice);

  // 챕터를 바꿀 때는 가운데 stage와 오른쪽 rail을 모두 맨 위로 돌린다.
  // 그래야 이전 챕터에서 내려 읽던 스크롤 위치가 다음 챕터에 남지 않는다.
  if (ui.stage) {
    ui.stage.scrollTop = 0;
  }

  if (ui.practiceRail) {
    ui.practiceRail.scrollTop = 0;
  }

  // 주소창 hash도 현재 챕터 id로 맞춰 둔다.
  // 이렇게 하면 새로고침해도 같은 챕터부터 다시 열 수 있다.
  window.history.replaceState(null, '', `#${currentSection.id}`);
}

// ------------------------------------------------------------
// bindNavigation(ui, sections, getIndex, setIndex)
// ------------------------------------------------------------
// 왼쪽 메뉴 버튼이 같은 규칙으로 챕터를 바꾸도록 연결한다.
// ------------------------------------------------------------
function bindNavigation(ui, sections, setIndex) {
  // 왼쪽 메뉴를 만든다.
  renderSectionNavigation(ui.nav, sections, (sectionId) => {
    // 눌린 버튼의 id와 같은 챕터 인덱스를 찾는다.
    const targetIndex = sections.findIndex((section) => section.id === sectionId);

    // 찾았을 때만 현재 챕터를 바꾼다.
    if (targetIndex >= 0) {
      setIndex(targetIndex);
    }
  });
}

// ------------------------------------------------------------
// ------------------------------------------------------------
// renderPracticeRail(practiceSlot, practiceConfig)
// ------------------------------------------------------------
// 오른쪽 rail은 이제 챕터에 맞춰 내용이 바뀐다.
// 한 개짜리 실습이면 바로 playground를 보여 주고,
// 여러 개짜리 실습이면 작은 탭을 눌러 바꿔 볼 수 있게 만든다.
// ------------------------------------------------------------
function renderPracticeRail(practiceSlot, practiceConfig) {
  if (!practiceSlot) {
    return;
  }

  const items = practiceConfig?.items ?? [];

  if (items.length === 0) {
    practiceSlot.replaceChildren();
    return;
  }

  const shell = document.createElement('section');
  const header = document.createElement('div');
  const kicker = document.createElement('p');
  const title = document.createElement('h3');
  const body = document.createElement('div');
  const playgroundSlot = document.createElement('div');

  shell.className = 'panel-card practice-rail-panel';
  header.className = 'practice-rail-header';
  kicker.className = 'practice-rail-kicker';
  title.className = 'practice-rail-title';
  body.className = 'practice-rail-body';
  playgroundSlot.className = 'practice-rail-playground';

  kicker.textContent = 'Practice Rail';
  title.textContent = practiceConfig?.title || '직접 해보기';

  header.append(kicker, title);
  shell.append(header, body);

  let tabButtons = [];

  const renderPracticeItem = (itemIndex) => {
    const currentItem = items[itemIndex];

    if (!currentItem) {
      return;
    }

    const playground = createPlayground({
      title: currentItem.fileName,
      description: currentItem.description,
      initialCode: currentItem.initialCode,
      showVdom: currentItem.showVdom,
      stacked: true,
    });

    playgroundSlot.replaceChildren(playground.element);
    playground.run();

    for (const [index, button] of tabButtons.entries()) {
      const isActive = index === itemIndex;
      button.classList.toggle('is-active', isActive);
      button.setAttribute('aria-pressed', isActive ? 'true' : 'false');
    }
  };

  if (items.length > 1) {
    const tabList = document.createElement('div');
    tabList.className = 'practice-rail-tabs';

    tabButtons = items.map((item, index) => {
      const button = document.createElement('button');
      button.type = 'button';
      button.className = 'practice-rail-tab';
      button.textContent = item.label;

      button.addEventListener('click', () => {
        renderPracticeItem(index);
      });

      tabList.appendChild(button);
      return button;
    });

    body.appendChild(tabList);
  }

  body.appendChild(playgroundSlot);
  practiceSlot.replaceChildren(shell);
  renderPracticeItem(0);
}

// ------------------------------------------------------------
// bootstrap()
// ------------------------------------------------------------
// 페이지를 여는 순간 필요한 초기 작업을 모두 수행한다.
// ------------------------------------------------------------
function bootstrap() {
  // index.html의 #app을 찾는다.
  const root = document.querySelector('#app');

  // #app이 없으면 그릴 곳이 없으니 종료한다.
  if (!root) return;

  // layout.js가 만든 바깥 화면 구조를 먼저 붙인다.
  const ui = createLayout(root);

  // 실제 챕터 DOM들을 만든다.
  const sections = buildSections();

  // 처음에 어떤 챕터를 열지 계산한다.
  let currentIndex = getInitialSectionIndex(sections);

  // 현재 인덱스를 바꾸고 화면을 다시 그리는 함수다.
  const setIndex = (nextIndex) => {
    // 인덱스가 배열 범위를 벗어나지 않게 막는다.
    const safeIndex = Math.max(0, Math.min(nextIndex, sections.length - 1));

    // 실제 현재 인덱스를 새 값으로 교체한다.
    currentIndex = safeIndex;

    // 선택된 챕터만 화면에 그린다.
    renderCurrentSection(ui, sections, currentIndex);
  };

  // 메뉴 버튼을 연결한다.
  bindNavigation(ui, sections, setIndex);

  // 첫 화면도 현재 인덱스 기준으로 한 번 그린다.
  renderCurrentSection(ui, sections, currentIndex);
}

// 파일이 열리면 앱을 바로 시작한다.
bootstrap();
