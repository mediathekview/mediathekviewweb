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

  const result: { [key: string]: any } = {};

  const properties = Object.getOwnPropertyNames(obj);
  for (const property of properties) {
    result[property] = destroyPrototype(obj[property]);
  }

  return result;
}