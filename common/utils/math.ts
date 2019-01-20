export function random(min: number, max: number, integer: boolean = false): number {
  const value = (Math.random() * (max - min)) + min;
  return integer ? Math.round(value) : value;
}

export function average(...values: number[]): number {
  const total = values.reduce((previous, current) => previous + current, 0);
  const average = total / values.length;

  return average;
}

export function precisionRound(value: number, precision: number): number {
  const factor = Math.pow(10, precision);
  return Math.round(value * factor) / factor;
}
