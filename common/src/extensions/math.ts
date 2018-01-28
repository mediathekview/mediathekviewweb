interface Math {
  average(...values: number[]): number;
  precisionRound(value: number, precision: number): number;
}

function average(...values: number[]): number {
  const total = values.reduce((previous, current) => previous + current, 0);
  const average = total / values.length;

  return average;
}

function precisionRound(number, precision): number {
  const factor = Math.pow(10, precision);
  return Math.round(number * factor) / factor;
}

if (Math.average == undefined) {
  Math.average = average;
}

if (Math.precisionRound == undefined) {
  Math.precisionRound = precisionRound;
}
