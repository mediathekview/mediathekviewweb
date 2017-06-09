import * as Comperator from './comperator';

export interface IView<T> {
  do(obj: any): T;
}

export class ArrayAnyView implements IView<boolean> {
  arrayProperty: string;
  property: string;
  comperator: Comperator.IComperator
  values: any[];

  constructor(options: { arrayProperty?: string, property?: string, comperator: Comperator.IComperator, values: any[] }) {
    this.arrayProperty = options.arrayProperty;
    this.property = options.property;
    this.comperator = options.comperator;
    this.values = options.values;
  }

  do(obj: any): boolean {
    let array = getProperty<any[]>(obj, this.arrayProperty);

    for (let i = 0; i < array.length; i++) {
      for (let j = 0; j < this.values.length; j++) {
        let propertyValue = getProperty(array[i], this.property);

        if (this.comperator.compare(propertyValue, this.values[j])) {
          return true;
        }
      }
    }

    return false;
  }
}

function getProperty<T>(obj: any, property: string | string[]): T {
  if (property == null || property == undefined) {
    return obj;
  }

  let propertySplit = Array.isArray(property) ? property : property.split('.').filter((prop) => prop.length > 0);

  if (propertySplit.length == 0) {
    return obj;
  }

  let item = obj[propertySplit[0]];
  for (let i = 1; i < propertySplit.length; i++) {
    item = item[propertySplit[i]];
  }

  return item;
}
