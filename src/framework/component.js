// ============================================================
// component.js - FunctionComponent class
// ============================================================
//
// React에서 "함수형 컴포넌트"를 쓸 수 있는 이유는
// 내부적으로 이런 클래스가 컴포넌트를 감싸고 관리하기 때문이다.
//
// 이 클래스가 하는 일:
//   1. 컴포넌트 함수를 실행해서 VDOM을 만든다 (render)
//   2. 처음 화면에 그린다 (mount)
//   3. 상태가 바뀌면 다시 그린다 (update)
//   4. hooks 배열로 상태를 기억한다
//
// 비유하자면:
//   컴포넌트 함수 = "요리 레시피" (매번 새로 읽는다)
//   FunctionComponent = "요리사" (레시피를 실행하고 재료를 기억한다)
//   hooks 배열 = "요리사의 메모장" (이전 상태를 적어둔다)
// ============================================================

import { renderVdom } from '../core/renderVdom.js';
import { diff } from '../diff/diff.js';
import { applyPatches } from '../patch/applyPatch.js';

// ------------------------------------------------------------
// 현재 렌더링 중인 컴포넌트를 추적하는 전역 변수
// ------------------------------------------------------------
// hooks.js에서 useState 등이 호출될 때
// "지금 어떤 컴포넌트의 상태를 다루는 건지" 알아야 한다.
// 이 변수가 그 역할을 한다.
//
// 컴포넌트 함수가 실행되는 동안만 값이 채워지고,
// 실행이 끝나면 null로 돌아간다.
// ------------------------------------------------------------
export let currentComponent = null;
export let currentRenderPhase = 'idle';

// ------------------------------------------------------------
// setCurrentComponent(component)
// ------------------------------------------------------------
// 현재 렌더링 중인 컴포넌트를 설정한다.
// 컴포넌트 함수 실행 직전에 호출하고,
// 실행이 끝나면 null로 되돌린다.
// ------------------------------------------------------------
export function setCurrentComponent(component) {
  currentComponent = component;
}

function setRenderPhase(phase) {
  currentRenderPhase = phase;
}

// ------------------------------------------------------------
// FunctionComponent 클래스
// ------------------------------------------------------------
// [생성자 매개변수]
//   fn    - 함수형 컴포넌트 함수. 예: function Counter(props) { ... }
//   props - 부모가 넘겨준 속성 객체. 예: { name: '홍길동', age: 15 }
//
// [내부 상태]
//   hooks     - 상태를 저장하는 배열. useState 호출마다 한 칸씩 사용
//   hookIndex - 현재 몇 번째 hook을 읽고 있는지 추적하는 숫자
//   vdom      - 마지막으로 만든 Virtual DOM (비교용으로 보관)
//   container - 이 컴포넌트가 그려진 실제 DOM 요소
//   domNode   - 이 컴포넌트가 만든 실제 DOM 노드
// ------------------------------------------------------------
export class FunctionComponent {
  constructor(fn, props = {}) {
    this.fn = fn;
    this.props = props;
    this.hooks = [];
    this.hookIndex = 0;
    this.vdom = null;
    this.container = null;
    this.domNode = null;
  }

  // ----------------------------------------------------------
  // render()
  // ----------------------------------------------------------
  // 컴포넌트 함수를 실행해서 새로운 VDOM을 만든다.
  //
  // 왜 매번 새로 실행할까?
  //   -> 함수 안에서 hooks를 통해 최신 상태를 읽기 때문이다.
  //   -> 같은 함수를 실행해도, 상태가 다르면 다른 결과가 나온다.
  //
  // 중요한 순서:
  //   1. hookIndex를 0으로 리셋 (처음부터 다시 읽도록)
  //   2. currentComponent를 자기 자신으로 설정
  //   3. 컴포넌트 함수 실행 (이 안에서 useState 등이 호출됨)
  //   4. currentComponent를 null로 되돌림
  //   5. 만들어진 VDOM을 반환
  // ----------------------------------------------------------
  render() {
    this.hookIndex = 0;
    let rootVdom;

    setCurrentComponent(this);
    setRenderPhase('root');

    try {
      rootVdom = this.fn(this.props);
    } finally {
      setCurrentComponent(null);
      setRenderPhase('idle');
    }

    return expandTree(rootVdom);
  }

  // ----------------------------------------------------------
  // mount(container)
  // ----------------------------------------------------------
  // 컴포넌트를 처음으로 화면에 그린다.
  //
  // [매개변수]
  //   container - 컴포넌트를 넣을 부모 DOM 요소
  //               예: document.getElementById('app')
  //
  // [실행 순서]
  //   1. container를 저장한다 (나중에 update에서 쓰기 위해)
  //   2. render()로 VDOM을 만든다
  //   3. 만든 VDOM을 this.vdom에 저장한다 (다음 비교를 위해)
  //   4. renderVdom()으로 VDOM을 실제 DOM으로 변환한다
  //   5. 변환된 DOM을 container 안에 넣는다
  //   6. useEffect 콜백들을 실행한다 (mount 이후 사이드 이펙트)
  // ----------------------------------------------------------
  mount(container) {
    this.container = container;

    const newVdom = this.render();
    this.vdom = newVdom;
    this.domNode = renderVdom(newVdom);

    container.replaceChildren(this.domNode);
    this.runEffects();

    return this.domNode;
  }

