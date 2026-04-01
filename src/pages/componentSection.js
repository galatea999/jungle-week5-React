// ============================================================
// componentSection.js — 섹션 1 학습 콘텐츠
// ============================================================
//
// 이 파일은 학습 페이지에서 가장 먼저 만나는
// "Component와 Props" 섹션을 만든다.
//
// app.js는 이 파일의 createComponentSection()만 호출하면 되고,
// 이 함수는 화면에 바로 붙일 수 있는 <section> DOM 묶음을 돌려준다.
//
// [이 파일이 하는 일]
// 1. 학생이 처음 읽을 설명 문장을 준비한다.
// 2. 카드형 UI에 들어갈 목록, 본문, 예제 코드를 정리한다.
// 3. playground에서 바로 실행할 starter code와 답안 예시를 함께 준비한다.
// ============================================================

import { createPracticePlaygroundCard } from './practicePlayground.js';

// 이 목록은 "이번 섹션에서 무엇을 배우는가?" 카드에 그대로 들어간다.
// 학습 목표를 먼저 보여주면 학생이 아래 설명을 읽을 때 집중 포인트를 잡기 쉽다.
const LEARN_ITEMS = [
  '컴포넌트가 왜 화면을 나누는 단위인지 이해한다.',
  '함수형 컴포넌트가 어떤 입력을 받아 어떤 화면을 만드는지 본다.',
  'props로 부모가 자식에게 데이터를 보내는 흐름을 익힌다.',
];

// STARTER_CODE는 코드 실행용이 아니라 "읽는 예제" 역할을 한다.
// 그래서 일부러 짧고 단순한 ProfileCard 예제로 시작해
// props가 어디서 들어와 어디서 쓰이는지만 보이게 만들었다.
const STARTER_CODE = `function ProfileCard(props) {
  return h('article', { class: 'profile-card' },
    h('h3', null, props.name),
    h('p', null, props.job)
  );
}

function App() {
  return h(ProfileCard, {
    name: '김정글',
    job: '프론트엔드 학습자',
  });
}`;

// 첫 섹션의 챌린지는 "컴포넌트 재사용" 감각을 익히는 데 초점을 둔다.
// 같은 ProfileCard를 여러 번 호출해도,
// 컴포넌트 정의는 하나고 데이터만 바뀐다는 점을 직접 느끼게 만드는 문제다.
const COMPONENT_CHALLENGE = {
  title: '챌린지: 같은 카드 두 번 재사용하기',
  goal: 'ProfileCard 하나를 재사용해서 서로 다른 두 학습자의 프로필 카드를 화면에 보여 주세요.',
  tasks: [
    'App에서 ProfileCard를 두 번 호출하고 props 값만 다르게 넣어 본다.',
    'name, job 말고 track 또는 motto 같은 새 props를 하나 더 추가해 본다.',
    '컴포넌트 함수를 새로 만들지 말고 같은 ProfileCard를 재사용해 화면을 늘린다.',
  ],
  success: [
    '화면에 서로 다른 정보의 카드가 두 장 보인다.',
    'ProfileCard 함수는 하나만 있고, 두 카드의 차이는 props 값으로만 만들어진다.',
    '부모 App이 어떤 데이터를 내려주는지 코드만 읽어도 구분된다.',
  ],
  hint: '컴포넌트 개수를 늘리기보다 App에서 같은 ProfileCard를 여러 번 호출하고 props를 바꿔 보세요.',
};

// starter code는 이제 실제 playground에서 바로 실행할 수 있는 형태다.
// 맨 아래의 return App;은 codePlayground가 루트 컴포넌트를 받아
// 바로 프리뷰를 그릴 수 있게 해 주는 마무리 줄이다.
export const COMPONENT_PRACTICE = {
  starterCode: `function ProfileCard(props) {
  return h('article', { class: 'profile-card' },
    h('h3', null, props.name),
    h('p', null, props.job)
  );
}

function App() {
  return h('section', { class: 'card-list' },
    h(ProfileCard, {
      name: '김정글',
      job: '프론트엔드 학습자',
    }),
    h('p', null, 'TODO: 같은 ProfileCard를 한 번 더 재사용해 보세요.')
  );
}

return App;`,
  answerCode: `function ProfileCard(props) {
  return h('article', { class: 'profile-card' },
    h('h3', null, props.name),
    h('p', null, props.job),
    h('p', null, '트랙: ' + props.track)
  );
}

function App() {
  return h('section', { class: 'card-list' },
    h(ProfileCard, {
      name: '김정글',
      job: '프론트엔드 학습자',
      track: 'Frontend',
    }),
    h(ProfileCard, {
      name: '박리액트',
      job: 'UI 실험가',
      track: 'Interaction',
    })
  );
}

return App;`,
};

