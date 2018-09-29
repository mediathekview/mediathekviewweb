import { Component, ElementRef, EventEmitter, Input, OnInit, Output, ViewChild } from '@angular/core';
import { FormControl } from '@angular/forms';
import { Subscription } from 'rxjs';
import { distinctUntilChanged, map } from 'rxjs/operators';

@Component({
  selector: 'mvw-search-input',
  templateUrl: './search-input.component.html',
  styleUrls: ['./search-input.component.scss']
})
export class SearchInputComponent implements OnInit {
  private readonly searchInput: FormControl;

  private inputChangeSubscription: Subscription;
  @ViewChild('searchInputElement') private searchInputRef: ElementRef<HTMLInputElement>;

  @Input() searchString: string;
  @Output() searchStringChanged: EventEmitter<string>;

  constructor() {
    this.searchString = '';
    this.searchStringChanged = new EventEmitter();
    this.searchInput = new FormControl();
  }

  ngOnInit() {
    this.subscribeInputChange();
    this.searchInput.setValue(this.searchString);
  }

  clear() {
    this.searchInput.setValue('');
    this.searchInputRef.nativeElement.focus();
  }

  ngOnDestroy(): void {
    this.inputChangeSubscription.unsubscribe();
  }

  onSearchStringInputChanged(searchString: string) {
    this.searchString = searchString;
    this.searchStringChanged.emit(searchString);
  }

  private subscribeInputChange() {
    this.inputChangeSubscription = this.searchInput.valueChanges
      .pipe(
        map((searchString: string) => searchString.trim()),
        distinctUntilChanged()
      )
      .subscribe((searchString) => this.onSearchStringInputChanged(searchString));
  }
}
