import { Component, Output, EventEmitter } from '@angular/core';

import { Utils } from '../utils';

@Component({
  selector: 'mvw-query',
  templateUrl: './query.component.html',
  styleUrls: ['./query.component.css']
})
export class QueryComponent {
  @Output() onQuery = new EventEmitter();

  instanceID: number;
  showSettings: boolean = false;

  text: string = '';
  everywhere: boolean = false;
  future: boolean = false;

  constructor() {
    this.instanceID = Utils.getInstanceID();
  }

  query() {
    console.log(this.text);
    console.log(this.everywhere);
    console.log(this.future);
  }
}
