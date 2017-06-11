import * as Comperator from './comperator';
import { Utils } from './utils';

export interface IMapping {
  apply(source: object, destination: object): object;
}

export interface IMapper<T> {
  map(value: any): T;
}

export abstract class MappingBase<T> implements IMapping, IMapper<T> {
  sourceProperty: string;
  destinationProperty: string;

  constructor(sourceProperty: string, destinationProperty?: string) {
    this.sourceProperty = sourceProperty;
    this.destinationProperty = !!destinationProperty ? destinationProperty : sourceProperty;
  }

  abstract map(value: any): T;

  apply(source: object, destination: object): object {
    let value = Utils.getProperty<any[]>(source, this.sourceProperty);

    let mappedValue = this.map(source);
    Utils.setProperty(destination, this.destinationProperty, mappedValue);

    return destination;
  }
}

export class CloneMapping implements IMapping {
  apply(source: object, destination: object): object {
    return Object.assign(destination, source);
  }
}

export class DirectMapping implements IMapping {
  properties: string[];

  constructor(...properties: string[]) {
    this.properties = properties;
  }

  apply(source: object, destination: object): object {
    for (let i = 0; i < this.properties.length; i++) {
      let value = Utils.getProperty(source, this.properties[i]);
      Utils.setProperty(destination, this.properties[i], value);
    }

    return destination;
  }
}

export class ArrayAnyMapping extends MappingBase<boolean> implements IMapper<boolean> {
  subProperty: string;
  comperator: Comperator.IComperator;
  values: any[];

  constructor(arrayProperty: string, destinationProperty: string, options: { subProperty?: string, comperator: Comperator.IComperator, values: any[] }) {
    super(arrayProperty, destinationProperty);
    this.subProperty = options.subProperty;
    this.comperator = options.comperator;
    this.values = options.values;
  }

  map(array: any[]): boolean {
    for (let i = 0; i < array.length; i++) {
      for (let j = 0; j < this.values.length; j++) {
        let propertyValue = Utils.getProperty(array[i], this.subProperty);

        if (this.comperator.compare(propertyValue, this.values[j])) {
          return true;
        }
      }
    }

    return false;
  }
}
