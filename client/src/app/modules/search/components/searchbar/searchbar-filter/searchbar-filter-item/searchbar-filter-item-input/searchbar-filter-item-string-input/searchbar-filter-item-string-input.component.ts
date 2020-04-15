import { ChangeDetectionStrategy, Component, EventEmitter, Input, OnInit, Output } from '@angular/core';
import { Field } from 'src/app/shared/models';
import { SearchbarFilterItemInput } from '../searchbar-filter-item-input.component';

@Component({
  selector: 'app-searchbar-filter-item-string-input',
  templateUrl: './searchbar-filter-item-string-input.component.html',
  styleUrls: ['./searchbar-filter-item-string-input.component.scss'],
  changeDetection: ChangeDetectionStrategy.OnPush
})
export class SearchbarFilterItemStringInputComponent implements SearchbarFilterItemInput {
  static supportedFields: Field[] = [Field.Channel, Field.Topic, Field.Title, Field.Description];

  @Input() value: string;
  @Output() valueChange: EventEmitter<string>;

  constructor() {
    this.valueChange = new EventEmitter();
  }
}
