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

// 실제로 보여 줄 학습 챕터 섹션들을 가져온다.
import { createComponentSection } from './pages/componentSection.js';
import { createHooksSection } from './pages/hooksSection.js';
import { createStateSection } from './pages/stateSection.js';
import { createVdomSection } from './pages/vdomSection.js';
import { createWorkshopSection } from './pages/workshopSection.js';

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
  },
  {
    id: 'hooks-section',
    title: '2. Hooks 배우기',
    summary: 'useState, useEffect, useMemo가 어떤 문제를 해결하는지 살펴봅니다.',
    create: createHooksSection,
  },
  {
    id: 'state-section',
    title: '3. State 위치 올리기',
    summary: '여러 컴포넌트가 같은 값을 공유할 때 state를 어디에 두면 좋은지 배웁니다.',
    create: createStateSection,
  },
  {
    id: 'vdom-section',
    title: '4. Virtual DOM이 하는 일',
    summary: '렌더링, diff, patch가 어떤 순서로 이어지는지 눈으로 확인합니다.',
    create: createVdomSection,
  },
  {
    id: 'workshop-section',
    title: '5. 컴포넌트 조립 워크숍',
    summary: '앞에서 배운 조각들을 조립해 하나의 작은 앱을 완성합니다.',
    create: createWorkshopSection,
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
    element: sectionInfo.create(),
  }));
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

  // 첫 챕터면 이전 버튼을 막고,
  // 마지막 챕터면 다음 버튼을 막는다.
  ui.prevButton.disabled = index === 0;
  ui.nextButton.disabled = index === sections.length - 1;

  // 주소창 hash도 현재 챕터 id로 맞춰 둔다.
  // 이렇게 하면 새로고침해도 같은 챕터부터 다시 열 수 있다.
  window.history.replaceState(null, '', `#${currentSection.id}`);
}

// ------------------------------------------------------------
// bindNavigation(ui, sections, getIndex, setIndex)
// ------------------------------------------------------------
// 왼쪽 메뉴 버튼과 이전/다음 버튼이
// 같은 규칙으로 챕터를 바꾸도록 연결한다.
// ------------------------------------------------------------
function bindNavigation(ui, sections, getIndex, setIndex) {
  // 왼쪽 메뉴를 만든다.
  renderSectionNavigation(ui.nav, sections, (sectionId) => {
    // 눌린 버튼의 id와 같은 챕터 인덱스를 찾는다.
    const targetIndex = sections.findIndex((section) => section.id === sectionId);

    // 찾았을 때만 현재 챕터를 바꾼다.
    if (targetIndex >= 0) {
      setIndex(targetIndex);
    }
  });

  // 이전 버튼을 누르면 현재 인덱스보다 하나 앞 챕터로 간다.
  ui.prevButton.addEventListener('click', () => {
    // 현재 위치에서 1을 뺀 값이 새 인덱스다.
    setIndex(getIndex() - 1);
  });

  // 다음 버튼을 누르면 현재 인덱스보다 하나 뒤 챕터로 간다.
  ui.nextButton.addEventListener('click', () => {
    // 현재 위치에서 1을 더한 값이 새 인덱스다.
    setIndex(getIndex() + 1);
  });
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

  // 현재 인덱스를 읽는 함수다.
  const getIndex = () => currentIndex;

  // 현재 인덱스를 바꾸고 화면을 다시 그리는 함수다.
  const setIndex = (nextIndex) => {
    // 인덱스가 배열 범위를 벗어나지 않게 막는다.
    const safeIndex = Math.max(0, Math.min(nextIndex, sections.length - 1));

    // 실제 현재 인덱스를 새 값으로 교체한다.
    currentIndex = safeIndex;

    // 선택된 챕터만 화면에 그린다.
    renderCurrentSection(ui, sections, currentIndex);
  };

  // 메뉴 버튼과 이전/다음 버튼을 연결한다.
  bindNavigation(ui, sections, getIndex, setIndex);

  // 첫 화면도 현재 인덱스 기준으로 한 번 그린다.
  renderCurrentSection(ui, sections, currentIndex);
}

// 파일이 열리면 앱을 바로 시작한다.
bootstrap();
