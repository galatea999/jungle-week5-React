// ============================================================
// layout.js — 학습 페이지의 큰 뼈대를 만드는 파일
// ============================================================
//
// 이번 버전에서는 한 번에 모든 챕터를 보여 주지 않는다.
// 대신 왼쪽 메뉴에서 챕터를 고르면
// 오른쪽 내용이 "교체"되는 방식으로 동작한다.
// ============================================================

// ------------------------------------------------------------
// createLayout(root)
// ------------------------------------------------------------
// index.html의 #app 안에 학습 페이지 기본 구조를 만든다.
//
// [왼쪽]
//   - 챕터 네비게이션
//
// [가운데]
//   - 현재 챕터 제목
//   - 실제 챕터 내용 1개
//
// [오른쪽]
//   - 직접 해보기 playground
//   - 라이브 프리뷰
// ------------------------------------------------------------
export function createLayout(root) {
  // root는 index.html의 가장 큰 빈 상자다.
  // 이 안을 우리 학습 페이지 구조로 통째로 채운다.
  const heroLinks = [
    {
      label: 'Components',
      href: 'https://ko.react.dev/learn/importing-and-exporting-components',
    },
    {
      label: 'Props',
      href: 'https://ko.react.dev/learn/passing-props-to-a-component',
    },
    {
      label: 'State',
      href: 'https://ko.react.dev/learn/state-a-components-memory',
    },
    {
      label: 'Effects',
      href: 'https://ko.react.dev/learn/synchronizing-with-effects',
    },
  ];

  // hero pill은 이제 단순 장식이 아니라
  // React 공식 문서로 가는 빠른 학습 링크 역할도 한다.
  const heroPillsMarkup = heroLinks
    .map((link) => {
      return `
        <a
          class="hero-pill"
          href="${link.href}"
          target="_blank"
          rel="noreferrer"
        >
          ${link.label}
        </a>
      `;
    })
    .join('');

  root.innerHTML = `
    <main class="nexus-shell learning-shell">
      <section class="main-grid learning-grid">
        <header class="hero learning-hero learning-hero-banner">
          <div class="hero-copy hero-copy-inline">
            <div class="hero-title-row">
              <svg
                class="react-mark react-mark-inline"
                viewBox="0 0 256 256"
                role="img"
                aria-label="React logo"
              >
                <circle class="react-mark-core" cx="128" cy="128" r="18"></circle>
                <ellipse class="react-mark-orbit" cx="128" cy="128" rx="92" ry="36"></ellipse>
                <ellipse
                  class="react-mark-orbit"
                  cx="128"
                  cy="128"
                  rx="92"
                  ry="36"
                  transform="rotate(60 128 128)"
                ></ellipse>
                <ellipse
                  class="react-mark-orbit"
                  cx="128"
                  cy="128"
                  rx="92"
                  ry="36"
                  transform="rotate(120 128 128)"
                ></ellipse>
              </svg>
              <h1>What is React?</h1>
            </div>

            <nav class="hero-pills" aria-label="React 공식 학습 링크">
              ${heroPillsMarkup}
            </nav>
          </div>
        </header>

        <aside class="panel-card learning-sidebar">
          <p class="sidebar-label">Roadmap</p>
          <h2>학습 순서</h2>
          <nav id="learning-nav" aria-label="학습 섹션 목록"></nav>
        </aside>

        <section class="learning-stage">
          <header class="panel-card chapter-shell">
            <div class="chapter-copy">
              <p id="chapter-step" class="chapter-step">Chapter 1</p>
              <h2 id="chapter-title" class="chapter-title">챕터 제목을 준비 중입니다.</h2>
              <p id="chapter-summary" class="chapter-summary">
                챕터 설명을 준비 중입니다.
              </p>
            </div>
          </header>

          <section id="learning-content" class="learning-content" aria-live="polite"></section>
        </section>

        <aside class="learning-practice-rail" aria-label="실습 영역">
          <div id="practice-rail-slot" class="practice-rail-slot"></div>
        </aside>
      </section>
    </main>
  `;

  // app.js가 쉽게 쓸 수 있도록 주요 DOM 요소들을 모아 반환한다.
  return {
    // 왼쪽 챕터 메뉴 영역이다.
    nav: root.querySelector('#learning-nav'),
    // 가운데 stage 전체 영역이다.
    stage: root.querySelector('.learning-stage'),
    // 실제 현재 챕터가 렌더링될 영역이다.
    content: root.querySelector('#learning-content'),
    // 예전 상단 상태 카드 자리다.
    // 지금은 카드를 지웠기 때문에 null이 들어올 수 있다.
    progressText: root.querySelector('#learning-progress-text'),
    // 현재 챕터 번호 텍스트다.
    chapterStep: root.querySelector('#chapter-step'),
    // 현재 챕터 제목이다.
    chapterTitle: root.querySelector('#chapter-title'),
    // 현재 챕터 한 줄 설명이다.
    chapterSummary: root.querySelector('#chapter-summary'),
    // 오른쪽 실습 rail 전체 영역이다.
    practiceRail: root.querySelector('.learning-practice-rail'),
    // 오른쪽 실습 rail에 playground를 꽂을 자리다.
    practiceSlot: root.querySelector('#practice-rail-slot'),
  };
}

