import { EventEmitter } from '@angular/core';
import { Field } from 'src/app/shared/models';

export interface SearchbarFilterItemInput {
  value: string;
  valueChange: EventEmitter<string>;
}

export interface SearchbarFilterItemInputStatic {
  supportedFields: Field[];
  new(): SearchbarFilterItemInput;
}
