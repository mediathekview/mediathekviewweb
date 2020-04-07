import { NgModule } from '@angular/core';
import { CoreModule } from '../core/core.module';
import { EntryListComponent } from './components/entry-list/entry-list.component';
import { SearchbarSortComponent } from './components/searchbar/searchbar-sort/searchbar-sort.component';
import { SearchbarComponent } from './components/searchbar/searchbar.component';
import { SearchComponent } from './pages/search.component';
import { SearchRoutingModule } from './search-routing.module';

@NgModule({
  declarations: [
    SearchComponent,
    SearchbarComponent,
    EntryListComponent,
    SearchbarSortComponent
  ],
  imports: [
    CoreModule,
    SearchRoutingModule
  ]
})
export class SearchModule { }
