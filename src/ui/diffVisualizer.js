// ============================================================
// diffVisualizer.js — Virtual DOM 차이를 눈으로 보여 주는 파일
// ============================================================
//
// 학습자가 "무엇이 바뀌었는지"를 바로 이해하려면
// old tree, new tree, patch 목록이 같이 보여야 한다.
// 이 파일은 그 세 가지를 한 화면에서 보여 주는 도구를 만든다.
// ============================================================

// 실제 diff 알고리즘은 기존 모듈을 그대로 재사용한다.
import { diff } from '../diff/diff.js';

// ------------------------------------------------------------
// createDiffVisualizer()
// ------------------------------------------------------------
// diff 결과를 보여 주는 패널 전체를 만든다.
// ------------------------------------------------------------
export function createDiffVisualizer() {
  // 전체 바깥 상자를 만든다.
  const element = document.createElement('section');
  // CSS에서 카드처럼 꾸미기 위한 클래스다.
  element.className = 'panel-card diff-visualizer';

  // 패널 전체 제목을 만든다.
  const heading = document.createElement('h3');
  // 제목 문구를 넣는다.
  heading.textContent = 'Virtual DOM Diff 시각화';

  // 설명 문단을 만든다.
  const intro = document.createElement('p');
  // 사용자가 이 패널의 목적을 바로 이해할 수 있게 설명한다.
  intro.textContent = '왼쪽은 이전 트리, 오른쪽은 새 트리, 아래는 diff가 만든 patch 목록입니다.';

  // 두 트리를 나란히 둘 그리드를 만든다.
  const grid = document.createElement('div');
  // CSS에서 2열 레이아웃을 줄 클래스다.
  grid.className = 'diff-grid';

  // 이전 트리를 담을 카드 하나를 만든다.
  const oldCard = createTreeCard('이전 VDOM');
  // 새 트리를 담을 카드 하나를 만든다.
  const newCard = createTreeCard('새 VDOM');

  // 두 카드 모두 grid 안에 넣는다.
  grid.append(oldCard.card, newCard.card);

  // patch 목록을 담을 카드도 만든다.
  const patchCard = document.createElement('section');
  // CSS에서 패치 카드처럼 꾸미기 위한 클래스다.
  patchCard.className = 'diff-patches';

  // patch 카드 제목을 만든다.
  const patchHeading = document.createElement('h4');
  // 제목 문구를 넣는다.
  patchHeading.textContent = 'Patch 목록';

  // patch 목록이 실제로 들어갈 상자를 만든다.
  const patchBody = document.createElement('div');
  // CSS에서 목록 상자처럼 꾸미기 위한 클래스다.
  patchBody.className = 'diff-patch-list';

  // 처음에는 안내 문구를 보여 준다.
  patchBody.textContent = 'old VDOM과 new VDOM을 비교하면 patch 목록이 이곳에 표시됩니다.';

  // patch 카드 안에 제목과 목록 상자를 넣는다.
  patchCard.append(patchHeading, patchBody);

  // 전체 패널 안에는 제목, 소개, 두 트리, 패치 목록을 넣는다.
  element.append(heading, intro, grid, patchCard);

  // 두 트리를 실제로 보여 주는 함수다.
  const showDiff = (oldVdom, newVdom) => {
    // 기존 diff 모듈로 patch 목록을 계산한다.
    const patches = diff(oldVdom, newVdom);

    // 이전 트리를 시각화한 DOM을 만든다.
    const oldTree = renderTree(oldVdom);
    // 새 트리를 시각화한 DOM을 만든다.
    const newTree = renderTree(newVdom);

    // 이전 카드 몸통을 새 트리 DOM으로 교체한다.
    oldCard.body.replaceChildren(oldTree);
    // 새 카드 몸통도 새 DOM으로 교체한다.
    newCard.body.replaceChildren(newTree);

    // patch 목록도 사람이 읽기 쉬운 DOM으로 교체한다.
    patchBody.replaceChildren(renderPatchList(patches));

    // 이전 트리에서도 변경된 노드에 표시를 준다.
    highlightChangedNodes(oldTree, patches);
    // 새 트리에서도 변경된 노드에 표시를 준다.
    highlightChangedNodes(newTree, patches);

    // 계산된 patch 배열을 호출한 쪽에 돌려준다.
    return patches;
  };

  // 내용을 초기 상태로 되돌리는 함수다.
  const clear = () => {
    // 이전 트리 칸을 초기 문구로 바꾼다.
    oldCard.body.textContent = '이전 VDOM이 아직 없습니다.';
    // 새 트리 칸도 초기 문구로 바꾼다.
    newCard.body.textContent = '새 VDOM이 아직 없습니다.';
    // patch 목록도 초기 문구로 되돌린다.
    patchBody.textContent = 'old VDOM과 new VDOM을 비교하면 patch 목록이 이곳에 표시됩니다.';
  };

  // 밖에서 쓸 수 있게 주요 값과 함수들을 반환한다.
  return {
    // 완성된 전체 패널 DOM이다.
    element,
    // 비교를 실제로 그리는 함수다.
    showDiff,
    // 초기화 함수다.
    clear,
  };
}

