// ============================================================
// stateSection.js — 섹션 3 학습 콘텐츠
// ============================================================
//
// 이 파일은 "Lifting State Up"을 설명하는 섹션을 만든다.
// 쉬운 말로 바꾸면 "같이 써야 하는 값은 더 위에서 함께 관리하자"는 뜻이다.
//
// 이 섹션은 Hook을 배운 다음 바로 이어지도록 설계되어 있다.
// 학생이 "값을 기억하는 법" 다음에 "그 값을 어디에 둘지"까지 생각하게 만드는 단계다.
// ============================================================

import { createChallengeToggle } from '../ui/contentBlocks.js';
import { createPracticePlaygroundCard } from './practicePlayground.js';

// 학생이 개념을 절차로 이해하도록 돕는 단계 목록이다.
// 단순 설명만 주면 추상적으로 끝날 수 있어서,
// 실제로 state를 올릴 때 밟는 순서를 문장으로 적어 두었다.
const LIFTING_STEPS = [
  '둘 이상의 자식이 같은 값을 함께 써야 하는지 먼저 확인한다.',
  '같이 써야 한다면 그 값을 각자 들고 있지 말고 더 위의 부모 컴포넌트로 올린다.',
  '부모가 props로 현재 값을 내려주고, 값을 바꾸는 함수도 함께 내려준다.',
  '자식은 state를 따로 복사하지 않고, 받은 props를 기준으로 화면만 그리도록 정리한다.',
];

const STATE_CORE_EXPLANATION =
  'React에서 state는 "누가 이 데이터를 진짜로 소유하느냐"와 연결된 개념입니다. 어떤 값이 한 컴포넌트 안에서만 쓰인다면 그 안에 두어도 괜찮지만, 여러 컴포넌트가 같은 값을 함께 봐야 한다면 각자 따로 state를 가지는 순간 값이 어긋나기 쉽습니다. 그래서 형제 컴포넌트가 같은 데이터를 써야 할 때는 보통 둘보다 위에 있는 부모가 state를 들고, 자식은 props로 그 값을 받아 쓰는 구조를 선택합니다.';

const STATE_IMPORTANCE_EXPLANATION =
  '이 패턴을 "state를 위로 올린다"라고 부릅니다. 핵심은 자식끼리 직접 값을 맞추려고 애쓰는 것이 아니라, 부모가 하나의 기준값을 들고 모두에게 같은 값을 내려주는 데 있습니다. 이렇게 하면 입력창에서 값을 바꿨을 때 결과 카드도 바로 같은 값을 보게 되고, 나중에 로직이 커져도 데이터 흐름을 따라가기가 훨씬 쉬워집니다.';

// 온도 변환기 패턴은 React 학습에서 자주 등장하는 대표 예제다.
// 여기서는 "state가 부모에 있고 자식은 props를 받는다"는 구조만 보이도록 단순화했다.
const TEMPERATURE_EXAMPLE = `function App() {
  const [temperature, setTemperature] = useState('');

  return h('section', null,
    h(TemperatureInput, {
      label: '섭씨',
      value: temperature,
      onChange: setTemperature,
    }),
    h(ResultCard, { value: temperature })
  );
}`;

// state 섹션의 챌린지는 "누가 state를 가져야 하는가?"를 직접 판단하게 만드는 문제다.
// 핵심은 자식이 자기 state를 따로 갖는 대신,
// 부모 App이 값을 소유하고 props로 내려주는 구조를 스스로 고르는 것이다.
const STATE_CHALLENGE = {
  title: '형제 카드가 같은 값 보기',
  goal: 'TemperatureInput과 ResultCard가 App의 같은 temperature state를 공유하도록 구조를 설계해 보세요.',
  tasks: [
    'temperature state를 App 한 곳에만 둔다.',
    'TemperatureInput은 value와 onChange를 props로 받게 바꾼다.',
    'ResultCard는 props.value만 읽어서 현재 값을 보여 주게 만든다.',
    '입력창을 바꾸면 형제인 ResultCard도 바로 함께 바뀌어야 한다.',
  ],
  success: [
    'state 소유자는 App 한 곳뿐이다.',
    '자식 컴포넌트는 props를 받아 화면만 그린다.',
    '입력값을 바꾸면 결과 카드가 같은 데이터를 바로 보여 준다.',
  ],
  hint: '먼저 "누가 이 데이터를 진짜로 소유해야 하는가?"를 정한 뒤, 자식에서 state를 지우고 props만 남겨 보세요.',
};

