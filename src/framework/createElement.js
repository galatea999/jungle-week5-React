// ============================================================
// createElement.js - h() helper
// ============================================================
//
// HTML을 직접 쓰지 않고,
// 자바스크립트 함수 호출로 가상 DOM 구조를 만드는 도우미다.
//
// 예를 들어 이런 HTML:
//   <div class="card">
//     <h2>제목</h2>
//     <p>내용</p>
//   </div>
//
// 는 이렇게 만들 수 있다:
//   h('div', { class: 'card' },
//     h('h2', null, '제목'),
//     h('p', null, '내용')
//   )
// ============================================================

import { createElementVNode, createTextVNode } from '../core/vnode.js';

// ------------------------------------------------------------
// h(tag, props, ...children)
// ------------------------------------------------------------
// 문자열 태그면 일반 element VNode를 만들고,
// 함수면 component VNode를 만든다.
// ------------------------------------------------------------
export function h(tag, props, ...children) {
  const safeProps = props == null ? {} : { ...props };
  const normalizedChildren = normalizeChildren(children);

  if (typeof tag === 'function') {
    return {
      type: 'component',
      fn: tag,
      props: {
        ...safeProps,
        children: normalizedChildren,
      },
    };
  }

  return createElementVNode(tag, safeProps, normalizedChildren);
}

// ------------------------------------------------------------
// normalizeChildren(children)
// ------------------------------------------------------------
// children 안에 섞여 있는 값을 한 가지 규칙으로 정리한다.
//
// 처리 규칙:
//   - 배열은 펼친다
//   - null / undefined / boolean 은 건너뛴다
//   - 문자열 / 숫자는 text VNode로 바꾼다
//   - 이미 VNode면 그대로 쓴다
// ------------------------------------------------------------
function normalizeChildren(children) {
  const normalized = [];

  for (const child of children) {
    if (Array.isArray(child)) {
      normalized.push(...normalizeChildren(child));
      continue;
    }

    if (child == null || typeof child === 'boolean') {
      continue;
    }

    if (typeof child === 'string' || typeof child === 'number') {
      normalized.push(createTextVNode(String(child)));
      continue;
    }

    if (isFrameworkVNode(child)) {
      normalized.push(child);
    }
  }

  return normalized;
}

function isFrameworkVNode(value) {
  return Boolean(
    value &&
      typeof value === 'object' &&
      (value.type === 'element' || value.type === 'text' || value.type === 'component')
  );
}