// ------------------------------------------------------------
// renderTree(vnode, depth, path)
// ------------------------------------------------------------
// VDOM 트리를 사람이 읽을 수 있는 줄 형태로 바꾼다.
// ------------------------------------------------------------
function renderTree(vnode, depth = 0, path = []) {
  // 전체 트리 한 덩어리를 감쌀 상자를 만든다.
  const wrapper = document.createElement('div');
  // CSS에서 트리 모양을 주는 클래스다.
  wrapper.className = 'vdom-tree';

  // 실제 한 줄 한 줄을 채우는 재귀 함수를 호출한다.
  appendTreeRow(wrapper, vnode, depth, path);

  // 완성된 트리 DOM을 반환한다.
  return wrapper;
}

// ------------------------------------------------------------
// appendTreeRow(wrapper, vnode, depth, path)
// ------------------------------------------------------------
// 현재 노드 한 줄을 만들고, 자식이 있으면 아래로 재귀 호출한다.
// ------------------------------------------------------------
function appendTreeRow(wrapper, vnode, depth, path) {
  // vnode가 없으면 "빈 노드" 안내 줄을 만든다.
  if (!vnode) {
    // 한 줄을 담을 div를 만든다.
    const emptyRow = document.createElement('div');
    // CSS에서 트리 줄처럼 보이게 하는 클래스다.
    emptyRow.className = 'vdom-tree-row';
    // 깊이에 맞게 왼쪽 여백을 준다.
    emptyRow.style.paddingLeft = `${depth * 20}px`;
    // 경로가 없으면 root로 표시한다.
    emptyRow.dataset.path = pathToKey(path);
    // 빈 노드 문구를 넣는다.
    emptyRow.textContent = 'null';
    // wrapper 안에 이 줄을 추가한다.
    wrapper.appendChild(emptyRow);
    // 더 내려갈 자식이 없으니 종료한다.
    return;
  }

  // 현재 노드 한 줄을 담을 div를 만든다.
  const row = document.createElement('div');
  // CSS에서 줄 모양을 꾸밀 클래스다.
  row.className = 'vdom-tree-row';
  // 깊이에 비례해 왼쪽 여백을 준다.
  row.style.paddingLeft = `${depth * 20}px`;
  // 나중에 patch path와 연결할 수 있게 data-path를 저장한다.
  row.dataset.path = pathToKey(path);
  // 현재 줄에 보여 줄 텍스트를 만든다.
  row.textContent = describeVNode(vnode);
  // wrapper 안에 현재 줄을 넣는다.
  wrapper.appendChild(row);

  // 텍스트 노드는 자식이 없으므로 여기서 끝낸다.
  if (vnode.type === 'text') {
    return;
  }

  // element 노드면 자식 배열을 순서대로 내려간다.
  if (Array.isArray(vnode.children)) {
    // 자식과 인덱스를 함께 가져와 path를 이어 붙인다.
    vnode.children.forEach((child, index) => {
      // 자식 줄을 현재보다 한 단계 들여쓰기해서 추가한다.
      appendTreeRow(wrapper, child, depth + 1, [...path, index]);
    });
  }
}

