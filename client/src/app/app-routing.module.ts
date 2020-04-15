import { NgModule } from '@angular/core';
import { RouterModule, Routes } from '@angular/router';

const routes: Routes = [
  {
    path: 'dev',
    loadChildren: () => import('./modules/dev/dev.module').then((child) => child.DevModule)
  },
  {
    path: '',
    pathMatch: 'prefix',
    loadChildren: './modules/search/search.module#SearchModule'
  }
];

@NgModule({
  imports: [RouterModule.forRoot(routes)],
  exports: [RouterModule]
})
export class AppRoutingModule { }
