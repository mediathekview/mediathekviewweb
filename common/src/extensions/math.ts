interface Math {
  average(...values: number[]): number;
}

function average(...values: number[]): number {
  const total = values.reduce((previous, current) => previous + current, 0);
  const average = total / values.length;

  return average;
}

if (Math.average == undefined) {
  Math.average = average;
}