// ------------------------------------------------------------
// renderPatchList(patches)
// ------------------------------------------------------------
// patch 배열을 사람이 읽기 쉬운 목록 DOM으로 바꾼다.
// ------------------------------------------------------------
function renderPatchList(patches) {
  // patch가 없을 때 보여 줄 안내 박스를 먼저 처리한다.
  if (!patches.length) {
    // 빈 상태를 담을 div를 만든다.
    const empty = document.createElement('div');
    // CSS에서 조용한 안내 문구처럼 보이게 할 클래스다.
    empty.className = 'diff-empty';
    // 변경 사항이 없다는 뜻을 보여 준다.
    empty.textContent = '변경 사항이 없습니다. 즉, old VDOM과 new VDOM이 같습니다.';
    // 빈 상태 DOM을 반환한다.
    return empty;
  }

  // 실제 patch 줄들을 담을 목록을 만든다.
  const list = document.createElement('ul');
  // CSS에서 patch 목록처럼 꾸미기 위한 클래스다.
  list.className = 'patch-list';

  // patch를 하나씩 읽어 사람이 읽을 문장으로 바꾼다.
  for (const patch of patches) {
    // 목록 한 줄을 만든다.
    const item = document.createElement('li');
    // CSS에서 패치 한 줄처럼 꾸미기 위한 클래스다.
    item.className = 'patch-item';
    // 타입에 맞는 아이콘과 설명을 합쳐 문장으로 만든다.
    item.textContent = `${getPatchIcon(patch.type)} ${describePatch(patch)}`;
    // 목록에 현재 줄을 추가한다.
    list.appendChild(item);
  }

  // 완성된 목록을 반환한다.
  return list;
}

// ------------------------------------------------------------
// highlightChangedNodes(treeElement, patches)
// ------------------------------------------------------------
// patch가 가리키는 경로에 맞춰 트리 안의 줄에 강조 클래스를 붙인다.
// ------------------------------------------------------------
function highlightChangedNodes(treeElement, patches) {
  // patch를 하나씩 살펴본다.
  for (const patch of patches) {
    // patch path를 data-path 형식의 문자열로 바꾼다.
    const pathKey = pathToKey(patch.path);
    // 같은 path를 가진 줄을 tree 안에서 찾는다.
    const target = treeElement.querySelector(`[data-path="${pathKey}"]`);

    // CREATE처럼 old tree에는 없는 경우가 있으니 못 찾으면 건너뛴다.
    if (!target) continue;

    // 모든 patch 줄에 공통 강조 클래스를 붙인다.
    target.classList.add('is-changed');

    // patch 타입에 따라 다른 색을 주기 위해 세부 클래스도 붙인다.
    target.classList.add(`patch-${String(patch.type).toLowerCase()}`);
  }
}

// ------------------------------------------------------------
// createTreeCard(title)
// ------------------------------------------------------------
// 이전 트리 카드, 새 트리 카드처럼 비슷한 상자를 쉽게 만들기 위한 helper다.
// ------------------------------------------------------------
function createTreeCard(title) {
  // 카드 바깥 상자를 만든다.
  const card = document.createElement('section');
  // CSS에서 트리 카드처럼 꾸미기 위한 클래스다.
  card.className = 'diff-tree-card';

  // 카드 제목을 만든다.
  const heading = document.createElement('h4');
  // 제목 문구를 넣는다.
  heading.textContent = title;

  // 실제 트리 내용이 들어갈 몸통 상자를 만든다.
  const body = document.createElement('div');
  // CSS에서 트리 내용 영역처럼 꾸미기 위한 클래스다.
  body.className = 'diff-tree-body';
  // 시작 상태 안내 문구를 넣는다.
  body.textContent = `${title}가 아직 없습니다.`;

  // 제목과 몸통을 카드 안에 넣는다.
  card.append(heading, body);

  // 카드와 body 참조를 함께 돌려준다.
  return { card, body };
}

