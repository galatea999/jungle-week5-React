// ============================================================
// codePlayground.js — 코드 에디터와 라이브 프리뷰를 만드는 파일
// ============================================================
//
// 이 파일의 목표는 "읽기만 하는 페이지"를
// "직접 만져 보는 페이지"로 바꾸는 것이다.
// 학생이 코드를 바꾸고 실행 버튼을 누르면
// 오른쪽 프리뷰가 바로 달라지는 구조를 만든다.
// ============================================================

// 미니 React 쪽 공개 API를 가져온다.
// 아직 구현이 덜 끝났더라도 호출 자리는 먼저 맞춰 둔다.
import { h } from '../framework/createElement.js';
import { useState, useEffect, useMemo } from '../framework/hooks.js';
import { renderApp as frameworkRenderApp } from '../framework/reconciler.js';

// static VDOM 결과를 바로 그릴 수 있게 core 렌더러도 함께 가져온다.
import { renderVdom } from '../core/renderVdom.js';

// 결과가 VNode인지 간단히 확인할 수 있게 검사 함수를 가져온다.
import { isVNode } from '../core/vnode.js';

// ------------------------------------------------------------
// createPlayground(options)
// ------------------------------------------------------------
// 코드 에디터, 버튼, 프리뷰를 한 덩어리로 묶어 만드는 함수다.
// ------------------------------------------------------------
export function createPlayground(options = {}) {
  // 옵션이 비어 있어도 안전하게 동작하도록 기본값을 준비한다.
  const {
    // 에디터 처음 글자다.
    initialCode = '',
    // 에디터 위쪽 탭에 보일 이름이다.
    title = 'Example.js',
    // 아래쪽 설명 글이다.
    description = '',
    // 읽기 전용 모드인지 여부다.
    readOnly = false,
    // VDOM 보기 칸을 함께 보여 줄지 여부다.
    showVdom = false,
    // 에디터 위, 프리뷰 아래로 세로 배치할지 여부다.
    stacked = false,
    // 실행 전에 바깥에서 별도 처리를 하고 싶을 때 쓰는 훅이다.
    onRun = null,
  } = options;

  // 전체 playground 바깥 상자를 만든다.
  const element = document.createElement('section');
  // CSS에서 2열 playground처럼 꾸미기 위한 클래스다.
  element.className = 'playground';

  // 오른쪽 rail처럼 좁은 공간에서는 세로 배치가 더 읽기 쉽다.
  if (stacked) {
    element.classList.add('playground-stacked');
  }

  // 왼쪽 에디터 칸을 만든다.
  const editorPanel = document.createElement('div');
  // CSS에서 에디터 패널처럼 꾸미기 위한 클래스다.
  editorPanel.className = 'playground-editor';

  // 파일 이름을 보여 줄 에디터 머리글이다.
  const editorHeader = document.createElement('div');
  // CSS에서 검은 탭처럼 꾸미기 위한 클래스다.
  editorHeader.className = 'playground-header';
  // 파일 이름을 그대로 넣는다.
  editorHeader.textContent = title;

  // 실제 코드를 쓰는 textarea를 만든다.
  const editor = createEditorTextarea(initialCode, readOnly);

  // 버튼들을 모을 줄을 만든다.
  const editorActions = document.createElement('div');
  // CSS에서 버튼 간격을 잡기 위한 클래스다.
  editorActions.className = 'playground-actions';

  // 실행 버튼을 만든다.
  const runButton = document.createElement('button');
  // 버튼 문구를 넣는다.
  runButton.textContent = '실행';

  // 초기화 버튼을 만든다.
  const resetButton = document.createElement('button');
  // 버튼 문구를 넣는다.
  resetButton.textContent = '초기화';

  // 왼쪽 패널에는 제목, textarea, 버튼 줄을 차례대로 넣는다.
  editorActions.append(runButton, resetButton);
  editorPanel.append(editorHeader, editor, editorActions);

  // 오른쪽 프리뷰 칸을 만든다.
  const previewPanel = document.createElement('div');
  // CSS에서 프리뷰 패널처럼 꾸미기 위한 클래스다.
  previewPanel.className = 'playground-preview';

  // 프리뷰 머리글을 만든다.
  const previewHeader = document.createElement('div');
  // CSS 클래스 이름을 붙인다.
  previewHeader.className = 'playground-header';
  // 사용자에게 이 영역이 결과 화면임을 알려 준다.
  previewHeader.textContent = '라이브 프리뷰';

  // 실제 결과가 들어갈 상자를 만든다.
  const preview = document.createElement('div');
  // CSS에서 결과 화면처럼 꾸미기 위한 클래스다.
  preview.className = 'preview-container';

  // 코드 실행 전에는 빈 상태 안내를 먼저 보여 준다.
  showInfo(preview, '코드를 실행하면 결과가 이곳에 표시됩니다.');

  // 프리뷰 아래 설명 글 상자를 만든다.
  const descriptionBox = document.createElement('p');
  // CSS에서 작은 안내 글처럼 보이게 할 클래스다.
  descriptionBox.className = 'playground-description';
  // description이 없으면 빈 문자열로 둔다.
  descriptionBox.textContent = description;

  // VDOM 뷰어를 담을 칸 변수다.
  let vdomViewer = null;

  // showVdom이 true일 때만 VDOM 박스를 추가한다.
  if (showVdom) {
    // 읽기 전용 JSON/텍스트 상자를 만든다.
    vdomViewer = document.createElement('pre');
    // CSS에서 검은 코드 박스처럼 꾸미기 위한 클래스다.
    vdomViewer.className = 'playground-vdom';
    // 아직 값이 없다는 안내 문구를 먼저 넣는다.
    vdomViewer.textContent = 'VDOM 정보는 실행 후 이곳에 표시됩니다.';
  }

  // 오른쪽 패널에는 제목, 프리뷰, 설명, 필요하면 VDOM 뷰어까지 넣는다.
  previewPanel.append(previewHeader, preview, descriptionBox);

  // VDOM 뷰어가 있으면 뒤에 추가한다.
  if (vdomViewer) {
    previewPanel.appendChild(vdomViewer);
  }

  // 전체 playground 안에는 왼쪽과 오른쪽 패널을 넣는다.
  element.append(editorPanel, previewPanel);

  // 실제 실행 로직을 함수 하나로 묶어 둔다.
  const run = () => {
    // 사용자가 실행 직전에 외부 훅을 달아 둔 경우 먼저 호출한다.
    if (typeof onRun === 'function') {
      // 현재 코드와 주요 요소를 같이 넘겨 준다.
      onRun({
        code: editor.value,
        editor,
        preview,
        vdomViewer,
      });
    }

    // 실제 코드 실행 함수에 현재 코드를 넘긴다.
    executeCode(editor.value, preview, {
      // 원래 옵션도 함께 넘기고,
      ...options,
      // VDOM 뷰어 참조도 같이 넘긴다.
      vdomViewer,
    });
  };

  // 초기화 동작도 별도 함수로 묶는다.
  const reset = () => {
    // textarea 내용을 처음 코드로 되돌린다.
    editor.value = initialCode;
    // 높이도 다시 맞춘다.
    resizeEditor(editor);
    // 프리뷰도 안내 상태로 되돌린다.
    showInfo(preview, '코드가 초기화되었습니다. 다시 실행 버튼을 눌러 보세요.');
    // VDOM 뷰어가 있으면 이쪽도 초기 문구로 되돌린다.
    if (vdomViewer) {
      vdomViewer.textContent = 'VDOM 정보는 실행 후 이곳에 표시됩니다.';
    }
  };

  // 실행 버튼을 누르면 run 함수를 부른다.
  runButton.addEventListener('click', run);
  // 초기화 버튼을 누르면 reset 함수를 부른다.
  resetButton.addEventListener('click', reset);

  // 외부에서 바로 쓸 수 있도록 주요 기능과 요소를 함께 반환한다.
  return {
    // 완성된 playground DOM이다.
    element,
    // textarea 자체도 필요할 수 있어서 같이 돌려준다.
    editor,
    // 결과 화면 상자다.
    preview,
    // VDOM 뷰어도 같이 넘긴다.
    vdomViewer,
    // 현재 코드를 실행하는 함수다.
    run,
    // 초기 상태로 되돌리는 함수다.
    reset,
    // 현재 textarea 글자를 가져오는 함수다.
    getCode() {
      // 지금 editor에 들어 있는 코드를 반환한다.
      return editor.value;
    },
  };
}

