import { Component, OnInit, ChangeDetectionStrategy } from '@angular/core';
import { fields } from 'src/app/shared/models';
import { FormControl } from '@angular/forms';

@Component({
  selector: 'app-searchbar-sort',
  templateUrl: './searchbar-sort.component.html',
  styleUrls: ['./searchbar-sort.component.scss'],
  changeDetection: ChangeDetectionStrategy.OnPush
})
export class SearchbarSortComponent implements OnInit {

  fields = fields
  fieldsControl: FormControl;

  constructor() {
    this.fieldsControl = new FormControl();
  }

  ngOnInit(): void {
  }

  add(_field: string): void {

  }

  remove(_field: string): void {

  }
}
