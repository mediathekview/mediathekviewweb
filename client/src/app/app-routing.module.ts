import { NgModule } from '@angular/core';
import { Routes, RouterModule } from '@angular/router';

import { QueryComponent } from './query/query.component';

const routes: Routes = [
  {
    path: '',
    children: [
      { path: 'search', component: QueryComponent }
    ]
  }
];

@NgModule({
  imports: [RouterModule.forRoot(routes)],
  exports: [RouterModule]
})
export class AppRoutingModule { }
