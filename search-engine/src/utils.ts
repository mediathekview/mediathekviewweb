export class Utils {
  static dotNotationOrArrayToArray(property: string | string[]): string[] {
    return Array.isArray(property) ? property : property.split('.').filter((prop) => prop.length > 0);
  }

  static getProperty<T>(obj: any, property: string | string[]): T {
    if (property == undefined || property == null) {
      return obj;
    }

    let propertySplit = this.dotNotationOrArrayToArray(property);

    if (propertySplit.length == 0) {
      return obj;
    }

    let item = obj[propertySplit[0]];
    for (let i = 1; i < propertySplit.length; i++) {
      item = item[propertySplit[i]];
    }

    return item;
  }

  static setProperty(obj: object, property: string | string[], value: any) {
    if (property == undefined || property == null) {
      throw new Error('property must be defined');
    }

    let propertySplit = this.dotNotationOrArrayToArray(property);

    if (propertySplit.length == 0) {
      throw new Error('property must be defined');
    }

    for (let i = 0; i < propertySplit.length - 1; i++) {
      obj = obj[propertySplit[i]];
    }

    obj[propertySplit[propertySplit.length - 1]] = value;
  }
}
