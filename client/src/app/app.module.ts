import { BrowserModule } from '@angular/platform-browser';
import { NgModule } from '@angular/core';
import { FormsModule } from '@angular/forms';
import { HttpModule } from '@angular/http';

import { BroadcasterService } from './broadcaster.service';

import { AppRoutingModule } from './app-routing.module';
import { AppComponent } from './app.component';
import { QueryComponent } from './controls/query/query.component';
import { EntriesComponent } from './controls/entries/entries.component';
import { EntryComponent } from './controls/entries/entry/entry.component';
import { PaginationComponent } from './controls/pagination/pagination.component';
import { VideoPlayerComponent } from './controls/video-player/video-player.component';

import { SearchComponent } from './route-components/search/search.component';

@NgModule({
  declarations: [
    AppComponent,
    QueryComponent,
    EntriesComponent,
    EntryComponent,
    PaginationComponent,
    VideoPlayerComponent,
    SearchComponent
  ],
  imports: [
    BrowserModule,
    FormsModule,
    HttpModule,
    AppRoutingModule
  ],
  providers: [BroadcasterService],
  bootstrap: [AppComponent]
})
export class AppModule { }
