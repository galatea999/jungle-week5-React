// ============================================================
// practicePlayground.js — pages 폴더에서 재사용하는 playground 카드 helper
// ============================================================
//
// 역할 C가 만든 starter code를 역할 B의 codePlayground에 붙일 때
// 카드 껍데기와 공통 실행 흐름이 반복된다.
//
// 이 helper는 그 반복을 한 곳에 모아서,
// 각 섹션 파일은 "어떤 제목과 어떤 starter code를 넣을지"에만
// 집중할 수 있게 도와준다.
// ============================================================

import { createPlayground } from '../ui/codePlayground.js';

// ------------------------------------------------------------
// createPracticePlaygroundCard(options)
// ------------------------------------------------------------
// 학습 섹션 안에 바로 넣을 수 있는 "직접 해보기" 카드를 만든다.
// section DOM이 문서에 붙기 전에도 미리 run()을 호출해 두면,
// 사용자가 챕터를 열었을 때 바로 초기 결과를 볼 수 있다.
// ------------------------------------------------------------
export function createPracticePlaygroundCard(options = {}) {
  const {
    title = '직접 해보기',
    fileName = 'Practice.js',
    description = '코드를 바꾸고 실행 버튼을 눌러 결과 변화를 확인해 보세요.',
    initialCode = '',
    showVdom = false,
  } = options;

  const article = document.createElement('article');
  const heading = document.createElement('h3');

  article.className = 'panel-card learning-subsection';
  heading.textContent = title;
  article.appendChild(heading);

  const playground = createPlayground({
    title: fileName,
    description,
    initialCode,
    showVdom,
  });

  article.appendChild(playground.element);

  queueMicrotask(() => {
    playground.run();
  });

  return article;
}
