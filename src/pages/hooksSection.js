// ============================================================
// hooksSection.js — 섹션 2 학습 콘텐츠
// ============================================================
//
// 이 파일은 useState, useEffect, useMemo를 배우는 학습 섹션을 만든다.
// 학생이 "왜 이 Hook이 필요한지"를 읽은 뒤,
// 바로 playground에서 버튼과 입력값을 바꿔 보며
// 동작을 확인할 수 있게 구성했다.
// ============================================================

import { createAnswerToggle } from '../ui/contentBlocks.js';
import { createPracticePlaygroundCard } from './practicePlayground.js';

// 섹션 맨 위에서 학생에게 보여줄 학습 목표다.
// 먼저 목표를 본 뒤 아래 Hook 카드들을 읽으면
// "지금 뭘 확인해야 하는지"를 잡기 쉽다.
const SECTION_GOALS = [
  '함수형 컴포넌트가 다시 실행돼도 값이 어떻게 유지되는지 이해한다.',
  'useState, useEffect, useMemo가 각각 어떤 문제를 해결하기 위해 등장했는지 구분한다.',
  '같은 컴포넌트 안에서도 "값 기억하기", "렌더링 뒤 실행하기", "계산 아끼기"가 서로 다른 역할이라는 점을 익힌다.',
  'playground에서 어떤 값을 바꿔 보면 Hook의 차이가 잘 드러나는지 미리 익힌다.',
];

// Hook은 문법보다 "호출 규칙"을 먼저 놓치기 쉽다.
// 그래서 규칙을 별도 카드로 빼서, 실습 전에 주의점을 한번 더 짚어 준다.
const HOOK_RULES = [
  'Hook은 컴포넌트 함수의 맨 위에서 같은 순서로 호출한다.',
  '조건문이나 반복문 안에서 Hook 호출 순서를 바꾸지 않는다.',
  'state를 바꿀 때는 값을 직접 덮어쓰지 말고 setter 함수를 사용한다.',
];

const HOOK_OVERVIEW =
  '함수형 컴포넌트는 화면이 다시 그려질 때마다 함수 본문이 처음부터 다시 실행됩니다. 그래서 이전 값을 기억하거나, 렌더링이 끝난 뒤 특정 동작을 실행하거나, 무거운 계산을 계속 다시 하지 않으려면 단순 지역 변수만으로는 부족합니다. Hook은 바로 이런 문제를 해결하기 위한 React의 규칙 있는 도구입니다. 무엇을 기억할지, 언제 실행할지, 언제 이전 계산을 재사용할지를 Hook이 정해진 자리에서 관리해 주기 때문에 함수형 컴포넌트도 상태를 가진 화면을 만들 수 있습니다.';

