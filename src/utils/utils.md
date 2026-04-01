# Utils Folder Guide

`src/utils/`는 프로젝트 전반에서 재사용할 수 있는 작은 helper를 두는 폴더입니다.
현재는 의도적으로 아주 작게 유지되고 있고,
학습 페이지의 주 흐름을 직접 담당하는 폴더는 아닙니다.

## 현재 파일 구성

### `clone.js`

- `cloneDeep(value)`를 export한다.
- 우선 `structuredClone`을 사용하고,
  사용할 수 없는 환경이면 `JSON.parse(JSON.stringify(value))`로 fallback한다.

현재 구현의 특징은 아래와 같다.

- plain object / array 복제에는 충분하다.
- 함수, DOM Node, `undefined`, 순환 참조 같은 값은 JSON fallback에서 손실될 수 있다.
- 따라서 "학습용 데이터나 단순 patch 데이터 복제"에 더 적합하다.

### `logger.js`

- `patchSummary(patches = [])`를 export한다.
- patch 배열을 받아 타입별 개수를 문자열로 압축한다.

예시 출력은 이런 형태다.

```txt
TEXT:1, PROPS:2, REMOVE:1
```

patch가 없으면 `"변경 없음"`을 돌려준다.

## 현재 폴더의 상태

지금 `src/utils/`는 크기가 아주 작고,
핵심 렌더 경로나 챕터 조립의 중심에 있는 폴더는 아니다.

즉 현재 프로젝트에서는

- framework 핵심은 `src/framework/`
- DOM 렌더와 patch는 `src/core/`, `src/diff/`, `src/patch/`
- 화면 계층은 `src/ui/`
- 학습 본문은 `src/pages/`

이고, `src/utils/`는 그 사이에서 공용 로직이 생겼을 때만 최소한으로 추가하는 위치다.

## 새 util을 추가할 때 기준

- 두 군데 이상에서 반복되는가
- 특정 챕터 내용보다 범용 helper에 가까운가
- framework 로직과 UI 로직 어느 한쪽에 강하게 묶이지 않는가
- 파일을 따로 뺄 만큼 이름과 책임이 분명한가

## 이 폴더에 넣지 않는 편이 좋은 것

- 특정 섹션에서만 쓰는 임시 helper
- 학습용 문장 조립 함수
- 한 파일 안에서만 쓰는 작은 카드 생성 함수
- framework 내부 구현 세부사항

그런 로직은 지금 구조상 원래 파일 안에 두는 편이 더 읽기 쉽다.

## 요약

현재 `src/utils/`는 "작지만 범용적인 helper를 위한 폴더"입니다.
아직 큰 역할을 갖고 있지는 않지만,
공용 로직을 무리하게 아무 폴더에나 섞지 않도록 구조를 잡아 주는 안전지대 역할을 합니다.
