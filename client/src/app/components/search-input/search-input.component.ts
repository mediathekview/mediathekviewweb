import { ChangeDetectionStrategy, Component, ElementRef, EventEmitter, Input, OnDestroy, OnInit, Output, ViewChild } from '@angular/core';
import { FormControl } from '@angular/forms';
import { Observable, Subscription } from 'rxjs';
import { distinctUntilChanged, map } from 'rxjs/operators';
import { Segment, Segmentizer } from '../../common/search-string-parser';

@Component({
  selector: 'mvw-search-input',
  templateUrl: './search-input.component.html',
  styleUrls: ['./search-input.component.scss'],
  changeDetection: ChangeDetectionStrategy.OnPush
})
export class SearchInputComponent implements OnInit, OnDestroy {
  private readonly segmentizer: Segmentizer;
  @ViewChild('searchInputElement', { static: true }) private readonly searchInputRef: ElementRef<HTMLInputElement>;

  private inputChangeSubscription: Subscription;

  readonly searchInput: FormControl;

  settingsOpened: boolean = false;

  @Input() searchString: string;
  @Output() searchStringChange: EventEmitter<string>;

  segments$: Observable<Segment[]>;

  constructor() {
    this.searchStringChange = new EventEmitter();
    this.searchInput = new FormControl();
    this.searchString = '';

    this.segmentizer = new Segmentizer();
  }

  ngOnInit(): void {
    this.subscribeInputChange();
    this.searchInput.setValue(this.searchString);

    this.segments$ = this.searchStringChange.pipe(
      map((searchString) => this.segmentizer.segmentize(searchString))
    );
  }

  clear(): void {
    this.searchInput.setValue('');
    this.searchInputRef.nativeElement.focus();
  }

  ngOnDestroy(): void {
    this.inputChangeSubscription.unsubscribe();
  }

  onSearchStringInputChanged(searchString: string): void {
    this.searchString = searchString;
    this.searchStringChange.emit(searchString);
  }

  private subscribeInputChange(): void {
    this.inputChangeSubscription = this.searchInput.valueChanges
      .pipe(
        map((searchString: string) => searchString.trim()),
        distinctUntilChanged()
      )
      .subscribe((searchString) => this.onSearchStringInputChanged(searchString));
  }
}
