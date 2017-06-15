import * as Comperator from './comperator';
import { Analyzer } from './analyzing/analyzer';
import { Utils } from './utils';

export enum MapperType {
  Text,
  Int,
  Boolean
}

export interface IMapper<T extends string | number | boolean> {
  type: MapperType;
  map(item: any): T[];
}

export abstract class MapperBase<T extends string | number | boolean> implements IMapper<T> {
  type: MapperType;
  sourceProperty: string;

  constructor(type: MapperType, sourceProperty: string) {
    this.type = type;
    this.sourceProperty = sourceProperty;
  }

  abstract map(item: any): T[];
}

export class IntMapper extends MapperBase<number> implements IMapper<number> {
  constructor(sourceProperty: string) {
    super(MapperType.Int, sourceProperty);
  }

  map(item: any): number[] {
    return [Utils.getProperty<number>(item, this.sourceProperty)];
  }
}

export class TextMapper extends MapperBase<string> implements IMapper<string> {
  analyzer: Analyzer;

  constructor(sourceProperty: string, analyzer: Analyzer) {
    super(MapperType.Text, sourceProperty);

    this.analyzer = analyzer;
  }

  map(item: any): string[] {
    let text = Utils.getProperty<string>(item, this.sourceProperty);
    return this.analyzer.analyze(text);
  }
}

export class BooleanMapper extends MapperBase<boolean> implements IMapper<boolean> {
  constructor(sourceProperty: string) {
    super(MapperType.Boolean, sourceProperty);
  }

  map(item: any): boolean[] {
    return [Utils.getProperty<boolean>(item, this.sourceProperty)];
  }
}

export class ArrayAnyMapper extends BooleanMapper {
  subProperty: string;
  comperator: Comperator.IComperator;
  values: any[];

  constructor(arrayProperty: string, subProperty: string, comperator: Comperator.IComperator, values: any[]) {
    super(arrayProperty);
    this.subProperty = subProperty;
    this.comperator = comperator;
    this.values = values;
  }

  map(item: any): boolean[] {
    let array = Utils.getProperty<any[]>(item, this.sourceProperty);

    for (let i = 0; i < array.length; i++) {
      for (let j = 0; j < this.values.length; j++) {
        let propertyValue = Utils.getProperty(array[i], this.subProperty);

        if (this.comperator.compare(propertyValue, this.values[j])) {
          return [true];
        }
      }
    }

    return [false];
  }
}