// ------------------------------------------------------------
// renderSectionNavigation(nav, sections, onSelect)
// ------------------------------------------------------------
// 왼쪽 네비게이션 메뉴를 버튼 방식으로 만든다.
// ------------------------------------------------------------
export function renderSectionNavigation(nav, sections, onSelect) {
  // 전체 메뉴를 담을 순서 목록을 만든다.
  const list = document.createElement('ol');
  // CSS에서 메뉴 목록처럼 꾸밀 클래스다.
  list.className = 'learning-nav-list';

  // 나중에 필요할 수 있도록 버튼들을 모아 둘 배열이다.
  const buttons = [];

  // sections 배열을 돌며 메뉴 버튼을 만든다.
  for (const section of sections) {
    // 한 줄을 담을 li를 만든다.
    const item = document.createElement('li');
    // 실제 클릭 버튼을 만든다.
    const button = document.createElement('button');

    // 버튼 타입을 명시해야 폼 submit 같은 오동작을 막을 수 있다.
    button.type = 'button';
    // CSS에서 메뉴 버튼처럼 꾸밀 클래스다.
    button.className = 'learning-nav-link';
    // 현재 버튼이 어떤 챕터를 가리키는지 저장한다.
    button.dataset.sectionId = section.id;
    // 화면에는 챕터 제목을 보여 준다.
    button.textContent = section.title;

    // 버튼을 누르면 바깥에서 넘겨준 onSelect 함수를 호출한다.
    button.addEventListener('click', () => {
      // onSelect가 함수일 때만 안전하게 실행한다.
      if (typeof onSelect === 'function') {
        // 어떤 챕터를 눌렀는지 section id를 넘겨 준다.
        onSelect(section.id);
      }
    });

    // li 안에 버튼을 넣는다.
    item.appendChild(button);
    // 전체 목록 안에 li를 넣는다.
    list.appendChild(item);
    // 버튼 배열에도 저장해 둔다.
    buttons.push(button);
  }

  // 기존 메뉴를 비우고 새 목록으로 교체한다.
  nav.replaceChildren(list);

  // 만든 버튼 배열을 반환한다.
  return buttons;
}

// ------------------------------------------------------------
// setActiveSectionLink(nav, activeSectionId)
// ------------------------------------------------------------
// 현재 활성 챕터 버튼에만 강조 클래스를 붙인다.
// ------------------------------------------------------------
export function setActiveSectionLink(nav, activeSectionId) {
  // nav 안에 있는 모든 메뉴 버튼을 가져온다.
  const links = nav.querySelectorAll('.learning-nav-link');

  // 버튼을 하나씩 돌며 현재 챕터와 같은지 검사한다.
  for (const link of links) {
    // data-section-id가 현재 챕터 id와 같으면 true다.
    const isActive = link.dataset.sectionId === activeSectionId;

    // 활성 버튼에는 is-active 클래스를 붙인다.
    link.classList.toggle('is-active', isActive);
    // 스크린 리더도 현재 위치를 알 수 있게 만든다.
    link.setAttribute('aria-current', isActive ? 'true' : 'false');
  }
}

// ------------------------------------------------------------
// setProgressText(progressText, text)
// ------------------------------------------------------------
// 상단 상태 카드 문구를 바꾸는 helper다.
// ------------------------------------------------------------
export function setProgressText(progressText, text) {
  // progressText가 실제로 있을 때만 글자를 바꾼다.
  if (progressText) {
    // 화면에 보여 줄 새 문구를 넣는다.
    progressText.textContent = text;
  }
}
