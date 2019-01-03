import { Injectable } from '@angular/core';
import { SyncEnumerable } from '../common/enumerable';
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

    const settings = SyncEnumerable.from(localStorageEntries)
      .reduce((settings, [key, value]) => {
        return { ...settings, [key]: value };
      }, {} as StringMap);

    return settings;
  }

  saveSetting(key: string, value: any): void {
    this.localStorageService.set(LOCAL_STORAGE_NAMESPACE, key, value);
  }

  saveSettings(settings: StringMap): void {
    for (const key in settings) {
      if (!(settings as Object).hasOwnProperty(key)) {
        continue;
      }

      const value = settings[key];
      this.localStorageService.set(LOCAL_STORAGE_NAMESPACE, key, value);
    }
  }
}
