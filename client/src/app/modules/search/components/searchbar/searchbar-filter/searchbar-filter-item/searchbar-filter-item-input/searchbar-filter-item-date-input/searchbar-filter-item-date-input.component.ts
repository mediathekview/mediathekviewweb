import { ChangeDetectionStrategy, Component, EventEmitter, Input, Output } from '@angular/core';
import { Field } from 'src/app/shared/models';
import { SearchbarFilterItemInput } from '../searchbar-filter-item-input.component';

@Component({
  selector: 'app-searchbar-filter-item-date-input',
  templateUrl: './searchbar-filter-item-date-input.component.html',
  styleUrls: ['./searchbar-filter-item-date-input.component.scss'],
  changeDetection: ChangeDetectionStrategy.OnPush
})
export class SearchbarFilterItemDateInputComponent implements SearchbarFilterItemInput {
  static supportedFields: Field[] = [Field.Date];

  @Input() value: string;
  @Output() valueChange: EventEmitter<string>;

  constructor() {
    this.valueChange = new EventEmitter();
  }
}
