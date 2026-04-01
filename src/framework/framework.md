# Framework Folder Guide

`src/framework/`는 이 프로젝트의 mini React 런타임입니다.
이 폴더의 역할은 "함수를 컴포넌트처럼 다루고, hook 상태를 기억하고,
상태 변화가 실제 DOM 업데이트까지 이어지게 만드는 것"입니다.

실제 DOM 생성과 patch 적용은 `src/core`, `src/diff`, `src/patch`가 맡고,
`src/framework/`는 그 사이를 연결하는 얇은 React 계층 역할을 합니다.

## 이 폴더의 현재 책임

- `h()`로 VDOM을 작성할 수 있게 한다.
- 함수 컴포넌트를 `FunctionComponent` 인스턴스로 감싼다.
- `useState`, `useEffect`, `useMemo` 상태를 `hooks` 배열에 저장한다.
- mount 시 첫 렌더를 수행한다.
- update 시 새 VDOM을 만들고 diff/patch로 DOM을 갱신한다.

## 공개 API 한눈에 보기

현재 외부에서 직접 사용하거나, 다른 폴더가 import하는 핵심 API는 아래와 같습니다.

- `h(tag, props, ...children)`
- `FunctionComponent`
- `createApp(componentFn, props)`
- `useState(initialValue)`
- `useEffect(callback, deps)`
- `useMemo(factory, deps)`
- `depsChanged(prevDeps, nextDeps)`
- `expandTree(vnode)`
- `reconcile(container, oldVdom, newVdom)`
- `renderApp(componentFn, container, props)`

## 파일별 역할

### `createElement.js`

- `h()` helper를 제공한다.
- 문자열 tag면 element VNode를 만든다.
- 함수 tag면 component VNode를 만든다.
- children을 정규화하면서 아래 규칙을 적용한다.
- 중첩 배열은 평탄화
- `null`, `undefined`, `boolean`은 제거
- 문자열, 숫자는 text VNode로 변환

즉 학습 페이지와 playground에서 JSX 없이도 아래처럼 쓸 수 있게 해 준다.

```js
h('section', { class: 'card' },
  h('h2', null, 'Hello'),
  h('p', null, 'mini React')
)
```

### `component.js`

- `FunctionComponent` 클래스를 정의한다.
- 각 인스턴스는 아래 상태를 가진다.
- `fn`
- `props`
- `hooks`
- `hookIndex`
- `vdom`
- `container`
- `domNode`

핵심 메서드는 아래와 같다.

- `render()`
  함수 컴포넌트를 실행하고 최종 VDOM 트리를 만든다.
- `mount(container)`
  첫 렌더를 수행하고 DOM을 붙인다.
- `update()`
  새 VDOM을 만들고 diff/patch를 적용한다.
- `runEffects()`
  `useEffect`가 등록한 콜백을 mount/update 뒤에 실행한다.

이 파일은 hooks가 "지금 누구의 상태를 읽고 있는지" 알 수 있도록
전역 포인터 `currentComponent`도 관리한다.

### `hooks.js`

- `currentComponent`를 기반으로 hook 상태를 저장한다.
- 각 hook은 `component.hooks[index]` 슬롯을 쓴다.

현재 구현은 아래처럼 동작한다.

- `useState`
  현재 슬롯의 값을 읽고 setter를 돌려준다.
  setter는 값이 바뀌면 바로 `component.update()`를 호출한다.
- `useEffect`
  effect 정보와 deps를 hook 슬롯에 저장한다.
  실제 실행은 `component.js`의 `runEffects()`가 담당한다.
- `useMemo`
  deps가 바뀔 때만 factory를 다시 실행한다.

중요한 제약도 여기서 드러난다.

- hook은 렌더 중에만 호출할 수 있다.
- hook 호출 순서는 렌더마다 같아야 한다.
- 현재는 React처럼 고급 스케줄링이나 batching이 들어가 있지 않다.

### `reconciler.js`

- component VNode를 실제 element/text 트리로 펼치는 `expandTree()`를 제공한다.
- `reconcile()`은 old/new tree를 비교해서 DOM에 patch를 적용한다.
- `renderApp()`은 루트 컴포넌트를 `FunctionComponent`로 만들어 바로 mount하는 편의 함수다.

학습 페이지의 playground와 대부분의 예제는 결국 이 `renderApp()`을 통해 실행된다.

## 실제 렌더 파이프라인

현재 프레임워크 흐름은 아래처럼 이해하면 가장 쉽습니다.

1. 사용자 코드가 `renderApp(App, container)`를 호출한다.
2. `FunctionComponent`가 `App`을 실행해 VDOM을 만든다.
3. 첫 mount면 `renderVdom()`이 실제 DOM을 만든다.
4. `setState()`가 호출되면 `update()`가 실행된다.
5. `update()`는 새 VDOM을 만들고 `diff(oldVdom, newVdom)`를 호출한다.
6. `applyPatches()`가 실제 DOM 노드에 변경을 반영한다.
7. 렌더 뒤에는 `runEffects()`가 effect를 실행한다.

요약하면 다음 한 줄입니다.

`state 변화 -> component 재실행 -> 새 VDOM 생성 -> diff -> patch -> effect 실행`

## 이 폴더와 다른 폴더의 경계

현재 구조에서는 책임이 아래처럼 나뉩니다.

- `src/framework/`
  컴포넌트와 hooks의 개념
- `src/core/`
  VDOM을 실제 DOM으로 렌더하는 개념
- `src/diff/`
  old/new tree 차이를 계산하는 개념
- `src/patch/`
  계산된 patch를 실제 DOM에 반영하는 개념

중요한 점은, `onclick`, `oninput`, `value` 같은 실제 DOM prop 적용은
이 폴더가 아니라 `src/core/domProps.js`, `src/core/renderVdom.js`,
`src/patch/applyPatch.js`가 맡는다는 것입니다.

## 현재 구현 범위

현재 mini React는 아래 범위를 지원합니다.

- 함수 컴포넌트
- text / element / component VNode
- `useState`
- `useEffect`
- `useMemo`
- diff 기반 DOM 업데이트
- event props가 연결된 preview 상호작용

아직 없는 범위는 아래와 같습니다.

- class component
- Context
- refs
- batching / scheduler
- React DevTools 같은 고급 디버깅 계층

## 이 폴더를 읽는 추천 순서

1. `createElement.js`
2. `component.js`
3. `hooks.js`
4. `reconciler.js`

이 순서로 읽으면 "VDOM 작성 -> 컴포넌트 실행 -> hook 기억 -> DOM 반영" 흐름이 자연스럽게 이어집니다.
