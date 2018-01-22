import { AsyncEnumerable } from '../common/enumerable/async-enumerable';
import { interruptPerSecond } from '../utils';

declare module '../common/enumerable/async-enumerable' {
  interface AsyncEnumerable<T> {
    interruptPerSecond(value: number): AsyncEnumerable<T>;
  }
}

function interruptPerSecondFunction<T>(this: AsyncEnumerable<T>, value: number): AsyncEnumerable<T> {
  const interrupted = interruptPerSecond(this, value);
  return new AsyncEnumerable(interrupted);
}

AsyncEnumerable.prototype.interruptPerSecond = interruptPerSecondFunction;
