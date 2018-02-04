import { HighPrecisionTimer } from './high-precision-timer';
import { getGetter } from '../common/utils';

const millisecondsPerTimerRead = measureTimerOverhead(3);

export type BenchmarkResult = { operationsPerMillisecond: number, millisecondsPerOperation: number };

export function benchmark(runs: number, func: (...args: any[]) => any, ...parameters: any[]): BenchmarkResult {
  const timer = new HighPrecisionTimer(true);

  for (let i = 0; i < runs; i++) {
    func(...parameters);
  }

  return calculateResult(runs, timer.milliseconds);
}

export function timedBenchmark(ms: number, func: (...args: any[]) => any, ...parameters: any[]): BenchmarkResult {
  const timer = new HighPrecisionTimer(true);

  let runs = 0;
  do {
    func(...parameters);
    runs++;
  }
  while (timer.milliseconds < ms);

  return calculateTimedResult(runs, timer.milliseconds);
}

export async function benchmarkAsync(runs: number, func: (...args: any[]) => Promise<any>, ...parameters: any[]): Promise<BenchmarkResult> {
  const timer = new HighPrecisionTimer(true);

  for (let i = 0; i < runs; i++) {
    await func(...parameters);
  }

  return calculateResult(runs, timer.milliseconds);
}

export async function timedBenchmarkAsync(ms: number, func: (...args: any[]) => Promise<any>, ...parameters: any[]): Promise<BenchmarkResult> {
  const timer = new HighPrecisionTimer(true);

  let runs = 0;
  do {
    await func(...parameters);
    runs++;
  }
  while (timer.milliseconds < ms);

  return calculateTimedResult(runs, timer.milliseconds);
}

function calculateTimedResult(runs: number, time: number): BenchmarkResult {
  const correctedTime = time - (millisecondsPerTimerRead * runs);
  return calculateResult(runs, correctedTime);
}

function calculateResult(runs: number, time: number): BenchmarkResult {
  const operationsPerMillisecond = runs / time;
  const millisecondsPerOperation = time / runs;

  return {
    operationsPerMillisecond: operationsPerMillisecond,
    millisecondsPerOperation: millisecondsPerOperation
  };
}

function measureTimerOverhead(runs: number) {
  const timer = new HighPrecisionTimer(true);
  const millisecondsGetter = getGetter<number>(timer, 'milliseconds', true);

  const results: number[] = [];

  runs += 1; //because first is skipped
  for (let i = 0; i < runs; i++) {
    const result = benchmark(1000000, millisecondsGetter);

    if (i > 0) {
      results.push(result.millisecondsPerOperation);
    }
  }

  const sum = results.reduce((previous, current) => previous + current, 0);
  const average = sum / results.length;

  return average;
}
