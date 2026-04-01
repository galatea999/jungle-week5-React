# UI Folder Guide

`src/ui/`는 학습 페이지의 화면 계층입니다.
프레임워크 자체를 구현하는 곳이 아니라,
그 프레임워크를 "학생이 읽고, 눌러 보고, 비교해 볼 수 있게" 만드는 폴더입니다.

## 이 폴더의 현재 역할

- 전체 페이지 레이아웃을 만든다.
- 오른쪽 practice rail에 playground를 렌더한다.
- 코드를 실행하고 preview를 보여준다.
- VDOM diff 결과를 시각화한다.
- 재사용 가능한 학습용 카드 UI를 제공한다.

## 파일별 역할

### `layout.js`

- 전체 학습 페이지 뼈대를 만든다.
- 현재 화면은 아래 세 영역으로 나뉜다.
- 왼쪽: 챕터 네비게이션
- 가운데: 현재 챕터 본문 stage
- 오른쪽: practice rail

핵심 export는 아래와 같다.

- `createLayout(root)`
- `renderSectionNavigation(nav, sections, onSelect)`
- `setActiveSectionLink(nav, activeSectionId)`
- `setProgressText(progressText, text)`

`createLayout()`은 DOM만 만들고,
실제 챕터 전환은 `src/app.js`가 담당한다.

### `codePlayground.js`

- 현재 실습의 중심 UI다.
- `createPlayground(options)`를 호출하면 editor + preview + action 버튼이 한 묶음으로 만들어진다.

주요 옵션은 아래와 같다.

- `initialCode`
- `title`
- `description`
- `readOnly`
- `showVdom`
- `stacked`
- `onRun`

반환값은 아래 구조다.

- `element`
- `editor`
- `preview`
- `vdomViewer`
- `run()`
- `reset()`
- `getCode()`

## playground가 코드를 실행하는 방식

현재 playground는 별도 번들러 없이 `new Function()`으로 코드를 실행한다.
실행 시 아래 API를 주입한다.

- `h`
- `useState`
- `useEffect`
- `useMemo`
- `renderApp`
- `previewContainer`
- `mountResult`

따라서 학습자는 JSX 없이도 바로 mini React 예제를 실행해 볼 수 있다.

또한 결과가 아래 어떤 형태인지에 따라 preview 처리 방식이 달라진다.

- DOM Node
- 문자열 / 숫자
- VNode
- 함수 컴포넌트

`showVdom: true`인 경우에는 오른쪽 아래에 VDOM viewer도 같이 보여준다.

### `diffVisualizer.js`

- Virtual DOM 챕터의 핵심 시각화 도구다.
- `createDiffVisualizer()`는 다음 세 영역을 같이 보여주는 패널을 만든다.
- old VDOM tree
- new VDOM tree
- patch list

반환값은 아래 구조다.

- `element`
- `showDiff(oldVdom, newVdom)`
- `clear()`

현재 `showDiff()`는 내부에서 `diff()`를 호출하고,
변경된 path를 기준으로 트리의 해당 노드를 강조 표시한다.

### `contentBlocks.js`

- `Note`, `Deep Dive`, `Challenge`, `Recap` 같은 재사용 블록 모음이다.
- export는 아래와 같다.
- `createYouWillLearn`
- `createNote`
- `createDeepDive`
- `createChallenge`
- `createSectionHeader`
- `createParagraph`
- `createCodeBlock`
- `createRecap`

중요한 점은, 현재 pages 파일들이 이 블록을 전부 적극적으로 쓰고 있지는 않다는 점이다.
최근 섹션 파일들은 읽기 쉬운 로컬 helper를 파일 안에 두는 방식도 같이 사용한다.
즉 `contentBlocks.js`는 "사용 가능한 공용 블록 라이브러리"로 이해하는 편이 맞다.

## app.js와 연결되는 방식

현재 최종 사용자 화면은 `src/app.js`와 함께 이해해야 한다.

- `createLayout()`으로 페이지 shell을 만든다.
- `renderSectionNavigation()`으로 왼쪽 챕터 메뉴를 그린다.
- 현재 챕터가 바뀌면 가운데 stage 본문을 교체한다.
- 동시에 `renderPracticeRail()`이 오른쪽 rail에 `createPlayground()`를 붙인다.

즉 `src/ui/`는 독립 페이지라기보다,
`src/app.js`가 조립해서 쓰는 UI 부품 모음이다.

## 현재 UI 구조에서 중요한 포인트

- stage와 practice rail이 분리되어 있다.
- 챕터 본문은 설명 중심이다.
- 실제 실행 playground는 오른쪽 rail 중심이다.
- VDOM 챕터만은 `diffVisualizer`가 stage 안에서 직접 보인다.

이 구조 덕분에 학생은
"가운데에서 개념을 읽고, 오른쪽에서 바로 만져 보는 흐름"으로 학습할 수 있다.

## 새 UI 컴포넌트를 추가할 때 기준

- 여러 페이지에서 반복해서 쓸 수 있는가
- 학습 흐름을 더 읽기 쉽게 만드는가
- framework 로직과 view 로직의 경계를 흐리지 않는가
- `src/app.js`에서 조립하기 쉬운 공개 API를 갖는가

## 이 폴더를 읽는 추천 순서

1. `layout.js`
2. `codePlayground.js`
3. `diffVisualizer.js`
4. `contentBlocks.js`

이 순서로 읽으면 "페이지 뼈대 -> 실행형 학습 UI -> VDOM 시각화 -> 보조 블록" 흐름으로 이해하기 쉽다.
