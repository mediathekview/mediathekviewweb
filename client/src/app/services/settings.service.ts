import { Injectable } from '@angular/core';
import { Enumerable } from '@tstdl/base/enumerable';
import { StringMap } from '@tstdl/base/types';
import { LocalStorageService } from './local-storage.service';

const LOCAL_STORAGE_NAMESPACE = 'settings';

@Injectable({
  providedIn: 'root'
})
export class SettingsService {
  private readonly localStorageService: LocalStorageService;

  constructor(localStorageService: LocalStorageService) {
    this.localStorageService = localStorageService;
  }

  loadSettings(): StringMap {
    const localStorageEntries = this.localStorageService.entries(LOCAL_STORAGE_NAMESPACE);

    const settings = Enumerable.from(localStorageEntries)
      .reduce<StringMap>((settings, [key, value]) => ({ ...settings, [key]: value }), {});

    return settings;
  }

  saveSetting(key: string, value: any): void {
    this.localStorageService.set(LOCAL_STORAGE_NAMESPACE, key, value);
  }

  saveSettings(settings: StringMap): void {
    for (const key in settings) {
      if (!settings.hasOwnProperty(key)) {
        continue;
      }

      const value = settings[key];
      this.localStorageService.set(LOCAL_STORAGE_NAMESPACE, key, value);
    }
  }
}
