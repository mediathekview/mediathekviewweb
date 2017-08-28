import { Component } from '@angular/core';
import { IMediathekViewWebAPI } from './common/api';
import { SocketIOMediathekViewWebAPI } from './api/socket-io';

@Component({
  selector: 'mvw-root',
  templateUrl: './app.component.html',
  styleUrls: ['./app.component.scss']
})
export class AppComponent {
  title = 'mvw';
  api: IMediathekViewWebAPI;

  queryString: string;
  responseString: string;

  constructor() {
    this.api = new SocketIOMediathekViewWebAPI('localhost:8080');
    const query = { body: { matchAll: {} } };

    this.queryString = JSON.stringify(query, null, 2);

    (async () => {
      const result = await this.api.search(query);

      this.responseString = JSON.stringify(result, null, 2);
    })();
  }
}
