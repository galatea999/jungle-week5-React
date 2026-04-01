# Pages Folder Guide

`src/pages/` 폴더는 학습 페이지의 "콘텐츠 조각"을 담당합니다.  
각 파일은 섹션 하나를 만들고, `app.js`는 그 섹션들을 순서대로 모아 화면에 붙입니다.

## 이 폴더의 역할

- 학습 주제별 설명 문장을 준비합니다.
- 예제 코드, 체크리스트, STUB 자리, playground 카드 같은 학습 카드 구조를 만듭니다.
- 실제 렌더링 로직보다는 "학생이 어떤 순서로 읽고 실습할지"를 결정합니다.

## 화면에 붙는 순서

1. `src/app.js`가 각 `create*Section()` 함수를 import 합니다.
2. 각 함수는 자기 섹션에 해당하는 `<section>` DOM 묶음을 만듭니다.
3. `src/ui/layout.js`가 준비한 콘텐츠 영역에 이 섹션들이 순서대로 붙습니다.
4. 사용자는 왼쪽 내비게이션과 오른쪽 섹션 본문을 통해 학습 흐름을 따라갑니다.

## 공통 패턴

모든 페이지 파일은 비슷한 구조를 가집니다.

- 파일 상단에 학습 데이터 배열 또는 예제 코드 문자열을 둡니다.
- `create...Section()` 공개 함수 하나가 전체 섹션 DOM을 만듭니다.
- 아래쪽 helper 함수들이 제목 블록, 설명 카드, 코드 카드, playground 카드, placeholder 카드를 재사용합니다.

공통 playground 카드는 `practicePlayground.js`가 맡고 있습니다.
이 helper는 `codePlayground.js`를 감싸서, 각 섹션 파일이 starter code와 설명만 넘기면 바로 실습 카드를 만들 수 있게 도와줍니다.

이 패턴을 유지하면 나중에 새로운 섹션을 추가해도 읽는 방식이 크게 달라지지 않습니다.

## 파일별 설명

### `componentSection.js`

- 첫 섹션인 `Component와 Props`를 만듭니다.
- 학생이 "컴포넌트는 UI 조각", "props는 부모가 자식에게 주는 값"이라는 감각을 잡도록 설계되어 있습니다.
- starter code가 실제 playground에 연결되어 있어서, 같은 컴포넌트를 props만 바꿔 재사용하는 연습을 바로 해볼 수 있습니다.

### `hooksSection.js`

- `useState`, `useEffect`, `useMemo`를 다룹니다.
- 각 Hook 카드가 `설명 -> playground -> 직접 해보기 -> 답안 예시 -> 챌린지` 흐름으로 구성되어 있습니다.
- `useEffect`는 effect 문구를, `useMemo`는 계산 횟수를 화면에서 바로 확인할 수 있게 설계되어 있습니다.

### `stateSection.js`

- `Lifting State Up` 개념을 설명합니다.
- 여러 컴포넌트가 같은 데이터를 쓸 때 왜 부모로 state를 올리는지 문장과 예제로 보여 줍니다.
- starter code가 실제 playground에 연결되어 있어, 입력창은 바뀌지만 결과 카드는 안 바뀌는 출발점에서 부모 state 공유 구조로 직접 고쳐 볼 수 있습니다.

### `vdomSection.js`

- `setState -> re-render -> diff -> patch` 흐름을 소개합니다.
- 이전/다음 트리 예시와 patch 예측용 starter/answer를 보여 주고, 실제 `diffVisualizer.js`를 붙여 old/new tree와 patch 목록을 같이 볼 수 있게 구성했습니다.
- 시나리오 버튼으로 `텍스트 변경 + 노드 추가`, `속성 변경 + 노드 제거`를 번갈아 확인할 수 있습니다.

### `workshopSection.js`

- 마지막 종합 실습 섹션입니다.
- 학생이 어떤 부품을 만들고 어떤 모양의 App을 완성해야 하는지 목표를 분명히 보여 줍니다.
- starter code가 실제 playground에 연결되어 있어, 정적인 카드 앱에서 시작해 `selectedSkill` state와 클릭 이벤트까지 확장해 볼 수 있습니다.

## 확장할 때 지키면 좋은 규칙

- 새로운 섹션도 `create...Section()` 공개 함수 하나로 끝내기
- 설명, 예제, 직접 해보기, 챌린지 순서를 되도록 유지하기
- 아직 미구현인 기능은 `[STUB]` 문구로 의도를 분명히 남기기
- 학습용 코드이므로 예제는 짧고 읽기 쉽게 유지하기

## 지금 읽는 방법

- "현재 학습 흐름이 어떻게 짜였는지" 보려면 `componentSection.js`부터 순서대로 읽는 것이 좋습니다.
- "가장 완성도가 높은 섹션 예시"를 보려면 `hooksSection.js`를 먼저 읽어도 좋습니다.
- "아직 어떤 기능이 남았는지" 보려면 각 챌린지 카드와 테스트 시나리오를 함께 보면 됩니다.
