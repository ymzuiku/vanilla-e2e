// eslint-disable-next-line @typescript-eslint/no-explicit-any
export function debounce(callback: any, wait: number) {
  let id: NodeJS.Timeout;
  // eslint-disable-next-line @typescript-eslint/no-explicit-any
  return (...args: any[]) => {
    clearTimeout(id);
    id = setTimeout(() => {
      callback(...args);
    }, wait);
  };
}

// eslint-disable-next-line @typescript-eslint/no-explicit-any
export function getClientX(event: any): number {
  const touches = event.touches;
  if (touches && touches[0]) {
    return touches[0].clientX;
  }
  return event.clientX;
}

// eslint-disable-next-line @typescript-eslint/no-explicit-any
export function getClientY(event: any): number {
  const touches = event.touches;
  if (touches && touches[0]) {
    return touches[0].clientY;
  }
  return event.clientY;
}

// eslint-disable-next-line @typescript-eslint/no-explicit-any
export function listenResize(event: () => any) {
  const fn = debounce(event, 500);
  window.addEventListener("resize", () => {
    fn();
  });
}
