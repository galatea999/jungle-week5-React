// ============================================================
// workshopSection.js — 섹션 5 학습 콘텐츠
// ============================================================
//
// 이 파일은 마지막 종합 실습 섹션을 만든다.
// 학생이 앞에서 배운 Component, Props, State, Hooks를 조합해
// 하나의 작은 앱을 직접 완성하는 흐름을 보여 주는 자리다.
//
// 그래서 이 섹션은 설명보다 "조립 목표가 또렷한가?"가 더 중요하다.
// 어떤 부품을 만들고, 최종적으로 어떤 모양이 나와야 하는지를 분명히 보여 준다.
// ============================================================

// 워크숍에서 학생이 직접 만들 조각들이다.
// "작은 컴포넌트를 나눠 만든 뒤 App에서 합친다"는 감각을 강조하려고
// 일부러 부품 이름을 분리해 적었다.
const WORKSHOP_PARTS = [
  'Header 컴포넌트',
  'ProfileCard 컴포넌트',
  'SkillList 컴포넌트',
  '루트 App 컴포넌트',
];

// 최종적으로 어떤 조립 결과를 목표로 삼는지 보여 주는 예시 코드다.
// 학생이 이 코드를 보고 역으로 "필요한 부품이 무엇인지" 떠올릴 수 있어야 한다.
const WORKSHOP_GOAL = `function App() {
  return h('main', { class: 'profile-app' },
    h(Header, { title: 'React 학습 카드' }),
    h(ProfileCard, { name: '정글', track: 'Frontend' }),
    h(SkillList, { skills: ['Component', 'State', 'Hooks'] })
  );
}`;

// 마지막 워크숍은 앞에서 배운 모든 내용을 묶는 종합 미션이다.
// 그래서 컴포넌트 분리, props 전달, 배열 렌더링, state 변화가 한 번에 들어가도록 설계했다.
const WORKSHOP_CHALLENGE = {
  title: '최종 챌린지: 나만의 React 학습 카드 앱 만들기',
  goal: 'Header, ProfileCard, SkillList를 조립하고 선택된 스킬 상태까지 보여 주는 작은 앱을 완성해 보세요.',
  tasks: [
    'Header 컴포넌트가 title props를 받아 상단 제목을 렌더링하게 만든다.',
    'ProfileCard 컴포넌트가 name, track, intro 같은 props를 받아 소개 카드를 그리게 만든다.',
    'SkillList 컴포넌트가 skills 배열을 받아 목록을 렌더링하게 만든다.',
    'App에서 useState로 selectedSkill을 관리하고, 스킬을 클릭하면 현재 선택된 스킬 문구가 바뀌게 만든다.',
  ],
  success: [
    '세 개의 하위 컴포넌트가 App 안에서 조립된다.',
    '하위 컴포넌트는 대부분 props를 통해 데이터를 받는다.',
    '배열 데이터가 목록으로 렌더링된다.',
    '상태가 바뀌면 선택된 스킬 표시가 함께 업데이트된다.',
  ],
  hint: '먼저 정적인 화면을 완성한 뒤, 마지막 단계에서 selectedSkill state와 클릭 이벤트를 붙이면 훨씬 수월합니다.',
};

// 섹션 5 전체를 조립하는 공개 함수다.
export function createWorkshopSection() {
  const section = document.createElement('section');
  section.id = 'workshop-section';
  section.className = 'panel-card learning-section';

  section.appendChild(createHeader(
    '5. 컴포넌트 조립 워크숍',
    '앞에서 배운 내용을 한 번에 써보는 종합 실습 섹션의 스텁입니다.',
  ));

  section.appendChild(createChecklistCard('조립할 부품', WORKSHOP_PARTS));
  section.appendChild(createParagraphCard(
    '워크숍 목표',
    '작은 컴포넌트를 여러 개 만든 뒤, App에서 조립해서 하나의 화면을 완성하는 경험을 제공할 예정입니다.',
  ));
  section.appendChild(createCodeCard('완성 목표 예시', WORKSHOP_GOAL));
  section.appendChild(createChallengeCard(WORKSHOP_CHALLENGE));

  return section;
}

// 섹션 헤더 helper다.
function createHeader(title, description) {
  const wrapper = document.createElement('div');
  const heading = document.createElement('h2');
  const paragraph = document.createElement('p');

  heading.textContent = title;
  paragraph.textContent = description;
  wrapper.append(heading, paragraph);

  return wrapper;
}

// 실습 준비물을 체크리스트처럼 읽게 만드는 helper다.
function createChecklistCard(title, items) {
  const article = createCardShell(title);
  const list = document.createElement('ul');

  for (const item of items) {
    const li = document.createElement('li');
    li.textContent = item;
    list.appendChild(li);
  }

  article.appendChild(list);
  return article;
}

// 설명 문장 카드 helper다.
function createParagraphCard(title, text) {
  const article = createCardShell(title);
  const paragraph = document.createElement('p');

  paragraph.textContent = text;
  article.appendChild(paragraph);

  return article;
}

// 완성 목표 예시 코드를 보여 주는 helper다.
function createCodeCard(title, code) {
  const article = createCardShell(title);
  const pre = document.createElement('pre');
  const codeEl = document.createElement('code');

  codeEl.textContent = code;
  pre.appendChild(codeEl);
  article.appendChild(pre);

  return article;
}

// 종합 워크숍용 챌린지 카드를 만드는 helper다.
function createChallengeCard({ title, goal, tasks, success, hint }) {
  const article = createCardShell(title);

  article.appendChild(createDetailParagraph('문제 목표', goal));
  article.appendChild(createDetailList('학생이 해야 할 일', tasks));
  article.appendChild(createDetailList('성공 기준', success));
  article.appendChild(createDetailParagraph('힌트', hint));

  return article;
}

function createDetailParagraph(title, text) {
  const wrapper = document.createElement('div');
  const heading = document.createElement('h4');
  const paragraph = document.createElement('p');

  heading.textContent = title;
  paragraph.textContent = text;
  wrapper.append(heading, paragraph);

  return wrapper;
}

function createDetailList(title, items) {
  const wrapper = document.createElement('div');
  const heading = document.createElement('h4');
  const list = document.createElement('ul');

  heading.textContent = title;

  for (const item of items) {
    const li = document.createElement('li');
    li.textContent = item;
    list.appendChild(li);
  }

  wrapper.append(heading, list);
  return wrapper;
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
