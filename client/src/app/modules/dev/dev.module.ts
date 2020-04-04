import { NgModule } from '@angular/core';
import { CommonModule } from '@angular/common';

import { DevRoutingModule } from './dev-routing.module';
import { DevComponent } from './dev.component';


@NgModule({
  declarations: [DevComponent],
  imports: [
    CommonModule,
    DevRoutingModule
  ]
})
export class DevModule { }
