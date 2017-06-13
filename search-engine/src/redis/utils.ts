export class Utils {
  static objectToKeyJSONValueArray(obj: any, prefix: string = ''): string[] {
    let output: string[] = [];

    let keys = Object.getOwnPropertyNames(obj);

    for (let i = 0; i < keys.length; i++) {
      let key = keys[i];
      let value = obj[key];
      let type = typeof value;

      if (type == 'string' || type == 'number' || type == 'boolean' || value == null || Array.isArray(value)) {
        output.push(prefix + key);
        output.push(JSON.stringify(value));
      }
      else if (type == 'object') {
        if (value instanceof RegExp) {
          continue;
        }
        else {
          output = output.concat(this.objectToKeyJSONValueArray(value, prefix + key + '.'));
        }
      }
      else {
        continue;
      }
    }

    return output;
  }
}
