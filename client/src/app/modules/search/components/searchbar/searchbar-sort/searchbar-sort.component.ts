import { ChangeDetectionStrategy, Component, ElementRef, OnInit, ViewChild } from '@angular/core';
import { FormControl } from '@angular/forms';
import { MatAutocompleteSelectedEvent } from '@angular/material/autocomplete';
import { Field } from 'src/app/shared/models';
import { Enumerable } from '@tstdl/base/enumerable/';

type SortItem = Readonly<{
  field: Field,
  display: string
}>;

type SelectedSortItem = Readonly<{
  item: SortItem,
  direction: 1 | -1
}>;

const sortables: SortItem[] = [
  { field: Field.Channel, display: 'Channel' },
  { field: Field.Topic, display: 'Topic' },
  { field: Field.Title, display: 'Title' },
  { field: Field.Timestamp, display: 'Timestamp' },
  { field: Field.Date, display: 'Date' },
  { field: Field.Time, display: 'Time' },
  { field: Field.Duration, display: 'Duration' },
  { field: Field.FirstSeen, display: 'FirstSeen' },
  { field: Field.LastSeen, display: 'LastSee' }
];

@Component({
  selector: 'app-searchbar-sort',
  templateUrl: './searchbar-sort.component.html',
  styleUrls: ['./searchbar-sort.component.scss'],
  changeDetection: ChangeDetectionStrategy.OnPush
})
export class SearchbarSortComponent implements OnInit {
  @ViewChild('fieldInput') readonly fieldInput: ElementRef<HTMLInputElement>;
  readonly fieldControl: FormControl;

  selected: ReadonlyArray<SelectedSortItem>;

  get remaining(): SortItem[] {
    return sortables.filter((item) => !Enumerable.from(this.selected).any((s) => s.item == item));
  }

  get filtered(): SortItem[] {
    const filter = (typeof this.fieldControl.value) != 'string' ? '' : (this.fieldControl.value as string).trim().toLowerCase();

    if (filter.length == 0) {
      return this.remaining;
    }

    return this.remaining.filter((field) => field.display.toLowerCase().includes(filter));
  }

  constructor() {
    this.fieldControl = new FormControl();
    this.selected = [];
  }

  ngOnInit(): void {
  }

  changeDirection(selection: SelectedSortItem): void {
    const newSelection: SelectedSortItem = { item: selection.item, direction: (selection.direction == 1) ? -1 : 1 };
    this.selected = this.selected.map((s) => ((s.item == selection.item) ? newSelection : s));
  }

  add(event: MatAutocompleteSelectedEvent): void {
    const item: SelectedSortItem = {
      item: event.option.value as SortItem,
      direction: 1
    };

    this.selected = [...this.selected, item];
    this.fieldInput.nativeElement.value = '';
  }

  remove(item: SelectedSortItem): void {
    this.selected = this.selected.filter((i) => i != item);
  }

  trackBySelectedSortItem(_index: number, item: SelectedSortItem): any {
    return item.item;
  }
}
