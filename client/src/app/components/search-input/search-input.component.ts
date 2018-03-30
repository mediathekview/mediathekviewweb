import { Component, EventEmitter, Input, OnInit, Output } from '@angular/core';

@Component({
  selector: 'mvw-search-input',
  templateUrl: './search-input.component.html',
  styleUrls: ['./search-input.component.scss']
})
export class SearchInputComponent implements OnInit {
  @Input() searchString: string;

  @Output() searchStringChanged: EventEmitter<string>;

  constructor() {
    this.searchString = '';
    this.searchStringChanged = new EventEmitter();
  }

  ngOnInit() {
  }

  onSearchStringChanged(searchString: string) {
    this.searchStringChanged.emit(searchString);
  }
}