// state 올리기 전/후 코드를 한 쌍으로 준비해 두면
// playground에서 "무엇을 바꿔야 하는가"가 훨씬 분명해진다.
const STATE_CHALLENGES = [
  STATE_CHALLENGE,
  {
    title: '입력창 두 개를 완전히 동기화하기',
    goal: 'TemperatureInput을 두 개 렌더해도 두 입력창과 결과 카드가 항상 같은 temperature state를 보도록 만들어 보세요.',
    tasks: [
      'App에 TemperatureInput을 하나 더 추가한다.',
      '두 입력창 모두 같은 value와 onChange props를 받게 연결한다.',
      '한쪽 입력창만 수정해도 다른 입력창과 ResultCard가 함께 바뀌는지 확인한다.',
    ],
    success: [
      '두 입력창이 서로 다른 local state를 가지지 않고 같은 값을 공유한다.',
      '한 입력창에서 바꾼 값이 다른 입력창과 결과 카드에 즉시 반영된다.',
      'state를 부모가 들고 있어야 하는 이유를 발표에서 분명하게 보여 줄 수 있다.',
    ],
    hint: '입력창이 두 개라도 state는 하나만 두고, 두 자식 모두 같은 props를 받게 연결하면 됩니다.',
  },
  {
    title: 'Reset 버튼도 같은 state를 바꾸게 만들기',
    goal: '별도의 ResetButton 자식 컴포넌트를 추가해서 입력창과 결과 카드가 함께 초기화되도록 만들어 보세요.',
    tasks: [
      'ResetButton 컴포넌트를 만들고 onReset props를 받게 한다.',
      'App에서 setTemperature를 활용해 초기값으로 되돌리는 함수를 만든다.',
      '버튼을 누르면 입력창 값과 ResultCard 값이 동시에 초기화되는지 확인한다.',
    ],
    success: [
      'ResetButton이 직접 state를 가지지 않고 부모가 내려준 함수만 호출한다.',
      '한 번의 클릭으로 여러 자식 UI가 같은 값으로 함께 바뀐다.',
      '부모 state 하나가 여러 자식을 동시에 제어하는 장면을 발표에서 보여 줄 수 있다.',
    ],
    hint: '버튼이 값을 직접 들고 있을 필요는 없습니다. 부모가 가진 setter를 함수로 내려주는 쪽이 더 자연스럽습니다.',
  },
];

export const STATE_PRACTICE = {
  starterCode: `function TemperatureInput(props) {
  const [value, setValue] = useState('');

  return h('label', null,
    props.label,
    h('input', {
      value: value,
      oninput: (event) => setValue(event.target.value),
    })
  );
}

function ResultCard(props) {
  return h('p', null, '현재 온도: ' + props.value);
}

function App() {
  return h('section', null,
    h(TemperatureInput, { label: '섭씨' }),
    h(ResultCard, { value: '(아직 부모와 연결되지 않았습니다.)' })
  );
}

return App;`,
};

// 섹션 3 전체를 조립하는 공개 함수다.
// state를 어디에 두는지가 핵심이므로,
// 설명 카드와 절차 카드, 예제 코드를 순서대로 배치했다.
export function createStateSection() {
  const section = document.createElement('section');
  section.id = 'state-section';
  section.className = 'panel-card learning-section';

  section.appendChild(createHeader(
    '3. State 위치 올리기',
    '여러 컴포넌트가 같은 데이터를 같이 써야 할 때 상태를 어디에 두면 좋은지 배우는 섹션입니다.',
  ));

  section.appendChild(createParagraphCard(
    '핵심 개념',
    STATE_CORE_EXPLANATION,
  ));
  section.appendChild(createParagraphCard('왜 부모가 state를 가져야 할까', STATE_IMPORTANCE_EXPLANATION));
  section.appendChild(createListCard('실행 순서', LIFTING_STEPS));
  section.appendChild(createCodeCard('온도 변환기 예제 스텁', TEMPERATURE_EXAMPLE));
  section.appendChild(createPracticePlaygroundCard({
    title: '직접 해보기',
    fileName: 'LiftingStatePractice.js',
    description: '입력창은 바뀌지만 아래 카드가 아직 같이 안 바뀝니다. state를 App으로 올려서 두 컴포넌트가 같은 값을 보게 만들어 보세요.',
    initialCode: STATE_PRACTICE.starterCode,
  }));
  for (const [index, challenge] of STATE_CHALLENGES.entries()) {
    section.appendChild(createChallengeToggle({
      number: index + 1,
      ...challenge,
    }));
  }

  return section;
}

// 제목(h2)과 설명(p)을 묶어 섹션 상단 헤더를 만든다.
function createHeader(title, description) {
  const wrapper = document.createElement('div');
  const heading = document.createElement('h2');
  const paragraph = document.createElement('p');

  heading.textContent = title;
  paragraph.textContent = description;
  wrapper.append(heading, paragraph);

  return wrapper;
}

// 설명 중심 카드 helper다.
function createParagraphCard(title, text) {
  const article = createCardShell(title);
  const paragraph = document.createElement('p');

  paragraph.textContent = text;
  article.appendChild(paragraph);

  return article;
}

// 순서가 중요한 개념이라 ordered list를 사용했다.
// 학생이 1단계부터 따라 읽게 만드는 의도가 있다.
function createListCard(title, items) {
  const article = createCardShell(title);
  const list = document.createElement('ol');

  for (const item of items) {
    const li = document.createElement('li');
    li.textContent = item;
    list.appendChild(li);
  }

  article.appendChild(list);
  return article;
}

// 읽는 예제 코드를 보여주는 helper다.
function createCodeCard(title, code) {
  const article = createCardShell(title);
  const pre = document.createElement('pre');
  const codeEl = document.createElement('code');

  codeEl.textContent = code;
  pre.appendChild(codeEl);
  article.appendChild(pre);

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
