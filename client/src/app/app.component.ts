import { Component } from '@angular/core';

import { IEntry } from './common/model';
import { IMediathekViewWebAPI } from './common/api';
import { SocketIOMediathekViewWebAPI } from './api/socket-io';

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
  private api: IMediathekViewWebAPI;

  entry: IEntry;
  entry2: IEntry;

  constructor() {

    this.entry = {
      id: 'bla',
      metadata: null,

      channel: 'ARD',
      topic: 'Sturm der Liebe',
      title: 'Abschied von Haus Meer Sand Sonne',
      timestamp: 1504808206,
      duration: 120 * 60 + 35,
      description: `"Wir drehen durch", verkünden die Comedians der 'RebellComedy': Heute mit Hany Siam, Benaissa Lambroubal, Jamie Wierzbicki, Tamika Campbell, Salim Samatou, Pu und Khalid Bounuar.`,
      website: 'http://www.ardmediathek.de/tv/Comedy-ONE/RebellComedy-23-23/ONE/Video?bcastId=36524254&documentId=45728242',
      media: []
    }

    this.entry2 = {
      id: 'bla',
      metadata: null,

      channel: 'ARD',
      topic: 'Sturm der Liebe',
      title: 'Abschied von Haus Meer Sand Sonne',
      timestamp: 1504808206,
      duration: 3 * 60 + 8,
      description: `"Wir drehen durch", verkünden die Comedians der 'RebellComedy': Heute mit Hany Siam, Benaissa Lambroubal, Jamie Wierzbicki, Tamika Campbell, Salim Samatou, Pu und Khalid Bounuar.`,
      website: 'http://www.ardmediathek.de/tv/Comedy-ONE/RebellComedy-23-23/ONE/Video?bcastId=36524254&documentId=45728242',
      media: []
    }

    this.api = new SocketIOMediathekViewWebAPI('localhost:8080');
    const query = { body: { matchAll: {} } };

    this.queryString = JSON.stringify(query, null, 2);

    (async () => {
      const result = await this.api.search(query);

      this.responseString = JSON.stringify(result, null, 2);
    })();
  }
}
