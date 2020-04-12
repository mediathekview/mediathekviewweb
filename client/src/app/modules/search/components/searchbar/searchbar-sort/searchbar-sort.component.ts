import { ChangeDetectionStrategy, Component, ElementRef, OnInit, ViewChild } from '@angular/core';
import { FormControl } from '@angular/forms';
import { MatAutocompleteSelectedEvent } from '@angular/material/autocomplete';
import { Field, fields as availableFields } from 'src/app/shared/models';

type SortItem = {
  field: Field,
  display: string
};

@Component({
  selector: 'app-searchbar-sort',
  templateUrl: './searchbar-sort.component.html',
  styleUrls: ['./searchbar-sort.component.scss'],
  changeDetection: ChangeDetectionStrategy.OnPush
})
export class SearchbarSortComponent implements OnInit {
  @ViewChild('fieldInput') readonly fieldInput: ElementRef<HTMLInputElement>;
  readonly fieldControl: FormControl;

  selectedFields: Field[];

  get filteredFields(): Field[] {
    const filter = this.fieldControl.value == undefined ? '' : (this.fieldControl.value as string).trim().toLowerCase();

    if (filter.length == 0) {
      return this.remainingFields;
    }

    return this.remainingFields.filter((field) => field.toLowerCase().includes(filter));
  }

  get remainingFields(): Field[] {
    return availableFields.filter((field) => !this.selectedFields.includes(field));
  }

  constructor() {
    this.fieldControl = new FormControl();
    this.selectedFields = [];
  }

  ngOnInit(): void {
  }

  add(event: MatAutocompleteSelectedEvent): void {
    this.selectedFields.push(event.option.value as Field);
    console.log(this.fieldControl);
    this.fieldInput.nativeElement.value = '';
  }

  remove(field: Field): void {
    this.selectedFields = this.selectedFields.filter((f) => f != field);
  }
}
