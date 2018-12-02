import { Component, ElementRef, EventEmitter, Input, OnInit, Output, ViewChild } from '@angular/core';
import { FormControl } from '@angular/forms';
import { Subscription, Observable } from 'rxjs';
import { distinctUntilChanged, map } from 'rxjs/operators';
import { Segment, Segmentizer } from 'src/app/common/search-string-parser';

@Component({
  selector: 'app-search-input',
  templateUrl: './search-input.component.html',
  styleUrls: ['./search-input.component.scss']
})
export class SearchInputComponent implements OnInit {
  private readonly segmentizer: Segmentizer;
  private inputChangeSubscription: Subscription;
  readonly searchInput: FormControl;

  settingsOpened: boolean = false;

  @ViewChild('searchInputElement')
  private readonly searchInputRef: ElementRef<HTMLInputElement>;

  @Input() searchString: string;
  @Output() searchStringChange: EventEmitter<string>;

  segments$: Observable<Segment[]>;

  constructor() {
    this.searchStringChange = new EventEmitter();
    this.searchInput = new FormControl();
    this.searchString = '';

    this.segmentizer = new Segmentizer();
  }

  ngOnInit() {
    this.subscribeInputChange();
    this.searchInput.setValue(this.searchString);

    this.segments$ = this.searchStringChange.pipe(
      map((searchString) => this.segmentizer.segmentize(searchString))
    );
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
    this.searchStringChange.emit(searchString);
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
