export type Nullable<T> = T | null;

export function random(min: number, max: number, integer: boolean = false) {
  const value = (Math.random() * (max - min)) + min;
  return integer ? Math.floor(value) : value;
}

export function sleep(ms: number): Promise<void> {
  return new Promise<void>((resolve, reject) => {
    setTimeout(() => resolve(), ms);
  });
}
