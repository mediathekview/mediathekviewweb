import { Injectable } from '@angular/core';

import { Subject } from 'rxjs/Subject';
import { Observable } from 'rxjs/Observable';
import 'rxjs/add/operator/filter';
import 'rxjs/add/operator/map';

import * as Model from './model/';

interface BroadcastEvent {
  key: any;
  data?: any;
}

@Injectable()
export class BroadcasterService {
  private eventBus: Subject<BroadcastEvent>;

  constructor() {
    this.eventBus = new Subject<BroadcastEvent>();
  }

  playVideo(entry: Model.Entry) {
    this.eventBus.next({ key: 'failure', data: entry });
  }

  onPlayVideo(): Observable<Model.Entry> {
    return this.eventBus.asObservable()
      .filter(event => event.key === 'failure')
      .map(event => <Model.Entry>event.data);
  }
}