// 각 Hook 카드의 원본 데이터다.
// 이름, 한 줄 요약, 자세한 설명, starter code, 실습 포인트, 답안 예시, 챌린지를 한 곳에 모아 두면
// 화면 구조를 바꾸더라도 학습 내용 자체는 따로 관리할 수 있다.
export const HOOK_PRACTICES = [
  {
    name: 'useState',
    fileName: 'UseStatePractice.js',
    summary: '버튼이나 입력창처럼 사용자의 행동에 따라 바뀌는 값을 컴포넌트가 기억하게 만드는 Hook입니다.',
    explanation:
      '컴포넌트 함수는 다시 실행될 때마다 지역 변수가 처음 상태로 돌아가지만, useState는 같은 자리의 값을 계속 기억해 둡니다. 그래서 버튼을 눌러 숫자를 바꾸거나 입력창에 글자를 쓸 때 이전 값이 사라지지 않고 이어집니다. setter를 호출하면 React는 새 값을 저장하고, 그 값을 반영한 화면을 한 번 더 그리게 됩니다.',
    playgroundDescription:
      '초기값을 바꾸거나 버튼을 추가해 보면서 같은 state가 화면 여러 곳에 함께 반영되는지 확인해 보세요.',
    starterCode: `function Counter() {
  const [count, setCount] = useState(0);

  return h('section', null,
    h('p', null, '현재 숫자: ' + count),
    h('button', {
      onclick: () => setCount(count + 1),
    }, '+1')
  );
}

return Counter;`,
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
}

return Counter;`,
    challenge:
      '카운트 숫자 아래에 짝수/홀수 문구를 추가해서 state 변화가 화면 여러 곳에 동시에 반영되게 만들어 보세요.',
  },
  {
    name: 'useEffect',
    fileName: 'UseEffectPractice.js',
    summary: '렌더링이 끝난 뒤에 실행해야 하는 일을 따로 등록할 수 있게 해 주는 Hook입니다.',
    explanation:
      '로그 남기기, 타이머 시작하기, 외부 API와 연결하기처럼 화면을 그리는 일과는 다른 작업은 렌더링이 끝난 뒤에 실행해야 안전합니다. useEffect는 이런 작업을 "언제 실행할지"와 함께 등록하는 자리입니다. 특히 의존성 배열은 어떤 값이 바뀌었을 때 effect를 다시 실행할지 정해 주기 때문에, 필요할 때만 effect가 동작하도록 도와줍니다.',
    playgroundDescription:
      '이름을 바꿔 보면서 화면 아래 effect 문구가 언제 다시 바뀌는지 확인해 보세요.',
    starterCode: `function WelcomeLogger() {
  const [name, setName] = useState('정글');

  useEffect(() => {
    const log = previewContainer.querySelector('[data-effect-log]');

    if (log) {
      log.textContent = 'effect가 마지막으로 본 이름: ' + name;
    }
  }, [name]);

  return h('section', null,
    h('label', null,
      '이름',
      h('input', {
        value: name,
        oninput: (event) => setName(event.target.value),
      })
    ),
    h('p', null, '안녕하세요, ' + name),
    h('p', { 'data-effect-log': 'true' }, 'effect가 아직 실행되지 않았습니다.')
  );
}

return WelcomeLogger;`,
    tryIt: [
      '의존성 배열을 `[]`로 바꿔서 첫 렌더링에만 effect가 실행되는 경우를 떠올려 본다.',
      '`[name]`을 유지한 채 입력값을 바꿨을 때 어떤 순간에 아래 effect 문구가 바뀌는지 말로 설명해 본다.',
      '의존성 배열을 없애면 왜 매 렌더링마다 effect가 실행되는지 친구에게 설명해 본다.',
    ],
    answerCode: `function WelcomeLogger() {
  const [name, setName] = useState('정글');
  const [track, setTrack] = useState('Frontend');

  useEffect(() => {
    const log = previewContainer.querySelector('[data-effect-log]');

    if (log) {
      log.textContent = 'effect가 마지막으로 본 이름: ' + name;
    }
  }, [name]);

  return h('section', null,
    h('label', null,
      '이름',
      h('input', {
        value: name,
        oninput: (event) => setName(event.target.value),
      })
    ),
    h('label', null,
      '트랙',
      h('input', {
        value: track,
        oninput: (event) => setTrack(event.target.value),
      })
    ),
    h('p', null, '안녕하세요, ' + name),
    h('p', null, '트랙: ' + track),
    h('p', { 'data-effect-log': 'true' }, 'effect가 아직 실행되지 않았습니다.')
  );
}

return WelcomeLogger;`,
    challenge:
      'name 말고 track state를 하나 더 추가하고, 이름이 바뀔 때만 effect 문구가 바뀌도록 deps를 설계해 보세요.',
  },
  {
    name: 'useMemo',
    fileName: 'UseMemoPractice.js',
    summary: '비용이 큰 계산 결과를 매번 다시 만들지 않고, 필요할 때만 다시 계산하게 해 주는 Hook입니다.',
    explanation:
      '합계 계산, 정렬, 필터링처럼 시간이 조금 더 걸리는 작업은 렌더링이 일어날 때마다 무조건 다시 할 필요가 없습니다. useMemo는 이전에 계산한 결과를 기억해 두었다가, 관련된 입력값이 그대로면 그 결과를 다시 꺼내 씁니다. 즉 화면이 다시 그려진다고 해서 계산도 무조건 다시 하는 것은 아니라는 점을 이해하는 데 중요한 Hook입니다.',
    playgroundDescription:
      '탭만 바꿀 때는 계산 횟수가 그대로인지, 점수를 바꿀 때만 다시 계산되는지 확인해 보세요.',
    starterCode: `let totalRuns = 0;

function ScoreSummary(props) {
  const total = useMemo(() => {
    totalRuns += 1;
    return props.scores.reduce((sum, score) => sum + score, 0);
  }, [props.scores]);

  return h('section', null,
    h('p', null, '총점: ' + total),
    h('p', null, '총점 계산 횟수: ' + totalRuns)
  );
}

function App() {
  const [tab, setTab] = useState('summary');
  const [scores, setScores] = useState([10, 20, 30]);

  return h('section', null,
    h('button', {
      onclick: () => setTab(tab === 'summary' ? 'details' : 'summary'),
    }, '탭 바꾸기'),
    h('button', {
      onclick: () => setScores([...scores, 5]),
    }, '점수 추가'),
    h('p', null, '현재 탭: ' + tab),
    h(ScoreSummary, { scores: scores })
  );
}

return App;`,
    tryIt: [
      '점수 배열이 그대로일 때는 계산 횟수가 다시 늘어나지 않아야 한다고 예상해 본다.',
      '탭만 바꾸면 왜 화면은 다시 그리지만 총점 계산은 다시 안 해도 되는지 말로 설명해 본다.',
      '점수를 추가했을 때만 계산 횟수가 늘어나는지 직접 눌러 확인해 본다.',
    ],
    answerCode: `let totalRuns = 0;
let maxRuns = 0;

function ScoreSummary(props) {
  const total = useMemo(() => {
    totalRuns += 1;
    return props.scores.reduce((sum, score) => sum + score, 0);
  }, [props.scores]);

  const max = useMemo(() => {
    maxRuns += 1;
    return props.scores.reduce((best, score) => Math.max(best, score), 0);
  }, [props.scores]);

  return h('section', null,
    h('p', null, '총점: ' + total),
    h('p', null, '최고점: ' + max),
    h('p', null, '총점 계산 횟수: ' + totalRuns),
    h('p', null, '최고점 계산 횟수: ' + maxRuns)
  );
}

function App() {
  const [tab, setTab] = useState('summary');
  const [scores, setScores] = useState([10, 20, 30]);

  return h('section', null,
    h('button', {
      onclick: () => setTab(tab === 'summary' ? 'details' : 'summary'),
    }, '탭 바꾸기'),
    h('button', {
      onclick: () => setScores([...scores, 5]),
    }, '점수 추가'),
    h('p', null, '현재 탭: ' + tab),
    h(ScoreSummary, { scores: scores })
  );
}

return App;`,
    challenge:
      '총점과 최고점을 각각 따로 memo로 계산하고, scores가 바뀔 때만 다시 계산되게 구성해 보세요.',
  },
];

// ------------------------------------------------------------
// createHooksSection()
// ------------------------------------------------------------
// 섹션 2 전체를 조립하는 공개 함수다.
//
// [읽는 흐름]
//   목표 -> 규칙 -> Hook 공통 설명 -> Hook별 카드 -> 실습 팁
// ------------------------------------------------------------
export function createHooksSection() {
  const section = document.createElement('section');
  section.id = 'hooks-section';
  section.className = 'panel-card learning-section';

  section.appendChild(
    createTitleBlock(
      '2. Hooks 배우기',
      'State를 기억하고, 렌더링 뒤 동작을 실행하고, 계산 결과를 아끼는 법을 playground와 함께 배우는 섹션입니다.',
    ),
  );

  section.appendChild(createListCard('이번 섹션에서 배울 것', SECTION_GOALS));
  section.appendChild(
    createParagraphCard(
      '왜 Hook이 필요한가',
      HOOK_OVERVIEW,
    ),
  );
  section.appendChild(createListCard('Hook을 쓸 때 기억할 규칙', HOOK_RULES));
  section.appendChild(
    createParagraphCard(
      '먼저 이해하기',
      'Hook은 함수형 컴포넌트가 매 렌더링마다 완전히 새로 실행되더라도, 이전에 저장한 값과 계산 결과를 같은 자리에서 다시 꺼내 쓸 수 있게 도와주는 장치입니다.',
    ),
  );

  // HOOK_PRACTICES 데이터를 순회하며 Hook별 학습 카드를 반복해서 만든다.
  // 데이터와 UI 구조가 분리되어 있어, 나중에 카드 순서를 바꾸거나 항목을 추가하기 쉽다.
  for (const lesson of HOOK_PRACTICES) {
    section.appendChild(createHookLessonCard(lesson));
  }

  section.appendChild(
    createParagraphCard(
      '실습 팁',
      '먼저 실행 버튼으로 초기 화면을 확인하고, 그다음 입력값이나 버튼을 하나씩 바꾸며 어떤 Hook이 언제 다시 동작하는지 순서대로 관찰해 보세요.',
    ),
  );

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
// 하나의 Hook 안에도 "설명 -> playground -> 직접 해보기 -> 답안 -> 챌린지" 흐름이 반복되도록 묶었다.
function createHookLessonCard({
  name,
  fileName,
  summary,
  explanation,
  playgroundDescription,
  starterCode,
  tryIt,
  answerCode,
  challenge,
}) {
  const article = createCardShell(name);
  const summaryParagraph = document.createElement('p');

  summaryParagraph.textContent = summary;

  article.appendChild(summaryParagraph);
  article.appendChild(createDetailParagraph('설명', explanation));
  article.appendChild(
    createPracticePlaygroundCard({
      title: '예제 코드 + 직접 해보기',
      fileName,
      description: playgroundDescription,
      initialCode: starterCode,
    }),
  );
  article.appendChild(createDetailList('직접 해보기', tryIt));
  article.appendChild(createDetailCodeBlock('한 가지 가능한 답안', createAnswerToggle(answerCode)));
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
