# Tests

이 폴더는 아직 "자동 실행 테스트"보다 "테스트 설계와 설명"에 더 가깝습니다.  
즉, 현재 단계에서는 실제 assertion을 돌리기보다 무엇을 검증해야 하는지와 그 흐름을 먼저 정리해 둔 상태입니다.

## 포함된 파일

- `framework.test.html`
브라우저에서 테스트 시나리오를 읽기 좋게 보여주는 뷰어입니다.

- `component.test.js`
컴포넌트 mount, props 변경, text node 처리 같은 기본 동작 시나리오를 담고 있습니다.

- `hooks.test.js`
`useState`, `useEffect`, `useMemo`의 대표 동작과 검증 포인트를 정리한 시나리오 파일입니다.

- `integration.test.js`
framework, render, playground가 함께 붙었을 때 확인해야 할 통합 흐름을 정리한 파일입니다.

- `tests.md`
이 폴더의 사용법, 동작 과정, 확장 방법을 더 자세히 설명하는 문서입니다.

## 지금 할 수 있는 것

- 브라우저에서 `framework.test.html`을 열어 현재 준비된 테스트 시나리오를 확인하기
- 각 `.test.js` 파일에서 어떤 상황을 검증하려는지 읽고 실제 assertion 초안으로 옮기기
- 역할 A/B 구현이 진행되면 `nextStep` 항목을 따라 실제 테스트 코드로 전환하기

## 다음 단계

- 각 시나리오를 실제 assertion 테스트로 교체
- framework 구현 완료 후 브라우저/모듈 테스트 실행 환경 연결
- playground와 preview가 붙는 시점에 통합 테스트 자동화 확장
