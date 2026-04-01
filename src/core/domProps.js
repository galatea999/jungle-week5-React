// DOM props를 실제 DOM 속성과 이벤트 listener에 맞게 적용하는 공용 helper다.
// renderVdom(초기 렌더)와 applyPatch(업데이트)가 같은 규칙을 쓰도록 한 곳에 모은다.

const LISTENER_STORE_KEY = '__miniReactListeners';

export function setDomProp(element, name, value) {
  if (!element || element.nodeType !== Node.ELEMENT_NODE) {
    return;
  }

  if (isEventProp(name)) {
    setEventListener(element, name, value);
    return;
  }

  if (value == null || value === false) {
    removeDomProp(element, name);
    return;
  }

  if (name === 'className') {
    element.className = String(value);
    return;
  }

  if (name === 'style' && typeof value === 'object') {
    applyStyleObject(element, value);
    return;
  }

  if (name === 'value') {
    element.value = String(value);
    element.setAttribute(name, String(value));
    return;
  }

  if (name === 'checked' || name === 'selected') {
    element[name] = Boolean(value);

    if (value) {
      element.setAttribute(name, '');
    } else {
      element.removeAttribute(name);
    }

    return;
  }

  if (value === true) {
    element.setAttribute(name, '');
    return;
  }

  element.setAttribute(name, String(value));
}

export function removeDomProp(element, name) {
  if (!element || element.nodeType !== Node.ELEMENT_NODE) {
    return;
  }

  if (isEventProp(name)) {
    removeEventListener(element, name);
    return;
  }

  if (name === 'className') {
    element.className = '';
    return;
  }

  if (name === 'style') {
    element.removeAttribute('style');
    return;
  }

  if (name === 'value') {
    element.value = '';
    element.removeAttribute(name);
    return;
  }

  if (name === 'checked' || name === 'selected') {
    element[name] = false;
    element.removeAttribute(name);
    return;
  }

  element.removeAttribute(name);
}

function isEventProp(name) {
  return /^on[a-z]+$/i.test(name);
}

function setEventListener(element, propName, handler) {
  const eventName = propName.slice(2).toLowerCase();
  const listeners = getListenerStore(element);
  const previousHandler = listeners[eventName];

  if (previousHandler) {
    element.removeEventListener(eventName, previousHandler);
  }

  if (typeof handler === 'function') {
    element.addEventListener(eventName, handler);
    listeners[eventName] = handler;
    return;
  }

  delete listeners[eventName];
}

function removeEventListener(element, propName) {
  const eventName = propName.slice(2).toLowerCase();
  const listeners = getListenerStore(element);
  const previousHandler = listeners[eventName];

  if (previousHandler) {
    element.removeEventListener(eventName, previousHandler);
    delete listeners[eventName];
  }
}

function getListenerStore(element) {
  if (!element[LISTENER_STORE_KEY]) {
    element[LISTENER_STORE_KEY] = {};
  }

  return element[LISTENER_STORE_KEY];
}

function applyStyleObject(element, styleObject) {
  element.removeAttribute('style');

  for (const [property, value] of Object.entries(styleObject)) {
    if (value == null || value === false) {
      element.style[property] = '';
      continue;
    }

    element.style[property] = value;
  }
}
