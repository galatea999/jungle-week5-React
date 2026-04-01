// ============================================================
// reconciler.js - connect component VDOM to real DOM
// ============================================================
//
// 이 파일은 컴포넌트가 만든 VDOM을 실제 DOM 변경과 연결한다.
// component VNode를 일반 element/text VNode 트리로 펼친 다음,
// diff와 patch를 이용해 화면을 업데이트한다.
// ============================================================

import { FunctionComponent } from './component.js';
import { renderVdom } from '../core/renderVdom.js';
import { diff } from '../diff/diff.js';
import { applyPatches } from '../patch/applyPatch.js';

// ------------------------------------------------------------
// expandTree(vnode)
// ------------------------------------------------------------
// component VNode를 실행해서 일반 VNode 트리로 펼친다.
// ------------------------------------------------------------
export function expandTree(vnode) {
  const safeNode = normalizeVNode(vnode);

  if (safeNode == null) {
    return null;
  }

  if (safeNode.type === 'text') {
    return safeNode;
  }

  if (safeNode.type === 'component') {
    return expandTree(safeNode.fn(safeNode.props ?? {}));
  }

  return {
    ...safeNode,
    children: (safeNode.children ?? []).map((child) => expandTree(child)),
  };
}

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

function normalizeVNode(vnode) {
  if (vnode == null || typeof vnode === 'boolean') {
    return null;
  }

  if (typeof vnode === 'string' || typeof vnode === 'number') {
    return {
      type: 'text',
      text: String(vnode),
    };
  }

  return vnode;
}
