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

// 학생이 개념을 절차로 이해하도록 돕는 단계 목록이다.
// 단순 설명만 주면 추상적으로 끝날 수 있어서,
// 실제로 state를 올릴 때 밟는 순서를 문장으로 적어 두었다.
const LIFTING_STEPS = [
  '둘 이상의 자식이 같은 값을 써야 하는지 먼저 확인한다.',
  '같이 써야 한다면 그 값을 부모 컴포넌트로 올린다.',
  '부모가 props로 값을 내려주고, 변경 함수도 함께 내려준다.',
];

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
    '형제 컴포넌트끼리는 직접 대화하지 않고, 부모를 통해 같은 데이터를 나눠 갖는 것이 더 안전합니다. 그래서 state를 부모 쪽으로 올리는 패턴을 자주 씁니다.',
  ));
  section.appendChild(createListCard('실행 순서', LIFTING_STEPS));
  section.appendChild(createCodeCard('온도 변환기 예제 스텁', TEMPERATURE_EXAMPLE));
  section.appendChild(createParagraphCard(
    '나중에 붙일 기능',
    '[STUB] 한쪽 입력창을 바꾸면 다른 카드와 결과 카드가 함께 바뀌는 데모를 붙일 예정입니다.',
  ));

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
