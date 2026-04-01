# Week 5 React Learning Page

이 저장소는 **React 핵심 개념을 직접 체험하며 배우는 학습 페이지**를 만드는 프로젝트입니다.  
페이지 자체가 우리가 직접 구현하는 **mini React 프레임워크** 위에서 동작하는 것을 목표로 합니다.

## 프로젝트 목표

- `Component`, `Props`, `State`, `Hooks`를 단계적으로 설명한다.
- `Virtual DOM -> Diff -> Patch` 흐름을 눈으로 볼 수 있게 시각화한다.
- 학습자가 코드를 직접 수정하고 프리뷰를 확인하는 `Playground`를 제공한다.
- 마지막에는 여러 컴포넌트를 조립하는 워크숍 섹션까지 포함한다.

## 현재 구조

```text
src/
├── app.js                 # 페이지 진입점
├── framework/             # mini React 엔진 구현 영역
├── core/                  # 기존 VDOM 기본 모듈
├── diff/                  # 기존 diff 알고리즘
├── patch/                 # 기존 patch 적용 모듈
├── pages/                 # 학습 섹션 스텁
├── ui/                    # 레이아웃, playground, 블록 UI, diff 시각화
└── styles/main.css        # 학습 페이지 스타일
```

## 역할 분담

### A. 프레임워크 엔진

- `src/framework/createElement.js`
- `src/framework/component.js`
- `src/framework/hooks.js`
- `src/framework/reconciler.js`

핵심 책임:
- 함수형 컴포넌트 실행
- `useState`, `useEffect`, `useMemo`
- `setState -> render -> diff -> patch` 흐름 연결

### B. 학습 페이지 UI

- `src/app.js`
- `src/ui/layout.js`
- `src/ui/codePlayground.js`
- `src/ui/contentBlocks.js`
- `src/ui/diffVisualizer.js`
- `src/styles/main.css`
- `README.md`

핵심 책임:
- 전체 화면 구조
- 코드 에디터 + 라이브 프리뷰
- 교육용 블록 UI
- diff 시각화 패널
- 학습 페이지 스타일

### C. 학습 콘텐츠 + 테스트

- `src/pages/*`
- `tests/*`

핵심 책임:
- 섹션별 설명과 예제
- 직접 해보기 코드
- 챌린지 문제
- 프레임워크 및 통합 테스트

## 참고 문서

- [프로젝트 계획 문서](./docs/project-plan.md)
- [AI Convention 문서](./docs/AI%20Convention.md)

## 현재 진행 상태

- 학습 페이지 기본 레이아웃이 연결되어 있습니다.
- `pages` 폴더에는 섹션 스텁이 준비되어 있습니다.
- `ui` 폴더에는 B 역할용 공통 UI 모듈이 준비되어 있습니다.
- `framework` 폴더는 아직 본격 구현이 더 필요합니다.

## 실행 방향

현재는 외부 프레임워크를 쓰지 않고, **순수 JavaScript만으로 학습용 mini React를 구현하는 방향**을 유지합니다.

다음 큰 단계는 아래 순서로 진행하는 것이 가장 안전합니다.

1. `src/framework/*` 핵심 동작 구현
2. `src/ui/*` 와 framework 연결
3. `src/pages/*` 에 실제 학습 예제 삽입
4. `tests/*` 를 실제 검증 코드로 확장
