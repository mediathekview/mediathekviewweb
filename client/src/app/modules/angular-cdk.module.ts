import { ScrollingModule } from '@angular/cdk/scrolling';
import { ScrollingModule as ExperimentalScrollingModule } from '@angular/cdk-experimental/scrolling';
import { NgModule } from '@angular/core';

const modules = [
  ScrollingModule,
  ExperimentalScrollingModule
];

@NgModule({
  imports: modules,
  exports: modules
})
export class AngularCdkModule { }
