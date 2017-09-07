import { BrowserModule } from '@angular/platform-browser';
import { NgModule, LOCALE_ID } from '@angular/core';

import { AppRoutingModule } from './app-routing.module';
import { AppComponent } from './app.component';
import { QueryBuilderComponent } from './components/query-builder/query-builder.component';
import { IconComponent } from './components/icon/icon.component';
import { CollapseComponent } from './components/collapse/collapse.component';
import { EntryTableComponent } from './components/entry-table/entry-table.component';
import { SplitDropdownComponent } from './components/split-dropdown/split-dropdown.component';
import { EntryComponent } from './components/entry/entry.component';
import { EntryRowOverviewComponent } from './components/entry-table/entry-row-overview/entry-row-overview.component';
import { EntryRowDetailComponent } from './components/entry-table/entry-row-detail/entry-row-detail.component';
import { DurationPipe } from './pipes/duration.pipe';

@NgModule({
  declarations: [
    AppComponent,
    QueryBuilderComponent,
    IconComponent,
    CollapseComponent,
    EntryTableComponent,
    SplitDropdownComponent,
    EntryComponent,
    EntryRowOverviewComponent,
    EntryRowDetailComponent,
    DurationPipe
  ],
  imports: [
    BrowserModule,
    AppRoutingModule
  ],
  providers: [{ provide: LOCALE_ID, useValue: "de-DE" }],
  bootstrap: [AppComponent]
})
export class AppModule { }
