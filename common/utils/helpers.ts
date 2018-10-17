export function getGetter<T>(obj: Object, property: string, bind: boolean): () => T {
  if (!(property in obj)) {
    throw new Error(`property ${property} does not exist`);
  }

  let objOrPrototype: Object = obj;

  while (!objOrPrototype.hasOwnProperty(property)) {
    objOrPrototype = Object.getPrototypeOf(objOrPrototype);
  }

  const descriptor = Object.getOwnPropertyDescriptor(objOrPrototype, property) as PropertyDescriptor;

  if (descriptor.get == undefined) {
    throw new Error(`property ${property} has no getter`);
  }

  let getter = descriptor.get;

  if (bind) {
    getter = getter.bind(obj);
  }

  return getter;
}

export function now(): Date {
  return new Date();
}

export function destroyPrototype(obj: any): any {
  const type = typeof obj;

  if (type == 'string' || type == 'number' || type == 'boolean' || type == 'undefined' || type == 'function'
    || obj == null || obj instanceof Date || obj instanceof RegExp) {
    return obj;
  }

  const result: StringMap = {};

  const properties = Object.getOwnPropertyNames(obj);
  for (const property of properties) {
    result[property] = destroyPrototype(obj[property]);
  }

  return result;
}

export function throttleFunction(func: () => void, interval: number): () => void
export function throttleFunction<T>(func: (arg: T) => void, interval: number): (arg: T) => void
export function throttleFunction<T1, T2>(func: (arg1: T1, arg2: T2) => void, interval: number): (arg1: T1, arg2: T2) => void
export function throttleFunction<T1, T2, T3>(func: (arg1: T1, arg2: T2, arg3: T3) => void, interval: number): (arg1: T1, arg2: T2, arg3: T3) => void
export function throttleFunction<T1, T2, T3, T4>(func: (arg1: T1, arg2: T2, arg3: T3, arg4: T4) => void, interval: number): (arg1: T1, arg2: T2, arg3: T3, arg4: T4) => void
export function throttleFunction(func: (...args: any[]) => void, interval: number): (...args: any[]) => void {
  let lastCall = 0;
  let nextArguments: any[];
  let callPending = false;

  const throttled = (...args: any[]) => {
    nextArguments = args;

    const nextAllowedCall = lastCall + interval;
    const now = Date.now();

    if (now >= nextAllowedCall) {
      lastCall = now;
      func(...nextArguments);
      callPending = false;
    } else if (!callPending) {
      const delay = nextAllowedCall - now;
      setTimeout(() => throttled(...nextArguments), delay);
      callPending = true;
    }
  };

  return throttled;
}

export function objectToDotNotation(_obj: object): StringMap {
  throw new Error('not implemented');
}

export function formatDuration(milliseconds: number, precision: number): string {
  let value: number;
  let suffix: string;

  if (milliseconds >= (10 ** 3)) {
    value = milliseconds / (10 ** 3);
    suffix = 's';
  } else if (milliseconds >= 1) {
    value = milliseconds;
    suffix = 'ms';
  } else if (milliseconds >= 1 / (10 ** 3)) {
    value = milliseconds * (10 ** 3);
    suffix = 'us';
  } else {
    value = milliseconds * (10 ** 6);
    suffix = 'ns';
  }

  const trimmed = parseFloat(value.toFixed(precision));
  const result = `${trimmed} ${suffix}`;

  return result;
}

export function formatError(error: Error, includeStack: boolean): string {
  const stackMessage = (includeStack && (error.stack != null)) ? `\n${error.stack}` : '';
  return `${error.name}: ${error.message}${stackMessage}`;
}
