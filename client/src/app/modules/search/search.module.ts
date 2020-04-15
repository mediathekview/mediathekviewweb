import { NgModule } from '@angular/core';
import { CoreModule } from '../core/core.module';
import { EntryListComponent } from './components/entry-list/entry-list.component';
import { SearchbarSortComponent } from './components/searchbar/searchbar-sort/searchbar-sort.component';
import { SearchbarComponent } from './components/searchbar/searchbar.component';
import { SearchComponent } from './pages/search.component';
import { SearchRoutingModule } from './search-routing.module';
import { SearchbarFilterComponent } from './components/searchbar/searchbar-filter/searchbar-filter.component';
import { SearchbarFilterItemComponent } from './components/searchbar/searchbar-filter/searchbar-filter-item/searchbar-filter-item.component';
import { SearchbarFilterItemStringInputComponent } from './components/searchbar/searchbar-filter/searchbar-filter-item/searchbar-filter-item-input/searchbar-filter-item-string-input/searchbar-filter-item-string-input.component';
import { SearchbarFilterItemDateInputComponent } from './components/searchbar/searchbar-filter/searchbar-filter-item/searchbar-filter-item-input/searchbar-filter-item-date-input/searchbar-filter-item-date-input.component';

@NgModule({
  declarations: [
    SearchComponent,
    SearchbarComponent,
    EntryListComponent,
    SearchbarSortComponent,
    SearchbarFilterComponent,
    SearchbarFilterItemComponent,
    SearchbarFilterItemStringInputComponent,
    SearchbarFilterItemDateInputComponent
  ],
  imports: [
    CoreModule,
    SearchRoutingModule
  ]
})
export class SearchModule { }
