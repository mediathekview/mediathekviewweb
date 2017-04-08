import * as StoreJS from 'store';

import { Quality } from './model';

class SettingKeys {
  static QueryText = 'queryText';
  static DefaultQuality = 'defaultQuality';
  static Everywhere = 'everywhere';
  static Future = 'future';
  static PageSize = 'pageSize';
  static MinDurationString = 'minDurationString';
  static MaxDurationString = 'maxDurationString';
}

class DefaultSettings implements SettingsObject {
  queryText = '';
  everywhere = false;
  future = false;
  defaultQuality = Quality.High;
  pageSize = 15;
  minDurationString = '';
  maxDurationString = '';
}
const DEFAULTS = new DefaultSettings();

export interface SettingsObject {
  queryText: string,
  everywhere: boolean;
  future: boolean;
  defaultQuality: number;
  pageSize: number;
  minDurationString: string;
  maxDurationString: string;

  reset?(): void;
  save?(): void;
  getQueryObj?(): object;
  setQueryObj?(value: object);
}

export class Settings {
  private static cache: { [key: string]: { [key: string]: any } } = {};

  private static get<T>(namespace: string, key: string): T {
    console.log('get', key)
    if (Settings.cache[namespace].hasOwnProperty(key) == false) {
      let storedValue = StoreJS.get(namespace + '_' + key);
      if (storedValue == undefined) {
        storedValue = DEFAULTS[key];
      }
      Settings.cache[namespace][key] = storedValue;
    }

    return Settings.cache[namespace][key];
  }

  private static set(namespace: string, key: string, value: any) {
    Settings.cache[namespace][key] = value;
  }

  private static save(namespace: string) {
    for (let key in Settings.cache[namespace]) {
      StoreJS.set(namespace + '_' + key, Settings.cache[namespace][key]);
    }
  }

  static getNamespace(namespace: string): SettingsObject {
    if (Settings.cache[namespace] == undefined) {
      Settings.cache[namespace] = {};
    }

    return {
      get queryText(): string {
        return Settings.get<string>(namespace, SettingKeys.QueryText);
      },
      set queryText(value: string) {
        Settings.set(namespace, SettingKeys.QueryText, value.trim());
      },

      get everywhere(): boolean {
        return Settings.get<boolean>(namespace, SettingKeys.Everywhere);
      },
      set everywhere(value: boolean) {
        Settings.set(namespace, SettingKeys.Everywhere, value);
      },

      get future(): boolean {
        return Settings.get<boolean>(namespace, SettingKeys.Future);
      },
      set future(value: boolean) {
        Settings.set(namespace, SettingKeys.Future, value);
      },

      get pageSize(): number {
        return Settings.get<number>(namespace, SettingKeys.PageSize);
      },
      set pageSize(value: number) {
        Settings.set(namespace, SettingKeys.PageSize, value);
      },

      get defaultQuality(): number {
        return Settings.get<number>(namespace, SettingKeys.DefaultQuality);
      },
      set defaultQuality(value: number) {
        Settings.set(namespace, SettingKeys.DefaultQuality, value);
      },

      get minDurationString(): string {
        return Settings.get<string>(namespace, SettingKeys.MinDurationString);
      },
      set minDurationString(value: string) {
        Settings.set(namespace, SettingKeys.MinDurationString, value.trim());
      },

      get maxDurationString(): string {
        return Settings.get<string>(namespace, SettingKeys.MaxDurationString);
      },
      set maxDurationString(value: string) {
        Settings.set(namespace, SettingKeys.MaxDurationString, value.trim());
      },

      reset(): void {
        for (var property in DEFAULTS) {
          this[property] = DEFAULTS[property];
        }
      },

      save(): void {
        Settings.save(namespace);
      },

      getQueryObj(): object {
        let queryObj = {};

        for (let property in this) {
          let value = this[property];
          if (typeof value != 'function' && DEFAULTS[property] != value) {
            queryObj[property] = value;
          }
        }

        return queryObj;
      },

      setQueryObj(obj: Object) {
        for (let property in obj) {
          let value = obj[property];

          if (typeof value != 'function' && this.hasOwnProperty(property)) {
            this[property] = value;
          }
        }
      }
    }
  }
}