  // ----------------------------------------------------------
  // update()
  // ----------------------------------------------------------
  // 상태가 바뀐 후 화면을 다시 그린다.
  //
  // 전체를 지우고 새로 그리는 게 아니라,
  // 바뀐 부분만 찾아서 수정한다. (이게 Virtual DOM의 핵심!)
  //
  // [실행 순서]
  //   1. render()로 새 VDOM을 만든다
  //   2. diff(이전 VDOM, 새 VDOM)으로 바뀐 부분 목록(patches)을 구한다
  //   3. applyPatches(실제 DOM, patches)로 화면에 반영한다
  //   4. 새 VDOM을 this.vdom에 저장한다 (다음 비교를 위해)
  //   5. useEffect 콜백들을 실행한다
  //
  // [비유]
  //   "틀린 그림 찾기" 같은 것이다.
  //   이전 그림(oldVdom)과 새 그림(newVdom)을 비교해서
  //   다른 부분만 새 그림으로 덮어씌운다.
  // ----------------------------------------------------------
  update() {
    if (!this.container) {
      return null;
    }

    if (this.vdom === null || this.domNode === null) {
      return this.mount(this.container);
    }

    const oldVdom = this.vdom;
    const newVdom = this.render();
    const patches = diff(oldVdom, newVdom);
    const nextDomNode = applyPatches(this.domNode, patches);

    this.vdom = newVdom;
    this.domNode = nextDomNode;

    if (this.container.firstChild !== this.domNode) {
      this.container.replaceChildren(this.domNode);
    }

    this.runEffects();
    return this.domNode;
  }

  // ----------------------------------------------------------
  // runEffects()
  // ----------------------------------------------------------
  // mount나 update 이후에 실행해야 하는 작업들을 처리한다.
  // (useEffect에 등록된 콜백들)
  //
  // 예: API에서 데이터 가져오기, 타이머 시작하기, 이벤트 등록하기
  //
  // 왜 렌더링과 분리할까?
  //   -> 화면을 먼저 그리고, 그 다음에 부가 작업을 하기 위해서.
  //   -> 사용자가 빈 화면을 오래 보지 않도록.
  // ----------------------------------------------------------
  runEffects() {
    for (const hook of this.hooks) {
      if (!hook || hook.type !== 'effect' || !hook.needsRun) {
        continue;
      }

      if (typeof hook.cleanup === 'function') {
        hook.cleanup();
      }

      const cleanup = hook.callback();
      hook.cleanup = typeof cleanup === 'function' ? cleanup : null;
      hook.needsRun = false;
    }

    return undefined;
  }
}

// ------------------------------------------------------------
// createApp(componentFn, props)
// ------------------------------------------------------------
// 앱을 시작하는 편의 함수.
// 컴포넌트를 만들고 mount까지 한 번에 해준다.
//
// [사용 예시]
//   function App() {
//     return h('div', null, '안녕하세요!');
//   }
//   createApp(App).mount(document.getElementById('app'));
//
// [반환값]
//   FunctionComponent 인스턴스 (필요하면 나중에 update 가능)
// ------------------------------------------------------------
export function createApp(componentFn, props = {}) {
  return new FunctionComponent(componentFn, props);
}

export function expandTree(vnode) {
  const safeNode = normalizeVNode(vnode);

  if (safeNode.type === 'component') {
    return expandChildComponent(safeNode.fn, safeNode.props ?? {});
  }

  if (safeNode.type === 'text') {
    return safeNode;
  }

  return {
    ...safeNode,
    children: (safeNode.children ?? []).map((child) => expandTree(child)),
  };
}

function expandChildComponent(componentFn, props) {
  const previousPhase = currentRenderPhase;

  setRenderPhase('child');

  try {
    return expandTree(componentFn(props));
  } finally {
    setRenderPhase(previousPhase);
  }
}

function normalizeVNode(vnode) {
  if (isVNode(vnode)) {
    return vnode;
  }

  if (vnode == null || typeof vnode === 'boolean') {
    return createTextNode('');
  }

  if (typeof vnode === 'string' || typeof vnode === 'number') {
    return createTextNode(String(vnode));
  }

  return createTextNode(String(vnode));
}

function isVNode(value) {
  return Boolean(
    value &&
      typeof value === 'object' &&
      (value.type === 'element' || value.type === 'text' || value.type === 'component')
  );
}

function createTextNode(text) {
  return {
    type: 'text',
    text,
  };
}
