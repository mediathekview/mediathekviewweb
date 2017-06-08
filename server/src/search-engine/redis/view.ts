import * as Comperator from './comperator';
import { Utils } from '../../utils';

export interface IView<T> {
  do(obj: any): T;
}

export class ArrayAnyView implements IView<boolean> {
  arrayProperty: string;
  property: string;
  comperator: Comperator.IComperator
  values: any[];

  constructor(arrayProperty: string, property: string, comperator: Comperator.IComperator, ...values: any[]) {
    this.arrayProperty = arrayProperty;
    this.property = property;
    this.comperator = comperator;
    this.values = values;
  }

  do(obj: any): boolean {
    let array = Utils.getProperty<any[]>(obj, this.arrayProperty);

    for (let i = 0; i < array.length; i++) {
      for (let j = 0; j < this.values.length; j++) {
        let propertyValue = Utils.getProperty(array[i], this.property);

        if (this.comperator.compare(this.values[j], propertyValue)) {
          return true;
        }
      }
    }

    return false;
  }
}


let arrayAnyView = new ArrayAnyView('videos', 'quality', new Comperator.MultiComperator(Comperator.MultiComperatorType.And, new Comperator.TypeComperator(), new Comperator.LessComperator()), 5);
let anyVideoIsHD = arrayAnyView.do(['arrayOfEntry']);
