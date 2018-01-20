export function isAsyncIterable(obj: any) {
  if (obj == null || obj == undefined) {
    return false;
  }

  return typeof obj[Symbol.asyncIterator] === 'function';
}