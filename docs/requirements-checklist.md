# Requirements Checklist

기준 문서: `/Users/galatea/Library/Mobile Documents/iCloud~md~obsidian/Documents/Effort/Jungle/week5/수요코딩회_발제.md`

현재 저장소 상태를 기준으로 보면, 이번 프로젝트는 수요코딩회 발제 요구사항에 전반적으로 잘 부합하고 있다.  
다만 발표용 완성도 기준에서는 `README 최신화`와 `루트만 Hook/State 사용` 제약을 더 분명히 정리하는 작업이 남아 있다.

## 전체 판정

- 현재 판정: 핵심 요구사항 대부분 충족
- 남은 핵심 보완점:
  - 발표용 `README.md`를 현재 구현 상태에 맞게 갱신
  - "Hook은 최상위만", "State는 루트만" 제약을 문서 또는 엔진 차원에서 더 명확히 정리

## 체크리스트

### 1. Component

- [x] UI를 작은 단위의 함수형 컴포넌트로 나누는 구조를 사용하고 있다.
- [x] `FunctionComponent` 클래스를 직접 구현했다.
- [x] `hooks` 배열, `mount()`, `update()`를 갖추고 있다.
- [~] 자식은 props 중심으로 쓰는 학습 흐름은 잘 반영되어 있다.
- [~] 하지만 "Hook은 최상위에서만", "State는 루트에서만"을 엔진이 강하게 제한하지는 않는다.

근거:
- `src/framework/component.js`
- `src/framework/hooks.js`
- `src/pages/componentSection.js`
- `src/pages/stateSection.js`

### 2. State

- [x] `useState`로 상태를 저장하고 setter 호출 시 다시 그리도록 연결되어 있다.
- [x] 상태 변경 시 `update()`가 호출되고 DOM이 갱신되는 흐름이 구현되어 있다.
- [x] Lifting State Up을 설명하고 실습하는 섹션이 있다.

근거:
- `src/framework/hooks.js`
- `src/framework/component.js`
- `src/pages/stateSection.js`

### 3. Hooks

- [x] `useState` 구현이 있다.
- [x] `useEffect` 구현이 있다.
- [x] `useMemo` 구현이 있다.
- [x] 버튼 클릭과 입력 이벤트를 통해 Hook 동작을 확인할 수 있는 실습/테스트가 있다.

근거:
- `src/framework/hooks.js`
- `src/core/domProps.js`
- `src/pages/hooksSection.js`
- `tests/hooks.test.js`

### 4. Virtual DOM + Diff + Patch

- [x] Virtual DOM 생성, Diff, Patch 흐름이 연결되어 있다.
- [x] 상태 변경 후 필요한 DOM 일부만 갱신하는 구조를 사용한다.
- [x] diff 결과를 보여주는 시각화 패널이 있다.
- [x] old tree / new tree / patch 목록을 함께 보여주는 학습 섹션이 있다.

근거:
- `src/framework/component.js`
- `src/diff/diff.js`
- `src/patch/applyPatch.js`
- `src/ui/diffVisualizer.js`
- `src/pages/vdomSection.js`

### 5. 테스트 페이지 개발

- [x] 브라우저에서 동작하는 학습 페이지가 있다.
- [x] 사용자의 입력과 클릭에 따라 화면이 변경되는 playground가 있다.
- [x] 워크숍 섹션에서 버튼 클릭 후 상태 변화까지 보여 주는 흐름이 있다.

근거:
- `index.html`
- `src/app.js`
- `src/ui/codePlayground.js`
- `src/pages/workshopSection.js`

### 6. 기술 제한

- [x] JavaScript, HTML, CSS 기반으로 구현되어 있다.
- [x] 외부 프레임워크(React, Vue 등)를 사용하지 않는다.

근거:
- `README.md`
- `src/`

### 7. 품질 기준

- [x] 컴포넌트, Hook, 통합 흐름에 대한 smoke test가 있다.
- [x] 클릭, 입력, preview 렌더, diff 시각화 등 핵심 사용자 흐름을 검증하는 테스트가 있다.
- [~] 다만 아직 완전한 자동 테스트 러너/CI 수준이라고 보기는 어렵다.
- [~] 테스트 문서 일부는 최신 상태보다 보수적으로 적혀 있어 정리가 더 필요하다.

근거:
- `tests/component.test.js`
- `tests/hooks.test.js`
- `tests/integration.test.js`
- `tests/framework.test.html`
- `tests/README.md`
- `tests/tests.md`

### 8. 발표 준비 관점

- [x] README 기준으로 설명해야 한다는 요구 자체는 인지하고 있고 README가 존재한다.
- [ ] 현재 `README.md`는 최신 구현 상태와 발표 흐름을 충분히 반영하지 못하고 있다.
- [~] 구현 자체는 발표 데모에 쓸 만한 수준으로 올라왔지만, README와 발표용 서사가 보강되어야 한다.

근거:
- `README.md`

## 우선 보완 항목

1. `README.md`를 현재 구현 상태 기준으로 다시 정리한다.
2. "루트 컴포넌트만 state/hook 사용" 제약을 문서 또는 코드에서 더 분명히 한다.
3. `tests/README.md`, `tests/tests.md`를 최신 smoke test 상태에 맞게 업데이트한다.
4. 발표 데모에서 보여줄 대표 시나리오를 README 기준으로 정리한다.

## 최종 한줄 판단

현재 구현은 수요코딩회 발제의 핵심 요구사항에 **대체로 부합하며, 핵심 기능은 대부분 충족**했다.  
남은 일은 새 기능 추가보다는 `문서 최신화`, `제약 명확화`, `발표 기준 정리`에 가깝다.
