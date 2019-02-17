import { Injectable } from '@angular/core';
import { Observable } from 'rxjs';

@Injectable({
  providedIn: 'root'
})
export class MediaQueryService {
  private readonly mediaQueryLists: Map<string, MediaQueryList>;

  constructor() {
    this.mediaQueryLists = new Map();
  }

  get isXs(): Observable<boolean> {
    return this.query('(max-width: 500px)');
  }

  query(query: string): Observable<boolean> {
    if (!this.mediaQueryLists.has(query)) {
      const mediaQueryList = window.matchMedia(query);
      this.mediaQueryLists.set(query, mediaQueryList);
    }

    const mediaQueryList = this.mediaQueryLists.get(query) as MediaQueryList;

    return new Observable((subscriber) => {
      const listener = (event: MediaQueryListEvent) => subscriber.next(event.matches);
      const teardown = () => mediaQueryList.removeEventListener('change', listener);

      subscriber.next(mediaQueryList.matches);
      mediaQueryList.addEventListener('change', listener);

      return teardown;
    });
  }
}
