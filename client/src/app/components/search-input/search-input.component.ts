import { Component, EventEmitter, Input, OnDestroy, OnInit, Output } from '@angular/core';
import { FormControl } from '@angular/forms';
import { distinctUntilChanged } from 'rxjs/operators/distinctUntilChanged';
import { map } from 'rxjs/operators/map';
import { Subscription } from 'rxjs/Subscription';

@Component({
  selector: 'mvw-search-input',
  templateUrl: './search-input.component.html',
  styleUrls: ['./search-input.component.scss']
})
export class SearchInputComponent implements OnInit, OnDestroy {
  @Input() searchString: string;
  @Output() searchStringChanged: EventEmitter<string>;

  private inputControl: FormControl;
  private inputChangeSubscription: Subscription;

  constructor() {
    this.searchString = '';
    this.searchStringChanged = new EventEmitter();
    this.inputControl = new FormControl();
  }

  ngOnInit() {
    this.subscribeInputChange();
    this.inputControl.setValue(this.searchString);
  }

  ngOnDestroy(): void {
    this.inputChangeSubscription.unsubscribe();
  }

  onSearchStringInputChanged(searchString: string) {
    this.searchStringChanged.emit(searchString);
  }

  clear() {
    this.inputControl.setValue('');
  }

  private subscribeInputChange() {
    this.inputChangeSubscription = this.inputControl.valueChanges
      .pipe(
        map((searchString: string) => searchString.trim()),
        distinctUntilChanged()
      )
      .subscribe((searchString) => this.onSearchStringInputChanged(searchString));
  }
}
