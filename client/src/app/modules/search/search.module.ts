import { NgModule } from '@angular/core';
import { CoreModule } from '../core/core.module';
import { EntryListComponent } from './components/entry-list/entry-list.component';
import { SearchbarComponent } from './components/searchbar/searchbar.component';
import { SearchComponent } from './pages/search.component';
import { SearchRoutingModule } from './search-routing.module';

@NgModule({
  declarations: [
    SearchComponent,
    SearchbarComponent,
    EntryListComponent
  ],
  imports: [
    CoreModule,
    SearchRoutingModule
  ]
})
export class SearchModule { }
