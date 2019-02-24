import { Injectable } from '@angular/core';
import { Observable } from 'rxjs';
import { shareReplay } from 'rxjs/operators';

@Injectable({
  providedIn: 'root'
})
export class MediaQueryService {
  private readonly queryObservables: Map<string, Observable<boolean>>;

  constructor() {
    this.queryObservables = new Map();
  }

  get isXs(): Observable<boolean> {
    return this.query('(max-width: 1087px)');
  }

  query(query: string): Observable<boolean> {
    if (!this.queryObservables.has(query)) {
      const observable = this.getQueryObservable(query);
      const sharedObservable = observable.pipe(shareReplay(1));
      this.queryObservables.set(query, sharedObservable);
    }

    const observable = this.queryObservables.get(query) as Observable<boolean>;
    return observable;
  }

  private getQueryObservable(query: string): Observable<boolean> {
    const observable = new Observable<boolean>((subscriber) => {
      const mediaQueryList = window.matchMedia(query);

      const listener = (event: MediaQueryListEvent) => subscriber.next(event.matches);
      const teardown = () => mediaQueryList.removeEventListener('change', listener);

      subscriber.next(mediaQueryList.matches);
      mediaQueryList.addEventListener('change', listener);

      return teardown;
    });

    return observable;
  }
}
