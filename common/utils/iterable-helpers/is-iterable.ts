export function isIterable(obj: any) {
  if (obj == null || obj == undefined) {
    return false;
  }
  
  return typeof obj[Symbol.iterator] === 'function';
}
