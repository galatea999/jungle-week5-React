# Pages Folder Guide

`src/pages/`는 학습 페이지의 "본문 원본"을 모아 두는 폴더입니다.
각 파일은 특정 챕터의 설명, 예제 코드, 챌린지, 실습 데이터를 만들고,
실제 화면 배치와 챕터 전환은 `src/app.js`가 담당합니다.

## 이 폴더의 현재 역할

- 챕터별 설명 카드와 코드 예시를 만든다.
- 챕터별 실습 starter code와 answer code를 export한다.
- VDOM 시각화처럼 챕터 전용 학습 도구를 만든다.
- 학습 흐름을 `설명 -> 예제 -> 직접 해보기 -> 챌린지` 기준으로 정리한다.

## 실제 화면과 연결되는 방식

현재 구조는 "pages가 본문 원본을 만들고, app이 최종 화면에 맞게 정리하는 방식"입니다.

1. 각 파일이 `create...Section()` 함수를 export한다.
2. 필요하면 `...PRACTICE` 형태의 실습 데이터도 같이 export한다.
3. `src/app.js`가 이 함수들과 실습 데이터를 import한다.
4. `buildSections()`가 각 챕터 DOM을 만든다.
5. `normalizeSectionElement()`가 stage에 중복되는 소개 블록과 inline playground를 정리한다.
6. `renderPracticeRail()`이 오른쪽 `practice rail`에 실행 가능한 playground를 붙인다.

즉, 현재 최종 화면은 이렇게 나뉩니다.

- 가운데 stage: 설명, 예제 코드, 체크포인트, 챌린지, VDOM 시각화
- 오른쪽 practice rail: 실제로 실행되는 playground

이 구조 때문에 섹션 파일 안에 playground 카드 helper가 있어도,
최종 통합 화면에서는 `app.js`가 practice rail 중심으로 재배치합니다.

## 현재 파일 구성

### `componentSection.js`

- `Component + Props` 챕터를 만든다.
- `COMPONENT_PRACTICE`를 export해서 오른쪽 rail에서 실습할 starter code를 제공한다.
- 카드 재사용과 props 변경을 가장 먼저 체험하게 하는 입문 챕터다.

### `hooksSection.js`

- `useState`, `useEffect`, `useMemo` 챕터를 만든다.
- `HOOK_PRACTICES` 배열을 export한다.
- Hook마다 설명, starter code, answer code, 챌린지를 따로 갖고 있어서
  rail에서는 탭처럼 여러 실습을 전환해 보여줄 수 있다.

### `stateSection.js`

- `Lifting State Up` 챕터를 만든다.
- `STATE_PRACTICE`를 export한다.
- 부모가 state를 소유하고 자식은 props를 받는 구조를 설명하는 데 집중한다.

### `vdomSection.js`

- `Virtual DOM` 챕터를 만든다.
- `VDOM_PRACTICE`를 export한다.
- `createDiffVisualizer()`를 이용해 old tree / new tree / patch list를 같이 보여준다.
- 현재는 자유 입력형 playground보다 "미리 준비된 시나리오를 버튼으로 바꿔 보는 학습형 시각화"에 가깝다.

### `workshopSection.js`

- 마지막 종합 실습 챕터를 만든다.
- `WORKSHOP_PRACTICE`를 export한다.
- `Header`, `ProfileCard`, `SkillList`, `selectedSkill` state를 합쳐
  작은 앱을 조립하는 흐름으로 설계되어 있다.

### `practicePlayground.js`

- 섹션 안에 inline playground 카드를 붙일 때 쓰는 공용 helper다.
- 내부적으로 `src/ui/codePlayground.js`의 `createPlayground()`를 감싸고,
  생성 직후 `run()`까지 호출해 초기 미리보기가 바로 보이게 한다.
- 현재 최종 통합 화면은 오른쪽 practice rail이 중심이지만,
  섹션 단독 렌더나 문서화된 예제에서는 여전히 유용한 helper다.

## 챕터별 실습 데이터 export

현재 `src/pages/`에서 외부로 노출하는 실습 데이터는 아래와 같습니다.

- `COMPONENT_PRACTICE`
- `HOOK_PRACTICES`
- `STATE_PRACTICE`
- `VDOM_PRACTICE`
- `WORKSHOP_PRACTICE`

`src/app.js`는 이 데이터를 직접 읽어서 practice rail의 `createPlayground()` 옵션으로 변환합니다.

## app.js가 추가로 담당하는 일

현재 `src/pages/` 문서를 볼 때 놓치기 쉬운 점은,
최종 화면 구조의 일부가 이미 `src/app.js`로 올라가 있다는 점입니다.

- 챕터 제목과 요약은 stage 상단 chapter shell에서 따로 보여준다.
- practice rail의 playground는 `SECTION_FACTORIES.practice` 설정으로 만든다.
- VDOM rail 예제와 state rail 예제 중 일부는 `app.js` 안에서 별도 코드 문자열로 관리한다.
- `decorateSubsectionHeadings()`가 챕터별 카드 제목에 아이콘을 붙여 최종 표현을 다듬는다.

즉, pages 파일만 보면 "섹션이 전부 스스로 완결된 것처럼" 보일 수 있지만,
실제 사용자 화면은 `src/app.js`와 합쳐져서 완성됩니다.

## 새 챕터를 추가할 때 규칙

새 파일을 추가할 때는 아래 순서를 따르면 현재 구조와 잘 맞습니다.

1. `createNewSection()` 형태의 공개 함수를 만든다.
2. 필요한 starter code / answer code를 `...PRACTICE` 데이터로 분리한다.
3. stage에서 읽을 설명 카드와 challenge 카드를 먼저 만든다.
4. 실제 실행이 필요하면 `src/app.js`의 `SECTION_FACTORIES`에 `practice` 설정을 추가한다.
5. stage에 임시로 inline playground를 넣었더라도, 최종 통합에서는 practice rail 중복 여부를 확인한다.

## 지금 이 폴더를 읽는 추천 순서

- 전체 구조를 먼저 보고 싶다면 `componentSection.js -> hooksSection.js -> stateSection.js -> vdomSection.js -> workshopSection.js`
- practice rail과의 연결까지 이해하고 싶다면 `src/app.js`를 바로 같이 읽기
- VDOM 시각화 동작을 알고 싶다면 `vdomSection.js` 다음에 `src/ui/diffVisualizer.js` 읽기
