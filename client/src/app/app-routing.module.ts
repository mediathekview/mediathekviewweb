import { NgModule } from '@angular/core';
import { RouterModule, Routes } from '@angular/router';

const routes: Routes = [
  {
    path: 'dev',
    loadChildren: () => import('./modules/dev/dev.module').then((child) => child.DevModule)
  },
  { path: '', loadChildren: () => import('./modules/search/search.module').then((child) => child.SearchModule) }
];

@NgModule({
  imports: [RouterModule.forRoot(routes)],
  exports: [RouterModule]
})
export class AppRoutingModule { }
