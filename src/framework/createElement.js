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
    // 함수 태그는 아직 실행하지 않은 컴포넌트이다.
    // 여기서는 바로 DOM을 만들지 않고,
    // "이 함수와 props를 나중에 실행해 달라"는 component VNode를 만든다.
    //
    // children을 props 안에 넣어 두면
    // 자식 컴포넌트가 props.children 형태로 같은 데이터를 받을 수 있다.
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

// normalizeChildren() 안에서는
// 값이 이미 VNode인지, 아니면 text VNode로 바꿔야 할 원시값인지 구분해야 한다.
// 이 helper는 그 판별만 맡는다.
function isFrameworkVNode(value) {
  return Boolean(
    value &&
      typeof value === 'object' &&
      (value.type === 'element' || value.type === 'text' || value.type === 'component')
  );
}
