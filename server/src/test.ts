import { AsyncEnumerable } from './common/enumerable';
import { DeferredPromise, timeout } from './common/utils';

(async () => {
  const cancelPromise = new DeferredPromise();

  AsyncEnumerable.fromRange(0, 5)
    .interruptEvery(1)
    .cancelable(cancelPromise)
    .intercept(() => timeout(1000))
    .forEach((value) => {
      console.log(value);

      if (value == 1) {
        cancelPromise.resolve();
      }
    });
})();
