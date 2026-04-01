// ============================================================
// reconciler.js - connect component VDOM to real DOM
// ============================================================
//
// 이 파일은 컴포넌트가 만든 VDOM을 실제 DOM 변경과 연결한다.
// component VNode를 일반 element/text VNode 트리로 펼친 다음,
// diff와 patch를 이용해 화면을 업데이트한다.
// ============================================================

import { FunctionComponent, expandTree } from './component.js';
import { renderVdom } from '../core/renderVdom.js';
import { diff } from '../diff/diff.js';
import { applyPatches } from '../patch/applyPatch.js';

// component.js와 reconciler.js가 서로 다른 규칙으로 트리를 펼치면
// mount/update 경로에 따라 결과가 달라질 수 있다.
// 그래서 expandTree는 component.js의 구현을 그대로 재사용한다.
export { expandTree } from './component.js';

// ------------------------------------------------------------
// ------------------------------------------------------------
// component VNode를 실행해서 일반 VNode 트리로 펼친다.
// ------------------------------------------------------------

// ------------------------------------------------------------
// reconcile(container, oldVdom, newVdom)
// ------------------------------------------------------------
// 이전 트리와 새 트리를 비교해서 실제 DOM에 반영한다.
// ------------------------------------------------------------
export function reconcile(container, oldVdom, newVdom) {
  const previousTree = oldVdom == null ? null : expandTree(oldVdom);
  const nextTree = expandTree(newVdom);

  if (previousTree === null || !container.firstChild) {
    const domNode = renderVdom(nextTree);
    container.replaceChildren(domNode);
    return domNode;
  }

  const patches = diff(previousTree, nextTree);
  const nextDomNode = applyPatches(container.firstChild, patches);

  if (container.firstChild !== nextDomNode) {
    container.replaceChildren(nextDomNode);
  }

  return nextDomNode;
}

// ------------------------------------------------------------
// renderApp(componentFn, container, props)
// ------------------------------------------------------------
// 루트 컴포넌트를 만들어 mount한 뒤 인스턴스를 돌려준다.
// ------------------------------------------------------------
export function renderApp(componentFn, container, props = {}) {
  const app = new FunctionComponent(componentFn, props);
  app.mount(container);
  return app;
}

// reconcile() 쪽에서도 문자열, 숫자, null 같은 반환값을
// 같은 규칙으로 다룰 수 있도록 입력을 한 번 정리해 둔다.
