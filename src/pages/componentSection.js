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

import { createChallengeToggle } from '../ui/contentBlocks.js';
import { createPracticePlaygroundCard } from './practicePlayground.js';

// 이 목록은 "이번 섹션에서 무엇을 배우는가?" 카드에 그대로 들어간다.
// 학습 목표를 먼저 보여주면 학생이 아래 설명을 읽을 때 집중 포인트를 잡기 쉽다.
const LEARN_ITEMS = [
  '컴포넌트가 큰 화면을 작은 조각으로 나누는 이유와, 그렇게 나누면 <b><i>유지보수</i></b>가 왜 쉬워지는지 이해한다.',
  '함수형 컴포넌트가 <b><i>props</i></b>라는 입력을 받아 화면 조각을 만들어 내는 과정을 살펴본다.',
  '부모 컴포넌트가 자식 컴포넌트에게 데이터를 내려주는 <b><i>단방향 흐름</i></b>을 익힌다.',
  '같은 컴포넌트를 여러 번 재사용해도 코드가 깔끔하게 유지되는 <b><i>재사용성</i></b>을 확인한다.',
];

const COMPONENT_EXPLANATION =
  'React에서 컴포넌트는 화면을 만드는 가장 기본 단위입니다. 큰 페이지를 한 번에 다 그리기보다, 버튼, 카드, 목록, 프로필처럼 반복해서 쓰이는 부분을 작은 부품처럼 나눠 두면 읽기 쉽고 고치기도 쉬워집니다. 함수형 컴포넌트는 이런 부품을 함수로 표현한 것으로, 어떤 값을 입력받으면 어떤 화면 조각을 만들어 낼지 정리해 두는 역할을 합니다. 결국 컴포넌트를 잘 나누는 것은 화면을 예쁘게 만드는 기술이라기보다, <b><i>코드를 오래 관리하기 쉽게 만드는 기술</i></b>에 가깝습니다.';

const COMPONENT_IMPORTANCE =
  'props는 부모 컴포넌트가 자식 컴포넌트에게 건네주는 정보라고 생각하면 쉽습니다. 같은 ProfileCard를 두 번 써도 이름과 직업이 다르게 보이는 이유는 컴포넌트 자체가 두 종류라서가 아니라, 같은 컴포넌트에 다른 props를 넣었기 때문입니다. 그래서 이 챕터의 핵심은 "<b><i>모양을 만드는 것은 컴포넌트, 내용을 채우는 것은 props</i></b>"라는 역할 분리를 이해하는 데 있습니다. 이 감각이 잡히면 뒤에서 배우는 state나 Hook도 훨씬 덜 어렵게 느껴집니다.';

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
  title: '같은 카드 두 번 재사용하기',
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
const COMPONENT_CHALLENGES = [
  COMPONENT_CHALLENGE,
  {
    title: 'props만 바꿔 소개 문장 달라지게 만들기',
    goal: '카드 모양은 그대로 두고, props에 따라 카드 안 소개 문장이 달라지도록 만들어 보세요.',
    tasks: [
      'ProfileCard에 intro 또는 badge 같은 새 props를 추가한다.',
      '카드 안에 새 props를 출력하는 문장을 한 줄 더 넣는다.',
      '서로 다른 props를 넘겨 카드마다 다른 소개 문장이 보이게 만든다.',
    ],
    success: [
      '카드 구조는 그대로인데 출력 문장만 props에 따라 달라진다.',
      '같은 컴포넌트를 재사용하면서 내용만 바뀌는 흐름이 발표에서 분명하게 보인다.',
      'props가 UI 내용을 채우는 역할이라는 점을 코드로 바로 설명할 수 있다.',
    ],
    hint: '모양을 바꾸기보다 props 한두 개를 더 받아서 텍스트만 달라지게 만드는 쪽이 핵심입니다.',
  },
  {
    title: '부모가 카드 목록을 조립하는지 보여주기',
    goal: 'App이 카드 목록 전체를 조립하고, ProfileCard는 카드 한 장만 책임지도록 역할을 나눠 보세요.',
    tasks: [
      'App 안에 섹션 제목이나 안내 문장을 추가한다.',
      '그 아래에 ProfileCard를 두세 개 배치해서 목록처럼 보이게 만든다.',
      'ProfileCard 안에는 카드 한 장에 필요한 마크업만 남겨 둔다.',
    ],
    success: [
      '부모 App은 화면 구성, 자식 ProfileCard는 카드 한 장 표현이라는 역할 분리가 보인다.',
      '카드 수를 늘려도 ProfileCard 코드를 크게 바꾸지 않는다.',
      '부모가 조립하고 자식이 표현한다는 설명 포인트가 선명해진다.',
    ],
    hint: 'App은 전체 레이아웃을 조립하고, ProfileCard는 카드 한 장만 그린다고 생각하면 정리하기 쉽습니다.',
  },
];

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
//   6. 학생이 스스로 풀어 볼 챌린지
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
    COMPONENT_EXPLANATION,
  ));
  section.appendChild(createTextCard('왜 Component와 Props가 중요한가', COMPONENT_IMPORTANCE));
  section.appendChild(createCodeCard('예제 코드 스텁', STARTER_CODE));
  section.appendChild(createPracticePlaygroundCard({
    title: '직접 해보기',
    fileName: 'ComponentPractice.js',
    description: '같은 ProfileCard를 한 번 더 호출해 보고, props만 바꿨을 때 카드가 어떻게 달라지는지 확인해 보세요.',
    initialCode: COMPONENT_PRACTICE.starterCode,
  }));
  for (const [index, challenge] of COMPONENT_CHALLENGES.entries()) {
    section.appendChild(createChallengeToggle({
      number: index + 1,
      ...challenge,
    }));
  }

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
    li.innerHTML = item;
    list.appendChild(li);
  }

  card.appendChild(list);
  return card;
}

// 긴 설명 문장을 담는 가장 기본적인 텍스트 카드 helper다.
function createTextCard(title, text) {
  const card = createCardShell(title);
  const body = document.createElement('p');

  body.innerHTML = text;
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
