import { Component, Output, EventEmitter } from '@angular/core';

import { Utils } from '../utils';

import { Query, Match, IFilter, Field, SortOrder, RangeFilter } from '../model';

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
    console.log(this.buildQuery());
  }

  buildQuery(): Query {
    let query: Query = {
      matches: this.createMatches(this.text.trim(), this.everywhere),
      filters: this.createFilters(this.future),
      sortField: Field.Timestamp,
      sortOrder: SortOrder.Descending,
      offset: 0,
      size: 15
    }

    return query;
  }

  createMatches(text: string, everywhere: boolean): Match[] {
    let matches: Match[] = [];

    let textSplits = text.split(/\s/).filter((s) => s.length > 0);

    let generics: string[] = [];

    for (let i = 0; i < textSplits.length; i++) {
      let split = textSplits[i];

      let selector: string = null;
      let text: string = null;
      let fields: string[] = [];

      let selectorMatch = split.match(/(!|#|\+|\*)/);
      if (selectorMatch != null) {
        selector = selectorMatch[0];
      }

      let textMatch = split.match(/([^!#*+](.*))/);
      if (textMatch != null) {
        text = textMatch[0].split(',').filter(s => s.length > 0).join(' ');
      }

      switch (selector) {
        case '!':
          fields = [Field.Channel];
          break;

        case '#':
          fields = [Field.Topic];
          break;

        case '+':
          fields = [Field.Title];
          break;

        case '*':
          fields = [Field.Description];
          break;
      }

      if (selector != null) {
        matches.push({
          fields: fields,
          text: text
        });
      } else {
        generics.push(text);
      }
    }

    matches.push({
      fields: everywhere ? [Field.Channel, Field.Topic, Field.Title, Field.Description] : [Field.Topic, Field.Title],
      text: generics.join(' ')
    });

    return matches;
  }


  createFilters(future: boolean): IFilter[] {
    if (!future == true) {
      return null;
    }

    let rangeFilter: RangeFilter = { field: Field.Timestamp, lte: Math.floor(Date.now() / 1000) };

    return [rangeFilter];
  }
}