// ------------------------------------------------------------
// describeVNode(vnode)
// ------------------------------------------------------------
// 현재 vnode 한 줄을 사람이 읽기 쉬운 텍스트로 바꾼다.
// ------------------------------------------------------------
function describeVNode(vnode) {
  // text 노드면 따옴표 안에 실제 문자열을 보여 준다.
  if (vnode.type === 'text') {
    // 긴 글도 한눈에 보이게 따옴표를 붙여 준다.
    return `"${vnode.text}"`;
  }

  // element 노드는 태그 이름부터 보여 준다.
  let label = `<${vnode.tag}>`;

  // class 속성이 있으면 옆에 함께 보여 준다.
  if (vnode.props?.class) {
    // class 정보도 같이 붙이면 스타일 변화도 보기 쉽다.
    label += ` .${vnode.props.class}`;
  }

  // key가 있으면 리스트 추적용 key도 함께 보여 준다.
  if (vnode.key != null) {
    // key 값도 학습자가 볼 수 있게 문자열 뒤에 덧붙인다.
    label += ` key=${vnode.key}`;
  }

  // 완성된 한 줄 설명을 반환한다.
  return label;
}

// ------------------------------------------------------------
// describePatch(patch)
// ------------------------------------------------------------
// patch 객체 하나를 사람이 읽기 쉬운 문장으로 바꾼다.
// ------------------------------------------------------------
function describePatch(patch) {
  // path는 배열 그대로보다 "0.1.2" 형태가 더 읽기 쉽다.
  const pathText = `[${patch.path.join(',')}]`;

  // patch 타입마다 설명 문장을 조금 다르게 만든다.
  switch (patch.type) {
    // 새 노드 생성은 어떤 위치에 생겼는지 보여 주면 된다.
    case 'CREATE':
      return `CREATE path:${pathText} 에 새 노드가 추가됩니다.`;
    // 삭제는 해당 path가 사라진다고 설명한다.
    case 'REMOVE':
      return `REMOVE path:${pathText} 의 노드가 제거됩니다.`;
    // 교체는 노드 종류가 바뀐다는 뜻이다.
    case 'REPLACE':
      return `REPLACE path:${pathText} 의 노드가 다른 노드로 교체됩니다.`;
    // 텍스트 변경은 바뀐 최종 문자열을 보여 준다.
    case 'TEXT':
      return `TEXT path:${pathText} 의 글자가 "${patch.text}" 로 바뀝니다.`;
    // props 변경은 set/remove 내용을 같이 보여 준다.
    case 'PROPS':
      return `PROPS path:${pathText} 의 속성이 바뀝니다. set=${JSON.stringify(patch.props?.set ?? {})}, remove=${JSON.stringify(patch.props?.remove ?? [])}`;
    // MOVE는 어디서 어디로 가는지 보여 준다.
    case 'MOVE':
      return `MOVE path:${pathText} 의 노드가 index ${patch.to} 위치로 이동합니다.`;
    // 혹시 새로운 타입이 와도 최소한 문자열로는 보이게 한다.
    default:
      return `${patch.type} path:${pathText} patch가 감지되었습니다.`;
  }
}

// ------------------------------------------------------------
// getPatchIcon(type)
// ------------------------------------------------------------
// patch 타입에 맞는 작은 아이콘을 반환한다.
// ------------------------------------------------------------
function getPatchIcon(type) {
  // 타입마다 눈에 띄는 기호를 대응시킨다.
  switch (type) {
    // 추가는 플러스 느낌으로 보여 준다.
    case 'CREATE':
      return '➕';
    // 삭제는 X 느낌으로 보여 준다.
    case 'REMOVE':
      return '❌';
    // 교체는 서로 바뀐다는 느낌을 준다.
    case 'REPLACE':
      return '🔁';
    // 텍스트 수정은 연필 아이콘을 쓴다.
    case 'TEXT':
      return '✏️';
    // 속성 변경은 회전 느낌 아이콘을 쓴다.
    case 'PROPS':
      return '🔄';
    // 이동은 위아래 화살표 느낌으로 보여 준다.
    case 'MOVE':
      return '↕️';
    // 모르는 타입은 점 하나로 표시한다.
    default:
      return '•';
  }
}

// ------------------------------------------------------------
// pathToKey(path)
// ------------------------------------------------------------
// 배열 path를 data-path용 문자열로 바꾼다.
// ------------------------------------------------------------
function pathToKey(path = []) {
  // 루트 노드는 빈 배열이므로 특별히 root라는 이름을 준다.
  if (!path.length) {
    return 'root';
  }

  // 자식 경로는 점으로 이어 붙이면 읽기 쉽다.
  return path.join('.');
}
