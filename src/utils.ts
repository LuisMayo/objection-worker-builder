export function randomElementFromArr<T>(arr: T[]): T {
  return randomElementAndIdxFromArr(arr).element;
}

export function randomElementAndIdxFromArr<T>(arr: T[]): {
  element: T;
  idx: number;
} {
  const idx = Math.floor(Math.random() * arr.length);
  return { element: arr[idx], idx };
}

export function wait(ms: number) {
  return new Promise((resolve) => {
    setTimeout(resolve, ms);
  });
}