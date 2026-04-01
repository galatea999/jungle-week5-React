// ============================================================
// contentBlocks.js — 학습 페이지에서 재사용하는 UI 블록 모음
// ============================================================
//
// 같은 모양의 박스를 여러 섹션에서 반복해서 쓰면
// 코드를 매번 새로 짜지 않아도 된다.
// 그래서 이 파일은 "레고 블록 상자"처럼
// 공통으로 쓰는 UI 조각을 모아 둔 파일이다.
// ============================================================

// ------------------------------------------------------------
// createYouWillLearn(items)
// ------------------------------------------------------------
// "이번 섹션에서 배울 것" 박스를 만든다.
// 학습자가 이 섹션에서 무엇을 챙겨가야 하는지 먼저 보여 줄 때 쓴다.
// ------------------------------------------------------------
export function createYouWillLearn(items = []) {
  // 바깥 상자를 만든다.
  const box = document.createElement('section');
  // CSS에서 파란 안내 박스로 꾸미기 위한 클래스다.
  box.className = 'you-will-learn';

  // 제목을 만든다.
  const heading = document.createElement('h3');
  // 제목 문구는 고정이다.
  heading.textContent = '이번 섹션에서 배울 것';

  // 항목들을 담을 목록을 만든다.
  const list = document.createElement('ul');

  // items 배열을 하나씩 꺼내 목록 줄을 만든다.
  for (const item of items) {
    // 목록 한 줄을 만든다.
    const li = document.createElement('li');
    // 줄 안에 실제 학습 목표 문장을 넣는다.
    li.textContent = item;
    // 목록에 줄을 추가한다.
    list.appendChild(li);
  }

  // 제목과 목록을 바깥 상자 안에 넣는다.
  box.append(heading, list);

  // 완성된 박스를 반환한다.
  return box;
}

// ------------------------------------------------------------
// createNote(content)
// ------------------------------------------------------------
// 중요한 팁이나 꼭 기억할 내용을 보여 주는 노란 박스를 만든다.
// ------------------------------------------------------------
export function createNote(content) {
  // 바깥 상자를 만든다.
  const box = document.createElement('aside');
  // CSS에서 note 모양을 주기 위한 클래스다.
  box.className = 'note-block';

  // 왼쪽 아이콘 자리를 만든다.
  const icon = document.createElement('span');
  // 아이콘에 전구 모양을 넣어 "팁" 느낌을 준다.
  icon.textContent = '💡';
  // 아이콘에도 클래스 이름을 붙여 둔다.
  icon.className = 'note-icon';

  // 실제 내용을 담을 영역을 만든다.
  const body = document.createElement('div');
  // CSS에서 글 배치를 따로 조정하기 위한 클래스다.
  body.className = 'note-content';

  // 문자열이든 DOM 노드든 body 안에 안전하게 넣는다.
  appendContent(body, content);

  // 아이콘과 내용을 한 상자 안에 넣는다.
  box.append(icon, body);

  // 완성된 note 박스를 돌려준다.
  return box;
}

// ------------------------------------------------------------
// createDeepDive(title, content)
// ------------------------------------------------------------
// "더 알아보기" 접기/펼치기 박스를 만든다.
// 기본적으로는 닫혀 있고, 궁금한 사람만 열어 볼 수 있다.
// ------------------------------------------------------------
export function createDeepDive(title, content) {
  // details는 브라우저가 기본 접기/펼치기 동작을 제공하는 태그다.
  const details = document.createElement('details');
  // CSS에서 심화 박스처럼 꾸미기 위한 클래스다.
  details.className = 'deep-dive';

  // 클릭 가능한 제목 줄을 만든다.
  const summary = document.createElement('summary');
  // 제목 앞에 돋보기 느낌의 텍스트를 함께 넣는다.
  summary.textContent = `더 알아보기: ${title}`;

  // 펼쳤을 때 나오는 내용을 담을 상자를 만든다.
  const body = document.createElement('div');
  // CSS에서 안쪽 여백을 조절하기 위한 클래스다.
  body.className = 'deep-dive-content';

  // 실제 내용을 안쪽 상자에 넣는다.
  appendContent(body, content);

  // 제목 줄과 본문을 details 안에 넣는다.
  details.append(summary, body);

  // 완성된 박스를 반환한다.
  return details;
}

