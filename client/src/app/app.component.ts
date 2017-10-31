import { Component } from '@angular/core';

import { Entry } from './common/model';
import { MediathekViewWebAPI } from './common/api';
import { SocketIOMediathekViewWebAPI } from './api/socket-io';
import { MatchAllQueryBuilder } from './common/search-engine';
import { Query } from './common/search-engine';

@Component({
  selector: 'mvw-root',
  templateUrl: './app.component.html',
  styleUrls: ['./app.component.scss']
})
export class AppComponent {
  title = 'MediathekViewWeb';

  queryString: string;
  responseString: string;

  showNav: boolean = false;
  private api: MediathekViewWebAPI;

  entries: Entry[] = [];

  constructor() {

  const q: Query = { matchAll: {}};

    this.api = new SocketIOMediathekViewWebAPI('localhost:8080');
    const query = { body: new MatchAllQueryBuilder().build() };

    this.queryString = JSON.stringify(query, null, 2);

    (async () => {
      const result = await this.api.search(query);

      this.entries = result.items.map((item) => item.document);

      this.responseString = JSON.stringify(result, null, 2);
    })();
  }
}
