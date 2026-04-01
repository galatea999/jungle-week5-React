# Tests Folder Guide

`tests/`는 이 프로젝트의 "브라우저 기반 테스트 보드"입니다.
지금 구조는 전통적인 CLI 테스트 러너라기보다,
현재 학습 페이지와 mini React 프레임워크가 어디까지 연결되었는지를
눈으로 확인하는 smoke test + 시나리오 보드에 가깝습니다.

## 현재 상태 요약

현재 시나리오 메타데이터 기준 상태는 아래와 같습니다.

- `component`: `covered 3`
- `hooks`: `covered 7`
- `integration`: `covered 8`
- `blocked`: `0`
- `pending`: `0`

즉, 예전에 blocker였던 event props 연결 문제까지 정리된 뒤에는
테스트 보드 기준으로 남은 시나리오가 모두 `covered` 상태입니다.

## 이 폴더의 역할

- 브라우저에서 바로 실행 가능한 smoke test를 제공한다.
- 각 테스트가 무엇을 검증하는지 설명하는 시나리오 메타데이터를 제공한다.
- 현재 구현 완료도와 남은 발표 준비 단계를 테스트 보드 화면으로 보여준다.
- 학습 페이지의 핵심 사용자 흐름이 실제로 살아 있는지 빠르게 확인한다.

## 파일 구성

### `framework.test.html`

- 테스트 보드의 진입점이다.
- 브라우저에서 열면 아래 네 가지를 보여준다.
- `통합 진행 현황`
- `실행 가능한 스모크 테스트`
- `현재 blocker 요약`
- `component / hooks / integration` 시나리오 목록

이 파일은 각 `.test.js` 모듈에서 두 가지를 import한다.

- `run...SmokeTests()`: 실제 실행 결과
- `run...StubTests()`: 시나리오 설명과 상태 메타데이터

## 개별 테스트 파일

### `component.test.js`

- `FunctionComponent`의 가장 기본적인 렌더 흐름을 본다.
- 현재 smoke test는 아래 흐름을 포함한다.
- mount 후 DOM 생성
- props update 반영
- text node 렌더 확인

### `hooks.test.js`

- `useState`, `useEffect`, `useMemo`의 핵심 계약을 본다.
- 현재 smoke test는 아래 흐름을 포함한다.
- 여러 `useState` 슬롯 분리
- `setState` 호출 뒤 DOM 업데이트
- `useEffect` deps 비교
- `useMemo` 캐시 재사용
- `click` 기반 상태 변경
- `input` 기반 effect 재실행

### `integration.test.js`

- 프레임워크와 학습 페이지가 실제로 함께 동작하는지 본다.
- 현재 smoke test는 아래 흐름을 포함한다.
- root component mount
- `setState -> diff -> patch` 연결
- playground 실행 뒤 preview 렌더
- VDOM 시각화 패널 시나리오 전환
- workshop answer code 실행
- workshop 스킬 버튼 클릭 후 `selectedSkill` 변경
- 전체 섹션 DOM 구조 확인
- playground reset 동작 확인

### `testUtils.js`

- 테스트 공용 helper 모음이다.
- 현재 들어 있는 함수는 아래와 같다.
- `assert`
- `assertEqual`
- `createSandbox`
- `cleanupSandbox`
- `triggerClick`
- `triggerInput`
- `runTestCases`

이 helper 덕분에 각 테스트 파일은 "무엇을 검증할지"에만 집중하고,
DOM 샌드박스 생성과 결과 포맷팅은 공통 로직으로 재사용한다.

## smoke test와 stub test의 차이

### `run...SmokeTests()`

- 실제 브라우저 DOM 환경에서 assertion을 수행한다.
- 결과는 `passed` 또는 `failed`다.
- 테스트 보드 상단 "실행 가능한 스모크 테스트"에 표시된다.

### `run...StubTests()`

- 시나리오 설명, 이유, setup, checkpoints, coverage를 보드용 형식으로 돌려준다.
- 결과는 `covered`, `blocked`, `pending` 같은 시나리오 상태다.
- 현재는 모든 시나리오가 `covered`지만,
  이 함수는 여전히 "무엇을 왜 검증하는지"를 설명하는 보드 데이터로 중요하다.

## 브라우저에서 보는 방법

가장 쉬운 시작점은 `tests/framework.test.html`입니다.

1. 파일을 브라우저에서 연다.
2. 상단 `테스트 다시 실행` 버튼을 누른다.
3. `passed / failed` 스모크 테스트 결과를 먼저 본다.
4. 아래 시나리오 카드에서 각 테스트의 이유와 검증 포인트를 읽는다.

## 지금 보드가 보여주는 의미

현재 보드에서 `covered`는 "시나리오가 이미 smoke test와 연결되어 있다"는 뜻입니다.
예전에는 hooks/workshop 상호작용이 `blocked`로 남아 있었지만,
현재는 DOM event props 연결 이후 covered로 정리되었습니다.

즉 지금 테스트 보드는
"무엇이 아직 미구현인가?"보다는
"현재 발표용으로 어떤 핵심 흐름이 살아 있는가?"를 확인하는 도구에 더 가깝습니다.

## 현재 한계

- 아직 npm 기반 CLI 테스트 러너는 붙어 있지 않다.
- 테스트는 브라우저 환경과 DOM 샌드박스를 전제로 한다.
- smoke test는 핵심 흐름 위주라서 모든 edge case를 완전히 다루지는 않는다.

## 추천 확인 순서

- 프레임워크 기본이 궁금하면 `component.test.js`
- hooks 동작이 궁금하면 `hooks.test.js`
- 학습 페이지 전체 연결 상태가 궁금하면 `integration.test.js`
- 현재 완료도를 한 화면에서 보고 싶다면 `framework.test.html`
