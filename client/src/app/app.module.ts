import { BrowserModule } from '@angular/platform-browser';
import { NgModule } from '@angular/core';
import { FormsModule } from '@angular/forms';
import { HttpModule } from '@angular/http';

import { BroadcasterService } from './broadcaster.service';

import { AppRoutingModule } from './app-routing.module';
import { AppComponent } from './app.component';
import { QueryComponent } from './query/query.component';
import { EntriesComponent } from './entries/entries.component';
import { EntryComponent } from './entries/entry/entry.component';
import { PaginationComponent } from './pagination/pagination.component';
import { VideoPlayerComponent } from './video-player/video-player.component';

@NgModule({
  declarations: [
    AppComponent,
    QueryComponent,
    EntriesComponent,
    EntryComponent,
    PaginationComponent,
    VideoPlayerComponent
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
