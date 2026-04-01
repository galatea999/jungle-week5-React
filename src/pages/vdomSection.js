// ============================================================
// vdomSection.js — 섹션 4 학습 콘텐츠
// ============================================================
//
// 이 파일은 "state가 바뀌면 내부에서 어떤 일이 일어나는가?"를
// 순서대로 보여 주는 Virtual DOM 섹션을 만든다.
//
// 이 섹션의 핵심은 화려한 결과보다 "파이프라인을 눈으로 정리하는 것"이다.
// 실제 diff 결과 시각화는 나중에 diffVisualizer.js와 연결할 예정이고,
// 지금은 그 자리를 이해하기 쉽게 준비해 두는 단계다.
// ============================================================

// 학생이 setState 이후의 흐름을 한 줄씩 따라가도록 만든 파이프라인 목록이다.
// 이 순서는 project-plan의 핵심 개념과도 맞물린다.
const PIPELINE = [
  'setState가 호출된다.',
  '컴포넌트 함수가 다시 실행된다.',
  '새 Virtual DOM 트리가 만들어진다.',
  '이전 트리와 새 트리를 diff로 비교한다.',
  'patch를 실제 DOM에 적용한다.',
];

// 이 예시는 학생이 "무엇이 바뀌고 무엇이 그대로 남는가"를 눈으로 비교하게 만들기 위한 샘플이다.
// 실제 diffVisualizer가 붙기 전에도 patch를 예상하는 연습을 할 수 있다.
const BEFORE_TREE_EXAMPLE = `h('ul', null,
  h('li', null, 'React'),
  h('li', null, 'Hooks')
)`;

const AFTER_TREE_EXAMPLE = `h('ul', null,
  h('li', null, 'React'),
  h('li', null, 'Hooks!'),
  h('li', null, 'Virtual DOM')
)`;

const VDOM_CHALLENGE = {
  title: '챌린지: 어떤 patch가 필요할까?',
  goal: '이전 트리와 다음 트리를 비교해 어떤 patch가 필요한지 순서대로 예상해 보세요.',
  tasks: [
    '어떤 노드는 그대로 재사용되고, 어떤 노드만 바뀌는지 먼저 표시한다.',
    '두 번째 li에서 어떤 TEXT 변화가 생기는지 설명한다.',
    '세 번째 li가 새로 생길 때 어떤 CREATE 성격의 patch가 필요할지 예상한다.',
    '왜 루트 ul 전체를 다시 만들 필요는 없는지 한 문장으로 설명한다.',
  ],
  success: [
    '두 번째 항목의 텍스트만 바뀐다는 점을 잡아낸다.',
    '세 번째 항목이 새로 추가된다는 점을 잡아낸다.',
    '전체 트리를 통째로 교체하는 대신 필요한 부분만 업데이트한다는 개념을 설명할 수 있다.',
  ],
  hint: '루트에서부터 같은 태그끼리 차례대로 비교하고, 바뀐 텍스트와 새로 생긴 노드를 따로 생각해 보세요.',
};

// 섹션 4 전체를 조립하는 공개 함수다.
// 현재는 "설명 가능한 자리"를 먼저 만드는 것이 목적이라
// 실제 시각화 대신 placeholder 패널을 배치한다.
export function createVdomSection() {
  const section = document.createElement('section');
  section.id = 'vdom-section';
  section.className = 'panel-card learning-section';

  section.appendChild(createHeader(
    '4. Virtual DOM이 하는 일',
    '보이지 않는 내부 작업을 눈에 보이게 설명하는 시각화 섹션의 스텁입니다.',
  ));

  section.appendChild(createPipelineCard());
  section.appendChild(createCodeCard('챌린지 예시: 이전 트리', BEFORE_TREE_EXAMPLE));
  section.appendChild(createCodeCard('챌린지 예시: 다음 트리', AFTER_TREE_EXAMPLE));
  section.appendChild(createPlaceholderPanel(
    '이전 VDOM / 다음 VDOM 패널',
    '나중에는 diffVisualizer.js를 붙여서 이전 트리와 다음 트리를 나란히 보여줄 예정입니다.',
  ));
  section.appendChild(createPlaceholderPanel(
    'Patch 목록 패널',
    '나중에는 CREATE, REMOVE, TEXT, PROPS 같은 patch가 어떤 순서로 나오는지 카드 형태로 보여줄 예정입니다.',
  ));
  section.appendChild(createChallengeCard(VDOM_CHALLENGE));

  return section;
}

// 섹션 제목 블록 helper다.
function createHeader(title, description) {
  const wrapper = document.createElement('div');
  const heading = document.createElement('h2');
  const paragraph = document.createElement('p');

  heading.textContent = title;
  paragraph.textContent = description;
  wrapper.append(heading, paragraph);

  return wrapper;
}

// Virtual DOM 흐름을 ordered list로 보여주는 카드다.
// 학생이 "어느 단계가 먼저인지"를 분명히 보게 하려는 의도다.
function createPipelineCard() {
  const article = createCardShell('렌더링 파이프라인');
  const list = document.createElement('ol');

  for (const step of PIPELINE) {
    const li = document.createElement('li');
    li.textContent = step;
    list.appendChild(li);
  }

  article.appendChild(list);
  return article;
}

// 이전/다음 트리 예시처럼 읽는 코드 조각을 보여 주는 helper다.
function createCodeCard(title, code) {
  const article = createCardShell(title);
  const pre = document.createElement('pre');
  const codeEl = document.createElement('code');

  codeEl.textContent = code;
  pre.appendChild(codeEl);
  article.appendChild(pre);

  return article;
}

// 아직 구현되지 않은 시각화 영역을 설명과 함께 보여 주는 helper다.
// placeholder.className을 미리 넣어 둔 이유는
// B 역할이 CSS나 렌더링 컴포넌트를 붙일 때 같은 자리를 재사용하기 위해서다.
function createPlaceholderPanel(title, text) {
  const article = createCardShell(title);
  const paragraph = document.createElement('p');
  const placeholder = document.createElement('div');

  paragraph.textContent = `[STUB] ${text}`;
  placeholder.className = 'panel';
  placeholder.textContent = '시각화 패널이 나중에 이곳에 렌더링됩니다.';

  article.append(paragraph, placeholder);
  return article;
}

// patch 예측 문제를 실제 과제 카드처럼 보여 주는 helper다.
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
