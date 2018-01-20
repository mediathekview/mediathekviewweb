export function sleep(ms: number): Promise<void> {
  return new Promise<void>((resolve, reject) => {
    setTimeout(() => resolve(), ms);
  });
}

export function interrupt(): Promise<void> {
  return new Promise<void>((resolve, reject) => {
    setImmediate(() => resolve());
  });
}