// ------------------------------------------------------------
// executeCode(code, previewContainer, options)
// ------------------------------------------------------------
// textarea에 적힌 코드를 실제로 실행하고 결과를 프리뷰에 넣는다.
// ------------------------------------------------------------
function executeCode(code, previewContainer, options = {}) {
  // VDOM 뷰어가 있으면 여기서 함께 다룬다.
  const { vdomViewer = null } = options;

  // 실행 전에는 이전 결과를 깨끗하게 비운다.
  previewContainer.replaceChildren();

  // VDOM 뷰어가 있으면 이전 실행 결과도 지운다.
  if (vdomViewer) {
    // 새 결과가 나오기 전이니 비워 둔다.
    vdomViewer.textContent = '실행 중입니다...';
  }

  try {
    // 사용자가 작성한 코드를 함수로 감싼다.
    // 필요한 API만 매개변수로 넣어 주면 코드 안에서 바로 쓸 수 있다.
    const runnable = new Function(
      // mini React에서 쓸 함수들이다.
      'h',
      'useState',
      'useEffect',
      'useMemo',
      'renderApp',
      // 프리뷰 DOM과 직접 결과를 붙이는 helper도 같이 준다.
      'previewContainer',
      'mountResult',
      // sourceURL을 넣어 두면 브라우저 에러 메시지가 조금 읽기 쉬워진다.
      `${code}\n//# sourceURL=playground-user-code.js`,
    );

    // 사용자가 코드를 실행한 뒤 반환한 값을 받을 변수다.
    const result = runnable(
      // createElement helper를 넘겨 준다.
      h,
      // useState를 넘겨 준다.
      useState,
      // useEffect를 넘겨 준다.
      useEffect,
      // useMemo를 넘겨 준다.
      useMemo,
      // renderApp은 안전 포장 버전으로 넘긴다.
      createSafeRenderApp(previewContainer),
      // 프리뷰 DOM 자체도 넘겨 준다.
      previewContainer,
      // 직접 결과를 붙이는 helper도 넘겨 준다.
      (value) => mountResult(value, previewContainer, vdomViewer),
    );

    // 함수가 값을 반환했으면 그 값을 화면에 붙일 수 있는지 검사한다.
    if (result !== undefined) {
      // 문자열, DOM 노드, VNode, 함수형 컴포넌트 등을 여기서 처리한다.
      mountResult(result, previewContainer, vdomViewer);
    }

    // 아무것도 렌더링되지 않았다면 친절한 안내 문장을 보여 준다.
    if (!previewContainer.hasChildNodes()) {
      showInfo(
        previewContainer,
        '코드는 실행됐지만 아직 화면에 그릴 결과가 없습니다. 프레임워크가 완성되면 renderApp(App, previewContainer)를 연결해 보세요.',
      );
    }
  } catch (error) {
    // 실행 중 에러가 나면 빨간 에러 박스로 보여 준다.
    showError(previewContainer, error);

    // VDOM 뷰어가 있으면 여기도 실패 문구로 바꿔 준다.
    if (vdomViewer) {
      vdomViewer.textContent = 'VDOM 정보를 표시하지 못했습니다.';
    }
  }
}

