// ============================================================
// hooks.js - useState, useEffect, useMemo
// ============================================================
//
// 함수형 컴포넌트는 매번 다시 실행되지만,
// hooks 배열 덕분에 이전 상태와 계산 결과를 기억할 수 있다.
// ============================================================

import { currentComponent, currentRenderPhase } from './component.js';

// 이번 프로젝트에서는 hook을 루트 FunctionComponent에서만 사용한다.
// 자식 컴포넌트는 state를 직접 가지지 않고 props만 받아 그리는 순수 함수로 둔다.

// ============================================================
// useState(initialValue)
// ============================================================
// 상태를 저장하고, setter를 통해 다시 그리게 만든다.
// ============================================================
export function useState(initialValue) {
  const component = getCurrentComponent('useState');
  const idx = component.hookIndex++;

  if (component.hooks[idx] === undefined) {
    // 첫 렌더링에서만 초기값을 채우고,
    // 이후 렌더링부터는 같은 칸의 이전 값을 그대로 재사용한다.
    component.hooks[idx] = initialValue;
  }

  const setState = (newValue) => {
    const previousValue = component.hooks[idx];
    const nextValue =
      typeof newValue === 'function' ? newValue(previousValue) : newValue;

    if (Object.is(previousValue, nextValue)) {
      return previousValue;
    }

    component.hooks[idx] = nextValue;
    component.update();
    return nextValue;
  };

  return [component.hooks[idx], setState];
}

// ============================================================
// useEffect(callback, deps)
// ============================================================
// 렌더링이 끝난 뒤 실행할 작업을 등록한다.
// 실제 실행은 component.js의 runEffects()가 담당한다.
// ============================================================
export function useEffect(callback, deps) {
  const component = getCurrentComponent('useEffect');
  const idx = component.hookIndex++;
  const previousHook = component.hooks[idx];

  const shouldRun =
    deps === undefined ||
    !previousHook ||
    previousHook.type !== 'effect' ||
    depsChanged(previousHook.deps, deps);

  component.hooks[idx] = {
    type: 'effect',
    callback,
    deps,
    cleanup:
      previousHook && previousHook.type === 'effect' ? previousHook.cleanup : null,
    needsRun: shouldRun,
  };
}

// ============================================================
// useMemo(factory, deps)
// ============================================================
// 비싼 계산 결과를 기억해 두었다가,
// deps가 바뀔 때만 다시 계산한다.
// ============================================================
export function useMemo(factory, deps) {
  const component = getCurrentComponent('useMemo');
  const idx = component.hookIndex++;
  const previousHook = component.hooks[idx];

  const shouldRecompute =
    deps === undefined ||
    !previousHook ||
    previousHook.type !== 'memo' ||
    depsChanged(previousHook.deps, deps);

  if (shouldRecompute) {
    component.hooks[idx] = {
      type: 'memo',
      value: factory(),
      deps,
    };
  }

  return component.hooks[idx].value;
}

// ============================================================
// depsChanged(prevDeps, nextDeps)
// ============================================================
// 의존성 배열이 바뀌었는지 확인한다.
// ============================================================
export function depsChanged(prevDeps, nextDeps) {
  if (!prevDeps || !nextDeps) return true;
  if (prevDeps.length !== nextDeps.length) return true;

  return prevDeps.some((dep, index) => !Object.is(dep, nextDeps[index]));
}

// hook은 "지금 어느 컴포넌트를 렌더링 중인가?"를 알아야
// hooks 배열의 어느 칸을 읽고 써야 하는지 결정할 수 있다.
// 그래서 render()가 currentComponent를 설정해 두고,
// 각 hook은 이 helper를 통해 현재 주인을 가져온다.
function getCurrentComponent(hookName) {
  if (currentRenderPhase === 'child') {
    // 이번 프로젝트 규칙:
    // 자식 컴포넌트는 state를 직접 가지지 않고 props만 사용한다.
    throw new Error(
      `${hookName} can only be used in the root component. Child components in this project must use props only.`
    );
  }

  if (!currentComponent) {
    throw new Error(`${hookName} must be called while the root component is rendering.`);
  }

  return currentComponent;
}
