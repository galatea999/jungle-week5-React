// ============================================================
// hooksSection.js — 섹션 2 학습 콘텐츠
// ============================================================
//
// 이 파일은 useState, useEffect, useMemo를 배우는 학습 섹션을 만든다.
// 학생이 "왜 이 Hook이 필요한지"와 "어디를 바꿔 보면 좋은지"가
// 바로 보이도록 설명, 예제, 직접 해보기, 챌린지를 함께 넣는다.
//
// 이 섹션은 역할 C가 준비한 "학습 흐름"이며,
// 실제 코드를 실행하는 playground 연결은 역할 B,
// Hook이 실제로 동작하게 만드는 구현은 역할 A와 이어진다.
// ============================================================

// 섹션 맨 위에서 학생에게 보여줄 학습 목표다.
// 먼저 목표를 본 뒤 아래 Hook 카드들을 읽으면
// "지금 뭘 확인해야 하는지"를 잡기 쉽다.
const SECTION_GOALS = [
  '함수형 컴포넌트가 다시 실행돼도 값이 어떻게 유지되는지 이해한다.',
  'useState, useEffect, useMemo가 각각 언제 필요한지 구분한다.',
  'playground가 붙었을 때 어떤 값을 바꿔 보며 확인할지 미리 익힌다.',
];

// Hook은 문법보다 "호출 규칙"을 먼저 놓치기 쉽다.
// 그래서 규칙을 별도 카드로 빼서, 실습 전에 주의점을 한번 더 짚어 준다.
const HOOK_RULES = [
  'Hook은 컴포넌트 함수의 맨 위에서 같은 순서로 호출한다.',
  '조건문이나 반복문 안에서 Hook 호출 순서를 바꾸지 않는다.',
  'state를 바꿀 때는 값을 직접 덮어쓰지 말고 setter 함수를 사용한다.',
];