// ------------------------------------------------------------
// createChallenge(options)
// ------------------------------------------------------------
// 학습자가 직접 풀어보는 도전 과제 박스를 만든다.
//
// hint와 solution은 버튼으로 숨겼다 펼칠 수 있게 만든다.
// ------------------------------------------------------------
export function createChallenge(options = {}) {
  // 옵션이 비어 있어도 기본값으로 안전하게 동작하도록 준비한다.
  const {
    number = 1,
    title = '새 도전 과제',
    description = '과제 설명이 아직 준비되지 않았습니다.',
    hint = '',
    solution = '',
  } = options;

  // 바깥 상자를 만든다.
  const box = document.createElement('section');
  // CSS에서 챌린지 카드 모양을 주기 위한 클래스다.
  box.className = 'challenge-block';

  // 과제 제목을 만든다.
  const heading = document.createElement('h4');
  // 번호와 제목을 같이 보여 준다.
  heading.textContent = `도전 ${number}. ${title}`;

  // 과제 설명을 담을 문단을 만든다.
  const body = document.createElement('p');
  // 설명 텍스트를 바로 넣는다.
  body.textContent = description;

  // 버튼들을 한 줄에 모아 두는 상자를 만든다.
  const actions = document.createElement('div');
  // CSS에서 버튼 간격을 잡기 위한 클래스다.
  actions.className = 'challenge-actions';

  // 힌트 토글 버튼을 만든다.
  const hintButton = document.createElement('button');
  // 버튼 글자를 지정한다.
  hintButton.textContent = hint ? '힌트 보기' : '힌트 없음';
  // 힌트가 없으면 누를 수 없게 막는다.
  hintButton.disabled = !hint;

  // 힌트 내용을 담을 상자를 만든다.
  const hintBox = document.createElement('div');
  // CSS에서 힌트 박스 모양을 주기 위한 클래스다.
  hintBox.className = 'challenge-panel';
  // 처음에는 숨겨 둔다.
  hintBox.hidden = true;
  // 힌트 내용을 넣는다.
  appendContent(hintBox, hint || '힌트가 아직 준비되지 않았습니다.');

  // 정답 토글 버튼을 만든다.
  const solutionButton = document.createElement('button');
  // 버튼 글자를 지정한다.
  solutionButton.textContent = solution ? '정답 보기' : '정답 없음';
  // 정답이 없으면 버튼을 막아 둔다.
  solutionButton.disabled = !solution;

  // 정답 내용을 담을 상자를 만든다.
  const solutionBox = document.createElement('div');
  // CSS에서 정답 박스 모양을 주기 위한 클래스다.
  solutionBox.className = 'challenge-panel';
  // 처음에는 정답도 숨긴다.
  solutionBox.hidden = true;

  // 정답은 코드일 수 있으니 code block 형태로 담는 편이 보기 쉽다.
  if (solution) {
    // 정답 코드 박스를 만들어 안에 넣는다.
    solutionBox.appendChild(createCodeBlock(solution));
  } else {
    // 정답이 없으면 안내 문장만 넣는다.
    solutionBox.textContent = '정답이 아직 준비되지 않았습니다.';
  }

  // 힌트 버튼을 누르면 힌트 박스가 열리고 닫히게 연결한다.
  hintButton.addEventListener('click', () => {
    // 현재 숨김 상태를 반대로 바꾼다.
    hintBox.hidden = !hintBox.hidden;
    // 버튼 글자도 상태에 맞게 바꿔 준다.
    hintButton.textContent = hintBox.hidden ? '힌트 보기' : '힌트 숨기기';
  });

  // 정답 버튼도 같은 방식으로 토글한다.
  solutionButton.addEventListener('click', () => {
    // 현재 숨김 상태를 반대로 바꾼다.
    solutionBox.hidden = !solutionBox.hidden;
    // 버튼 글자도 상태에 맞게 바꾼다.
    solutionButton.textContent = solutionBox.hidden ? '정답 보기' : '정답 숨기기';
  });

  // 버튼 줄 안에 두 버튼을 넣는다.
  actions.append(hintButton, solutionButton);
  // 바깥 상자 안에 제목, 설명, 버튼 줄, 힌트, 정답을 차례대로 넣는다.
  box.append(heading, body, actions, hintBox, solutionBox);

  // 완성된 challenge 박스를 반환한다.
  return box;
}

// ------------------------------------------------------------
// createSectionHeader(title, subtitle)
// ------------------------------------------------------------
// 각 섹션의 제목과 부제목을 만드는 공통 블록이다.
// ------------------------------------------------------------
export function createSectionHeader(title, subtitle = '') {
  // 바깥 상자를 만든다.
  const wrapper = document.createElement('div');
  // CSS에서 섹션 머리말처럼 보이게 하는 클래스다.
  wrapper.className = 'section-header';

  // 큰 제목을 만든다.
  const heading = document.createElement('h2');
  // 제목 글자를 넣는다.
  heading.textContent = title;

  // 부제목 문단을 만든다.
  const text = document.createElement('p');
  // CSS에서 부제목 느낌을 주기 위한 클래스다.
  text.className = 'section-subtitle';
  // 부제목 글자를 넣는다.
  text.textContent = subtitle;

  // 제목과 부제목을 한 묶음으로 붙인다.
  wrapper.append(heading, text);

  // 완성된 머리말 블록을 반환한다.
  return wrapper;
}

