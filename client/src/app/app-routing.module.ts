import { NgModule } from '@angular/core';
import { Routes, RouterModule } from '@angular/router';

import { QueryComponent } from './query/query.component';

const routes: Routes = [
  {
    path: '',
    component: QueryComponent,
    children: []
  }
];

@NgModule({
  imports: [RouterModule.forRoot(routes)],
  exports: [RouterModule],
  providers: []
})
export class AppRoutingModule { }
