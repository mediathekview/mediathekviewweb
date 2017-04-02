export class Utils {
  static currentInstanceID = 0;

  static getInstanceID(): number {
    return this.currentInstanceID++;
  }
}