// ------------------------------------------------------------
// createParagraph(text)
// ------------------------------------------------------------
// 일반 본문 문단을 만든다.
// 문장 안의 `코드` 표시는 <code> 태그로 바꿔 준다.
// ------------------------------------------------------------
export function createParagraph(text = '') {
  // 문단 태그를 만든다.
  const paragraph = document.createElement('p');

  // 코드 표시와 일반 글자를 나눠 처리하기 위한 조각 배열을 만든다.
  const tokens = String(text).split(/(`[^`]*`)/g);

  // 조각을 하나씩 살펴본다.
  for (const token of tokens) {
    // token이 비어 있으면 아무것도 넣지 않는다.
    if (!token) continue;

    // backtick으로 감싼 조각이면 code 태그로 만든다.
    if (token.startsWith('`') && token.endsWith('`')) {
      // 코드 조각용 태그를 만든다.
      const code = document.createElement('code');
      // 양쪽 backtick은 떼고 실제 글자만 넣는다.
      code.textContent = token.slice(1, -1);
      // 문단 안에 코드 조각을 붙인다.
      paragraph.appendChild(code);
      // 이 token 처리는 끝났으니 다음으로 넘어간다.
      continue;
    }

    // 일반 글자는 텍스트 노드로 그대로 넣는다.
    paragraph.appendChild(document.createTextNode(token));
  }

  // 완성된 문단을 반환한다.
  return paragraph;
}

// ------------------------------------------------------------
// createCodeBlock(code, language)
// ------------------------------------------------------------
// 읽기 전용 코드 박스를 만든다.
// ------------------------------------------------------------
export function createCodeBlock(code, language = 'js') {
  // 바깥 pre 태그를 만든다.
  const pre = document.createElement('pre');
  // CSS에서 코드 박스처럼 꾸밀 수 있게 클래스 이름을 준다.
  pre.className = 'code-block';
  // 어떤 언어 코드인지 data 속성으로 남겨 둔다.
  pre.dataset.language = language;

  // 실제 코드 글자를 넣을 code 태그를 만든다.
  const codeEl = document.createElement('code');
  // 코드 문자열을 그대로 넣는다.
  codeEl.textContent = String(code);

  // code 태그를 pre 안에 넣는다.
  pre.appendChild(codeEl);

  // 완성된 코드 박스를 반환한다.
  return pre;
}

// ------------------------------------------------------------
// createChallengeToggle(options)
// ------------------------------------------------------------
// 챌린지를 기본적으로 접어 두는 토글 블록이다.
// 문제가 많아질수록 한 번에 다 펼쳐지지 않게 만드는 데 유용하다.
// ------------------------------------------------------------
export function createChallengeToggle(options = {}) {
  const {
    number = 1,
    title = '',
    goal = '',
    tasks = [],
    success = [],
    hint = '',
  } = options;

  const details = document.createElement('details');
  const summary = document.createElement('summary');
  const body = document.createElement('div');

  details.className = 'learning-subsection challenge-toggle';
  summary.className = 'challenge-toggle-summary';
  body.className = 'challenge-toggle-body';
  summary.textContent = `챌린지 ${number}`;

  if (title) {
    body.appendChild(createChallengeTextBlock('문제 초점', title));
  }

  body.appendChild(createChallengeTextBlock('문제 목표', goal));
  body.appendChild(createChallengeListBlock('학생이 해야 할 일', tasks));
  body.appendChild(createChallengeListBlock('성공 기준', success));
  body.appendChild(createChallengeTextBlock('힌트', hint));

  details.append(summary, body);
  return details;
}

// ------------------------------------------------------------
// createRecap(items)
// ------------------------------------------------------------
// 섹션 마지막에 쓰는 "요약 정리" 박스를 만든다.
// ------------------------------------------------------------
export function createRecap(items = []) {
  // 바깥 상자를 만든다.
  const box = document.createElement('section');
  // CSS에서 recap 카드 모양을 주기 위한 클래스다.
  box.className = 'recap-block';

  // 제목을 만든다.
  const heading = document.createElement('h3');
  // 제목 문구를 정한다.
  heading.textContent = '요약 정리';

  // 요약 목록을 담을 ul을 만든다.
  const list = document.createElement('ul');

  // 요약 문장을 하나씩 목록 줄로 만든다.
  for (const item of items) {
    // 목록 한 줄을 만든다.
    const li = document.createElement('li');
    // 줄에 실제 요약 문장을 넣는다.
    li.textContent = item;
    // 목록 안에 추가한다.
    list.appendChild(li);
  }

  // 제목과 목록을 상자 안에 넣는다.
  box.append(heading, list);

  // 완성된 recap 박스를 반환한다.
  return box;
}

// ------------------------------------------------------------
// appendContent(target, content)
// ------------------------------------------------------------
// 문자열이든 DOM 노드든 한 함수로 안전하게 넣기 위한 도우미다.
// ------------------------------------------------------------
function appendContent(target, content) {
  // content가 이미 DOM 노드면 그대로 붙인다.
  if (content instanceof Node) {
    // 만들어 둔 DOM 구조를 그대로 살릴 수 있다.
    target.appendChild(content);
    // 이 경우 처리가 끝났으니 바로 종료한다.
    return;
  }

  // 문자열이나 숫자는 글자로 바꿔서 넣는다.
  target.textContent = String(content ?? '');
}

function createChallengeTextBlock(title, text) {
  const wrapper = document.createElement('div');
  const heading = document.createElement('h4');
  const paragraph = document.createElement('p');

  heading.textContent = title;
  paragraph.textContent = String(text ?? '');
  wrapper.append(heading, paragraph);

  return wrapper;
}

function createChallengeListBlock(title, items = []) {
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