// 각 Hook 카드의 원본 데이터다.
// 이름, 한 줄 요약, 자세한 설명, 예제 코드, 직접 해보기, 답안 예시, 챌린지를 한 곳에 모아 두면
// 화면 구조를 바꾸더라도 학습 내용 자체는 따로 관리할 수 있다.
export const HOOK_PRACTICES = [
  {
    name: 'useState',
    summary: '버튼, 입력창처럼 바뀌는 값을 화면이 기억하게 만드는 Hook입니다.',
    explanation: '컴포넌트 함수는 다시 실행되지만, useState는 같은 자리의 값을 다시 꺼내 줍니다. setter를 호출하면 새 값을 저장하고 화면을 한 번 더 그리게 됩니다.',
    starter: `function Counter() {
  const [count, setCount] = useState(0);

  return h('section', null,
    h('p', null, '현재 숫자: ' + count),
    h('button', {
      onclick: () => setCount(count + 1),
    }, '+1')
  );
}`,
    tryIt: [
      '초기값 0을 5로 바꾸고 첫 화면이 어떻게 달라지는지 관찰해 본다.',
      '감소 버튼을 하나 더 만들어 같은 state를 여러 이벤트에서 바꿔 본다.',
      'count * 2 값을 함께 출력해서 한 state를 여러 DOM 노드가 같이 읽는 모습을 확인한다.',
    ],
    answerCode: `function Counter() {
  const [count, setCount] = useState(0);

  return h('section', null,
    h('p', null, '현재 숫자: ' + count),
    h('p', null, count % 2 === 0 ? '짝수입니다.' : '홀수입니다.'),
    h('button', {
      onclick: () => setCount(count + 1),
    }, '+1'),
    h('button', {
      onclick: () => setCount(count - 1),
    }, '-1')
  );
}`,
    challenge: '카운트 숫자 아래에 짝수/홀수 문구를 추가해서 state 변화가 화면 여러 곳에 동시에 반영되게 만들어 보세요.',
  },
  {
    name: 'useEffect',
    summary: '렌더링이 끝난 뒤 실행해야 하는 일을 등록하는 Hook입니다.',
    explanation: '로그 남기기, 타이머 시작, DOM 바깥 세상과 연결하기 같은 일은 화면이 그려진 뒤에 실행해야 안전합니다. 의존성 배열은 effect를 다시 실행할 시점을 정해 줍니다.',
    starter: `function WelcomeLogger() {
  const [name, setName] = useState('정글');

  useEffect(() => {
    console.log(name + ' 화면이 준비됐어요.');
  }, [name]);

  return h('section', null,
    h('input', {
      value: name,
      oninput: (event) => setName(event.target.value),
    }),
    h('p', null, '안녕하세요, ' + name)
  );
}`,
    tryIt: [
      '의존성 배열을 `[]`로 바꿔서 첫 렌더링에만 effect가 실행되는 경우를 떠올려 본다.',
      '`[name]`을 유지한 채 입력값을 바꿨을 때 어떤 순간에 로그가 찍혀야 하는지 말로 설명해 본다.',
      '의존성 배열을 없애면 왜 매 렌더링마다 effect가 실행되는지 친구에게 설명해 본다.',
    ],
    answerCode: `function WelcomeLogger() {
  const [name, setName] = useState('정글');
  const [track, setTrack] = useState('Frontend');

  useEffect(() => {
    console.log(name + ' 이름이 바뀌었어요.');
  }, [name]);

  return h('section', null,
    h('input', {
      value: name,
      oninput: (event) => setName(event.target.value),
    }),
    h('input', {
      value: track,
      oninput: (event) => setTrack(event.target.value),
    }),
    h('p', null, '안녕하세요, ' + name),
    h('p', null, '트랙: ' + track)
  );
}`,
    challenge: 'name 말고 track state를 하나 더 추가하고, 이름이 바뀔 때만 로그가 찍히도록 deps를 설계해 보세요.',
  },
  {
    name: 'useMemo',
    summary: '무거운 계산 결과를 다시 써도 될 때 아껴 두는 Hook입니다.',
    explanation: '합계 계산, 정렬, 필터링처럼 비용이 큰 작업은 렌더링이 일어날 때마다 다시 하지 않아도 됩니다. useMemo는 deps가 같으면 이전 계산 결과를 재사용합니다.',
    starter: `function ScoreSummary(props) {
  const total = useMemo(() => {
    console.log('총점을 다시 계산합니다.');
    return props.scores.reduce((sum, score) => sum + score, 0);
  }, [props.scores]);

  return h('p', null, '총점: ' + total);
}`,
    tryIt: [
      'scores 배열이 그대로일 때는 계산 로그가 다시 나오지 않아야 한다고 예상해 본다.',
      '총점 아래에 선택된 탭 같은 별도 state를 추가하고, 그 값만 바뀔 때 memo가 재사용돼야 하는지 생각해 본다.',
      '총점뿐 아니라 평균도 계산해 보면서 어떤 계산을 memo로 감싸면 좋을지 분류해 본다.',
    ],
    answerCode: `function ScoreSummary(props) {
  const total = useMemo(() => {
    return props.scores.reduce((sum, score) => sum + score, 0);
  }, [props.scores]);

  const max = useMemo(() => {
    return props.scores.reduce((best, score) => Math.max(best, score), 0);
  }, [props.scores]);

  return h('section', null,
    h('p', null, '총점: ' + total),
    h('p', null, '최고점: ' + max)
  );
}`,
    challenge: '총점과 최고점을 각각 따로 memo로 계산하고, scores가 바뀔 때만 다시 계산되게 구성해 보세요.',
  },
];

// ------------------------------------------------------------
// createHooksSection()
// ------------------------------------------------------------
// 섹션 2 전체를 조립하는 공개 함수다.
//
// [읽는 흐름]
//   목표 -> 규칙 -> Hook 공통 설명 -> Hook별 카드 -> playground 연결 메모
//
// 이렇게 구성하면 학생이 Hook 카드 하나만 읽고 끝나지 않고,
// "규칙"과 "실습 포인트"까지 함께 가져가게 된다.
// ------------------------------------------------------------
export function createHooksSection() {
  const section = document.createElement('section');
  section.id = 'hooks-section';
  section.className = 'panel-card learning-section';

  section.appendChild(createTitleBlock(
    '2. Hooks 배우기',
    'State를 기억하고, 렌더링 뒤 동작을 실행하고, 계산 결과를 아끼는 법을 배우는 섹션입니다.',
  ));

  section.appendChild(createListCard('이번 섹션에서 배울 것', SECTION_GOALS));
  section.appendChild(createListCard('Hook을 쓸 때 기억할 규칙', HOOK_RULES));
  section.appendChild(createParagraphCard(
    '먼저 이해하기',
    'Hook은 함수형 컴포넌트가 매 렌더링마다 완전히 새로 실행되더라도, 이전에 저장한 값과 계산 결과를 같은 자리에서 다시 꺼내 쓸 수 있게 도와주는 장치입니다.',
  ));

  // HOOK_PRACTICES 데이터를 순회하며 Hook별 학습 카드를 반복해서 만든다.
  // 데이터와 UI 구조가 분리되어 있어, 나중에 카드 순서를 바꾸거나 항목을 추가하기 쉽다.
  for (const lesson of HOOK_PRACTICES) {
    section.appendChild(createHookLessonCard(lesson));
  }

  section.appendChild(createParagraphCard(
    'Playground 연결 메모',
    'B 역할의 codePlayground가 붙으면 각 Hook 카드 아래에서 값을 바꾸고 버튼을 눌러 보며, state 변화와 effect 실행 시점, memo 재계산 여부를 실제로 확인할 수 있게 연결하면 됩니다.',
  ));

  return section;
}

