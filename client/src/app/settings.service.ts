import { Injectable } from '@angular/core';
import * as StoreJS from 'store';

import { Quality } from './model';

class Settings {
  static DefaultQuality: 'defaultQuality'
}

@Injectable()
export class SettingsService {
  cache: { [key: string]: any } = {};

  constructor() { }

  private set(key: string, value: any, persistent: boolean) {
    this.cache[key] = value;

    if (persistent == true) {
      store.set(key, value);
    }
  }

  private get(key: string) {
    if (this.cache.hasOwnProperty(key) == false) {
      this.cache[key] = StoreJS.get(key);
    }

    return this.cache[key];
  }

  getDefaultQuality(): Quality {
    return this.get(Settings.DefaultQuality);
  }

  setDefaultQuality(quality: Quality, persistent = false) {
    this.set(Settings.DefaultQuality, quality, persistent);
  }
}
