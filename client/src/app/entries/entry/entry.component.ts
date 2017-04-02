import { Component, Input } from '@angular/core';
import { trigger, state, style, animate, transition, keyframes } from '@angular/animations';

import { Entry } from '../../model';

@Component({
  selector: 'mvw-entry',
  templateUrl: './entry.component.html',
  styleUrls: ['./entry.component.css']
})
export class EntryComponent {
  @Input() entry: Entry;

  showDescription = false;

  constructor() { }

  toggleDescription() {
    this.showDescription = !this.showDescription;
  }
}