// 제목과 설명 두 줄을 만드는 공통 helper다.
function createTitleBlock(title, description) {
  const wrapper = document.createElement('div');
  const heading = document.createElement('h2');
  const text = document.createElement('p');

  heading.textContent = title;
  text.textContent = description;
  wrapper.append(heading, text);

  return wrapper;
}

// 여러 항목을 bullet list로 보여주는 helper다.
// 목표 카드, 규칙 카드처럼 같은 패턴을 반복할 때 사용한다.
function createListCard(title, items) {
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

// 텍스트 설명이 중심인 카드를 만드는 helper다.
function createParagraphCard(title, text) {
  const article = createCardShell(title);
  const paragraph = document.createElement('p');

  paragraph.textContent = text;
  article.appendChild(paragraph);

  return article;
}

// Hook 하나를 설명하는 큰 카드 helper다.
// 하나의 Hook 안에도 "설명 -> 코드 -> 직접 해보기 -> 답안 -> 챌린지" 흐름이 반복되도록 묶었다.
function createHookLessonCard({ name, summary, explanation, starter, tryIt, answerCode, challenge }) {
  const article = createCardShell(name);
  const summaryParagraph = document.createElement('p');
  const starterBlock = createCodeBlock(starter);

  summaryParagraph.textContent = summary;

  article.appendChild(summaryParagraph);
  article.appendChild(createDetailParagraph('설명', explanation));
  article.appendChild(createDetailCodeBlock('예제 코드 / starter code', starterBlock));
  article.appendChild(createDetailList('직접 해보기', tryIt));
  article.appendChild(createDetailCodeBlock('한 가지 가능한 답안', createCodeBlock(answerCode)));
  article.appendChild(createDetailParagraph('챌린지', challenge));

  return article;
}

// 작은 제목(h4) + 본문(p) 조합을 만드는 세부 helper다.
// 큰 카드 안에서 소제목을 나눌 때 사용한다.
function createDetailParagraph(title, text) {
  const wrapper = document.createElement('div');
  const heading = document.createElement('h4');
  const paragraph = document.createElement('p');

  heading.textContent = title;
  paragraph.textContent = text;

  wrapper.append(heading, paragraph);
  return wrapper;
}

// "예제 코드"처럼 제목 아래에 미리 만든 DOM 노드를 그대로 붙이고 싶을 때 쓰는 helper다.
function createDetailCodeBlock(title, content) {
  const wrapper = document.createElement('div');
  const heading = document.createElement('h4');

  heading.textContent = title;
  wrapper.append(heading, content);

  return wrapper;
}

// 코드 문자열을 <pre><code> DOM으로 감싸 주는 helper다.
function createCodeBlock(codeText) {
  const pre = document.createElement('pre');
  const code = document.createElement('code');

  code.textContent = codeText;
  pre.appendChild(code);

  return pre;
}

// "직접 해보기" 같은 실습 단계 목록을 그리는 helper다.
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

// 섹션 안의 모든 카드가 공유하는 공통 껍데기다.
function createCardShell(title) {
  const article = document.createElement('article');
  const heading = document.createElement('h3');

  article.className = 'panel-card learning-subsection';
  heading.textContent = title;
  article.appendChild(heading);

  return article;
}
