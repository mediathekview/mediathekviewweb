import { ChangeDetectionStrategy, Component, EventEmitter, Input, OnInit, Output } from '@angular/core';
import { FormControl } from '@angular/forms';
import { Observable } from 'rxjs';
import { distinctUntilChanged, map } from 'rxjs/operators';
import { Segment, Segmentizer } from 'src/app/shared/search-string-parser';

export type Search = {
  searchString: string,
  future: boolean
};

const defaultSearch: Search = {
  searchString: '',
  future: false
};

@Component({
  selector: 'app-searchbar',
  templateUrl: './searchbar.component.html',
  styleUrls: ['./searchbar.component.scss'],
  changeDetection: ChangeDetectionStrategy.OnPush
})
export class SearchbarComponent implements OnInit {
  private readonly segmentizer: Segmentizer;

  readonly searchStringInput: FormControl;

  settingsExpanded: boolean = false;
  segments$: Observable<Segment[]>;

  @Input() search: Search;
  @Output() searchChange: EventEmitter<Search>;

  constructor() {
    this.segmentizer = new Segmentizer();
    this.searchStringInput = new FormControl();
    this.search = defaultSearch;
    this.searchChange = new EventEmitter();
  }

  ngOnInit(): void {
    this.searchStringInput.setValue(this.search.searchString);

    this.segments$ = this.searchChange.pipe(
      map((search) => this.segmentizer.segmentize(search.searchString))
    );

    this.searchStringInput.valueChanges.pipe(
      map((searchString: string) => searchString.trim()),
      distinctUntilChanged()
    )
      .subscribe((searchString) => this.onSearchStringInputChanged(searchString));
  }

  private onSearchStringInputChanged(searchString: string): void {
    this.search = { ...this.search, searchString };
    this.searchChange.emit(this.search);
  }
}