// ------------------------------------------------------------
// createSafeRenderApp(previewContainer)
// ------------------------------------------------------------
// 아직 framework 쪽이 완성되지 않았더라도
// playground가 완전히 터지지 않도록 감싸는 안전 wrapper다.
// ------------------------------------------------------------
function createSafeRenderApp(previewContainer) {
  // 실제로 사용자 코드에 넘겨 줄 함수를 반환한다.
  return function safeRenderApp(componentFn, container = previewContainer, props = {}) {
    // 컴포넌트는 함수여야 의미가 있으니 먼저 검사한다.
    if (typeof componentFn !== 'function') {
      // 잘못된 입력이면 바로 에러를 던진다.
      throw new Error('renderApp에는 함수형 컴포넌트를 넘겨야 합니다.');
    }

    // 실제 framework의 renderApp을 시도한다.
    const app = frameworkRenderApp(componentFn, container, props);

    // 호출 결과를 그대로 돌려준다.
    return app;
  };
}

// ------------------------------------------------------------
// mountResult(result, previewContainer, vdomViewer)
// ------------------------------------------------------------
// 실행 결과가 어떤 형태인지 보고 화면에 맞게 붙인다.
// ------------------------------------------------------------
function mountResult(result, previewContainer, vdomViewer) {
  // 결과가 null이나 undefined면 붙일 것이 없으니 종료한다.
  if (result == null) {
    return;
  }

  // 결과가 DOM 노드면 바로 붙일 수 있다.
  if (result instanceof Node) {
    // 기존 프리뷰 안에 결과 노드를 그대로 넣는다.
    previewContainer.replaceChildren(result);

    // DOM 노드는 VDOM 정보가 없으니 안내 문구를 넣는다.
    updateVdomViewer(vdomViewer, 'DOM 노드를 직접 반환한 예제라서 별도 VDOM 정보는 없습니다.');
    return;
  }

  // 결과가 숫자나 문자열이면 간단한 텍스트 카드로 감싼다.
  if (typeof result === 'string' || typeof result === 'number') {
    // 결과를 담을 작은 카드 박스를 만든다.
    const box = document.createElement('div');
    // CSS에서 결과 카드처럼 꾸미기 위한 클래스다.
    box.className = 'playground-result-card';
    // 문자열로 바꿔서 넣는다.
    box.textContent = String(result);
    // 프리뷰를 새 결과 카드 하나로 교체한다.
    previewContainer.replaceChildren(box);

    // 문자열 결과도 VDOM은 없으니 안내 문구를 넣는다.
    updateVdomViewer(vdomViewer, '문자열 결과를 반환한 예제입니다.');
    return;
  }

  // 결과가 VNode 구조면 core 렌더러로 실제 DOM으로 바꿔 그릴 수 있다.
  if (isVNode(result)) {
    // VNode를 실제 DOM 노드로 바꾼다.
    const rendered = renderVdom(result);
    // 프리뷰 화면에 그 결과를 붙인다.
    previewContainer.replaceChildren(rendered);
    // VDOM 뷰어에는 JSON 형태로 구조를 보여 준다.
    updateVdomViewer(vdomViewer, JSON.stringify(result, null, 2));
    return;
  }

  // 결과가 함수면 "컴포넌트 함수일 수 있다"고 보고 renderApp을 시도한다.
  if (typeof result === 'function') {
    // 안전 포장 renderApp을 만들어 가져온다.
    const renderApp = createSafeRenderApp(previewContainer);
    // 컴포넌트 함수를 프리뷰에 렌더링해 본다.
    renderApp(result, previewContainer);

    // 아직 framework가 미완성일 수 있어서 뷰어에는 안내 문장을 남긴다.
    updateVdomViewer(vdomViewer, '함수형 컴포넌트를 renderApp으로 실행했습니다. framework 구현이 이어지면 실제 화면과 VDOM 정보가 더 풍부해집니다.');
    return;
  }

  // 위 조건에 걸리지 않는 객체는 지금 바로 그리기 어렵다.
  // 그래서 어떤 타입을 받았는지 알려 주는 친절한 에러를 던진다.
  throw new Error('지금 playground는 DOM 노드, 문자열, VNode, 함수 반환만 바로 표시할 수 있습니다.');
}

