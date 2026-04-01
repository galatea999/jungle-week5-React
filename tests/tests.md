# Tests Folder Guide

`tests/` 폴더는 현재 "실패/성공을 자동으로 판정하는 테스트 러너"라기보다  
"무엇을 어떻게 검증해야 하는지 먼저 정리한 테스트 설계 폴더"에 가깝습니다.

이 문서는 각 파일의 사용법과 동작 과정을 자세히 설명합니다.

## 이 폴더의 목적

- 역할 A가 framework를 구현할 때 어떤 동작이 핵심인지 빠르게 파악하게 돕기
- 역할 C가 학습 시나리오를 테스트 시나리오로 번역해 두기
- 아직 구현이 덜 된 부분도 `[pending]` 상태로 시각화해서 팀 전체가 다음 할 일을 알 수 있게 하기

## 파일 구성

### `framework.test.html`

- 브라우저에서 여는 테스트 시나리오 뷰어입니다.
- `component.test.js`, `hooks.test.js`, `integration.test.js`를 ES module로 import 합니다.
- 각 파일의 `run...StubTests()` 함수가 돌려준 데이터를 화면에 카드 형태로 렌더링합니다.

### `component.test.js`

- `FunctionComponent` 기본 동작을 검증할 항목을 담습니다.
- mount, props 변경, text node 처리처럼 기초 동작이 중심입니다.

### `hooks.test.js`

- `useState`, `useEffect`, `useMemo`의 대표 동작 시나리오를 정리합니다.
- 각 항목은 `hook`, `name`, `reason`, `setup`, `checkpoints`, `nextStep` 구조를 가집니다.

### `integration.test.js`

- 단위 기능을 넘어서 framework가 서로 연결될 때의 흐름을 봅니다.
- mount 이후 DOM 생성, `setState -> diff -> patch`, playground preview 연결, VDOM 시각화 패널 렌더링이 핵심입니다.

## 지금 사용하는 방법

### 1. 브라우저에서 시나리오 확인하기

가장 쉬운 시작점은 `framework.test.html`입니다.  
이 파일을 열면 현재 준비된 테스트 시나리오가 그룹별로 보입니다.

### 2. 각 시나리오 읽는 방법

각 항목은 아래 정보를 가집니다.

- `이유`: 왜 이 테스트가 필요한가
- `대상 Hook`: Hook 테스트일 경우 어떤 Hook을 말하는가
- `테스트 상황`: 어떤 준비 상태에서 검증하는가
- `검증 포인트`: 반드시 확인해야 할 핵심 관찰 항목
- `다음 단계`: 실제 assertion 테스트로 바꿀 때 어디서 시작하면 되는가

### 3. 코드에서 바로 데이터 가져오기

각 `.test.js` 파일은 두 종류의 함수를 제공합니다.

- `get...Scenarios()`
원본 시나리오 배열을 그대로 가져옵니다.

- `run...StubTests()`
원본 시나리오에 `status: 'pending'`을 붙여 브라우저 뷰어나 간단한 러너에서 바로 쓰기 좋게 만듭니다.

## `framework.test.html` 동작 과정

브라우저에서 이 파일을 열었을 때 흐름은 아래와 같습니다.

1. HTML 안의 `<script type="module">`가 세 개의 `.test.js` 파일을 import 합니다.
2. 각 모듈의 `run...StubTests()`가 시나리오 목록을 반환합니다.
3. `renderAll()`이 컴포넌트, Hook, 통합 테스트 그룹을 각각 `renderGroup()`으로 렌더링합니다.
4. `renderGroup()`은 각 시나리오의 이름, 상태, 이유, 검증 포인트 등을 DOM으로 만듭니다.
5. 최종 결과가 `#results` 영역에 붙습니다.

즉, 이 파일은 테스트를 "실행"하지 않고  
테스트 설계를 "보여주는 화면" 역할을 합니다.

## 실제 assertion 테스트로 바꿀 때 순서

### 컴포넌트 테스트

1. `component.test.js`의 각 `setup`을 실제 코드로 옮깁니다.
2. `checkpoints`를 `assert`, `expect`, 혹은 DOM 비교 코드로 바꿉니다.
3. 성공/실패 결과를 `pending` 대신 실제 값으로 바꾸는 러너를 연결합니다.

### Hook 테스트

1. `useState`부터 시작해 Hook 저장 슬롯과 DOM 결과를 같이 검증합니다.
2. `useEffect`는 실행 횟수와 deps 변화 여부를 기록하는 방식이 좋습니다.
3. `useMemo`는 factory 호출 횟수와 반환값 재사용 여부를 같이 봐야 합니다.

### 통합 테스트

1. 루트 컴포넌트 mount부터 시작합니다.
2. `setState -> rerender -> diff -> patch`가 실제로 이어지는지 확인합니다.
3. 이후 playground가 붙으면 preview 컨테이너 갱신도 통합 테스트에 포함합니다.

## 확장할 때 지키면 좋은 규칙

- 시나리오 객체 구조를 되도록 통일하기
- `reason`과 `nextStep`을 꼭 남겨 왜 필요한지와 다음 작업 방향이 보이게 하기
- 구현이 아직 없더라도 검증 포인트를 먼저 적어 두기
- 학습 페이지와 연결된 테스트는 학생이 체감할 사용자 경험도 함께 포함하기

## 현재 상태 요약

- 자동 테스트 환경은 아직 붙지 않았습니다.
- 하지만 무엇을 검증해야 하는지는 꽤 구체적으로 정리되어 있습니다.
- 따라서 역할 A/B 구현이 진행되면, 이 폴더의 시나리오를 실제 테스트 코드로 바꾸는 작업을 바로 시작할 수 있습니다.
