import { CommonModule } from '@angular/common';
import { NgModule } from '@angular/core';
import { FormsModule } from '@angular/forms';
import { RouterModule } from '@angular/router';
import { MaterialModule } from '../material/material.module';
import { NavbarComponent } from './components/navbar/navbar.component';

const types = [
  NavbarComponent
]

const modules = [
  CommonModule,
  FormsModule,
  MaterialModule,
  RouterModule
];

@NgModule({
  declarations: types,
  imports: modules,
  exports: [...modules, ...types]
})
export class CoreModule { }