// ------------------------------------------------------------
// updateVdomViewer(vdomViewer, text)
// ------------------------------------------------------------
// VDOM 뷰어가 있는 경우에만 내용을 바꾸는 작은 helper다.
// ------------------------------------------------------------
function updateVdomViewer(vdomViewer, text) {
  // VDOM 뷰어가 없으면 아무 일도 하지 않는다.
  if (!vdomViewer) return;

  // 뷰어 텍스트를 새 내용으로 교체한다.
  vdomViewer.textContent = text;
}

// ------------------------------------------------------------
// showError(container, error)
// ------------------------------------------------------------
// 코드 실행 중 에러가 발생했을 때 빨간 박스로 보여 준다.
// ------------------------------------------------------------
function showError(container, error) {
  // 바깥 에러 박스를 만든다.
  const box = document.createElement('div');
  // CSS에서 빨간 경고 박스처럼 보이게 하는 클래스다.
  box.className = 'error-box';

  // 에러 제목 줄을 만든다.
  const heading = document.createElement('strong');
  // 사용자에게 "실행 중 문제가 생겼다"는 걸 바로 알려 준다.
  heading.textContent = '에러가 발생했습니다.';

  // 실제 에러 메시지를 담을 pre 태그를 만든다.
  const pre = document.createElement('pre');
  // 에러 메시지가 없을 때도 비어 보이지 않게 기본 문구를 둔다.
  pre.textContent = error?.message || '알 수 없는 오류가 발생했습니다.';

  // 제목과 메시지를 박스 안에 넣는다.
  box.append(heading, pre);

  // 프리뷰를 에러 박스 하나로 교체한다.
  container.replaceChildren(box);
}

