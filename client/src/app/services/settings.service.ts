import { Injectable } from '@angular/core';
import { Observable, ReplaySubject } from 'rxjs';

const DEFAULTS = {
  pageSize: 15
};

@Injectable({
  providedIn: 'root'
})
export class SettingsService {
  private readonly _pageSize: ReplaySubject<number>;

  readonly defaults = DEFAULTS as Readonly<typeof DEFAULTS>;

  get pageSize(): Observable<number> {
    return this._pageSize.asObservable();
  }

  constructor() {
    this._pageSize = new ReplaySubject(1);
    this.loadOptions();
  }

  async getPageSize(): Promise<number> {
    return this.getLocalStorage('pageSize', DEFAULTS.pageSize);
  }

  async setPageSize(size: number): Promise<void> {
    this.setLocalStorage('pageSize', size);
    this._pageSize.next(size);
  }

  private async loadOptions() {
    const pageSize = await this.getPageSize();
    this._pageSize.next(pageSize);
  }

  private getLocalStorage<T>(key: string, defaultValue: T): T {
    const storedValue = localStorage.getItem(key);
    const value = (storedValue != null) ? JSON.parse(storedValue) : defaultValue;

    return value;
  }

  private setLocalStorage<T>(key: string, value: T) {
    const serializedValue = JSON.stringify(value);
    localStorage.setItem(key, serializedValue);
  }
}