// ------------------------------------------------------------
// createComponentSection()
// ------------------------------------------------------------
// 섹션 1 전체를 조립하는 공개 함수다.
//
// [반환값]
//   <section id="component-section">...</section>
//
// [구성 순서]
//   1. 제목과 한 줄 소개
//   2. 학습 목표
//   3. 개념 설명
//   4. 읽는 예제 코드
//   5. 직접 해보기 starter code
//   6. 한 가지 가능한 답안
//   7. 학생이 스스로 풀어 볼 챌린지
// ------------------------------------------------------------
export function createComponentSection() {
  const section = document.createElement('section');
  section.id = 'component-section';
  section.className = 'panel-card learning-section';

  // 제목 블록은 섹션의 이름표 역할을 한다.
  section.appendChild(createTitleBlock(
    '1. Component와 Props',
    'UI를 조립하는 가장 기본적인 단위를 먼저 익히는 섹션입니다.',
  ));

  // 아래 카드 순서는 "개념 -> 예제 -> 직접 해보기" 흐름을 유지한다.
  section.appendChild(createListCard('이번 섹션에서 배울 것', LEARN_ITEMS));
  section.appendChild(createTextCard(
    '설명',
    '컴포넌트는 화면을 여러 조각으로 나눈 뒤, 필요한 곳에 다시 조립할 수 있게 해주는 작은 함수입니다. props는 부모 컴포넌트가 자식 컴포넌트에게 건네주는 정보 상자라고 생각하면 쉽습니다.',
  ));
  section.appendChild(createCodeCard('예제 코드 스텁', STARTER_CODE));
  section.appendChild(createPracticePlaygroundCard({
    title: '직접 해보기',
    fileName: 'ComponentPractice.js',
    description: '같은 ProfileCard를 한 번 더 호출해 보고, props만 바꿨을 때 카드가 어떻게 달라지는지 확인해 보세요.',
    initialCode: COMPONENT_PRACTICE.starterCode,
  }));
  section.appendChild(createCodeCard('한 가지 가능한 답안', COMPONENT_PRACTICE.answerCode));
  section.appendChild(createChallengeCard(COMPONENT_CHALLENGE));

  return section;
}

// 제목 + 설명 두 줄을 묶어 섹션 맨 위에 붙이는 helper다.
// 모든 page 파일이 거의 비슷한 구조를 가지므로,
// 이렇게 작은 helper로 빼 두면 읽는 사람이 패턴을 빨리 익힐 수 있다.
function createTitleBlock(title, description) {
  const wrapper = document.createElement('div');
  const heading = document.createElement('h2');
  const text = document.createElement('p');

  heading.textContent = title;
  text.textContent = description;

  wrapper.append(heading, text);
  return wrapper;
}

// 목록 카드 helper.
// "학습 목표", "체크리스트"처럼 항목 나열이 필요한 페이지에서 공통으로 쓰는 패턴이다.
function createListCard(title, items) {
  const card = createCardShell(title);
  const list = document.createElement('ul');

  for (const item of items) {
    const li = document.createElement('li');
    li.textContent = item;
    list.appendChild(li);
  }

  card.appendChild(list);
  return card;
}

// 긴 설명 문장을 담는 가장 기본적인 텍스트 카드 helper다.
function createTextCard(title, text) {
  const card = createCardShell(title);
  const body = document.createElement('p');

  body.textContent = text;
  card.appendChild(body);
  return card;
}

// 예제 코드를 읽기 전용으로 보여주는 helper다.
// 아직 실행하지 않더라도 학생이 구조를 눈으로 익히게 만드는 역할을 한다.
function createCodeCard(title, code) {
  const card = createCardShell(title);
  const pre = document.createElement('pre');
  const codeEl = document.createElement('code');

  codeEl.textContent = code;
  pre.appendChild(codeEl);
  card.appendChild(pre);
  return card;
}

// 챌린지 문제를 실제 과제처럼 읽히게 만드는 카드 helper다.
// 단순 한 줄 문구 대신 목표, 할 일, 성공 기준, 힌트를 함께 보여 준다.
function createChallengeCard({ title, goal, tasks, success, hint }) {
  const card = createCardShell(title);

  card.appendChild(createDetailParagraph('문제 목표', goal));
  card.appendChild(createDetailList('학생이 해야 할 일', tasks));
  card.appendChild(createDetailList('성공 기준', success));
  card.appendChild(createDetailParagraph('힌트', hint));

  return card;
}

// 작은 제목과 본문을 한 덩어리로 만드는 helper다.
function createDetailParagraph(title, text) {
  const wrapper = document.createElement('div');
  const heading = document.createElement('h4');
  const body = document.createElement('p');

  heading.textContent = title;
  body.textContent = text;
  wrapper.append(heading, body);

  return wrapper;
}

// 챌린지의 할 일 / 성공 기준처럼 여러 항목이 필요한 경우에 쓰는 helper다.
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

// 모든 카드가 공통으로 쓰는 바깥 껍데기다.
// 제목(h3)과 카드 클래스만 먼저 만들고,
// 실제 내용은 각 helper가 뒤에서 붙인다.
function createCardShell(title) {
  const article = document.createElement('article');
  const heading = document.createElement('h3');

  article.className = 'panel-card learning-subsection';
  heading.textContent = title;

  article.appendChild(heading);
  return article;
}