// ------------------------------------------------------------
// showInfo(container, message)
// ------------------------------------------------------------
// 실행 전 안내나 빈 결과 안내를 보여 주는 회색 박스를 만든다.
// ------------------------------------------------------------
function showInfo(container, message) {
  // 안내 박스를 만든다.
  const box = document.createElement('div');
  // CSS에서 부드러운 안내 박스처럼 꾸미기 위한 클래스다.
  box.className = 'playground-info';
  // 안내 문장을 넣는다.
  box.textContent = message;
  // 프리뷰를 안내 박스 하나로 교체한다.
  container.replaceChildren(box);
}

// ------------------------------------------------------------
// createEditorTextarea(initialCode, readOnly)
// ------------------------------------------------------------
// 코드 입력용 textarea를 만든다.
// Tab 들여쓰기와 자동 높이 조절도 여기서 함께 처리한다.
// ------------------------------------------------------------
function createEditorTextarea(initialCode, readOnly = false) {
  // textarea 요소를 만든다.
  const textarea = document.createElement('textarea');
  // CSS에서 코드 에디터처럼 꾸미기 위한 클래스다.
  textarea.className = 'editor-textarea';
  // 처음 코드를 넣는다.
  textarea.value = initialCode;
  // 읽기 전용 여부를 적용한다.
  textarea.readOnly = readOnly;
  // 자동 완성은 학습용 코드 입력에 방해가 될 수 있어 끈다.
  textarea.autocapitalize = 'off';
  // 맞춤법 빨간 줄도 끈다.
  textarea.spellcheck = false;

  // Tab 키를 눌렀을 때 포커스 이동 대신 공백을 넣는다.
  textarea.addEventListener('keydown', (event) => {
    // Tab 키가 아니면 평소 동작을 그대로 둔다.
    if (event.key !== 'Tab') return;

    // 기본 동작을 막아야 textarea 안에 탭을 넣을 수 있다.
    event.preventDefault();

    // 현재 커서 시작 위치를 가져온다.
    const start = textarea.selectionStart;
    // 현재 커서 끝 위치를 가져온다.
    const end = textarea.selectionEnd;
    // 선택된 부분 앞뒤를 기준으로 문자열을 나눈다.
    const before = textarea.value.slice(0, start);
    const after = textarea.value.slice(end);

    // 선택 영역 대신 공백 두 칸을 넣는다.
    textarea.value = `${before}  ${after}`;

    // 커서를 공백 두 칸 뒤로 옮긴다.
    textarea.selectionStart = textarea.selectionEnd = start + 2;

    // 글이 길어졌을 수 있으니 높이도 다시 맞춘다.
    resizeEditor(textarea);
  });

  // 글자가 바뀔 때마다 높이를 다시 계산한다.
  textarea.addEventListener('input', () => {
    // 줄 수가 바뀌면 높이를 맞춰 준다.
    resizeEditor(textarea);
  });

  // 처음 만들 때도 높이를 맞춰 둔다.
  resizeEditor(textarea);

  // 완성된 textarea를 반환한다.
  return textarea;
}

// ------------------------------------------------------------
// resizeEditor(textarea)
// ------------------------------------------------------------
// textarea 내용 길이에 맞춰 높이를 자동으로 조절한다.
// ------------------------------------------------------------
function resizeEditor(textarea) {
  // 먼저 높이를 auto로 돌려놔야 새 scrollHeight를 정확히 잴 수 있다.
  textarea.style.height = 'auto';
  // 너무 작거나 너무 커지지 않게 최소/최대 범위를 둔다.
  const nextHeight = Math.max(240, Math.min(textarea.scrollHeight, 640));
  // 계산한 높이를 실제 스타일에 넣는다.
  textarea.style.height = `${nextHeight}px`;
}
