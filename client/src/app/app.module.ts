import { registerLocaleData } from '@angular/common';
import { HttpClientModule } from '@angular/common/http';
import localeDe from '@angular/common/locales/de';
import { NgModule, LOCALE_ID } from '@angular/core';
import { FormsModule, ReactiveFormsModule } from '@angular/forms';
import { BrowserModule } from '@angular/platform-browser';
import { BrowserAnimationsModule } from '@angular/platform-browser/animations';
import { ServiceWorkerModule } from '@angular/service-worker';

import { environment } from '../environments/environment';
import { AppRoutingModule } from './app-routing.module';
import { AppComponent } from './app.component';
import { SearchStringParser } from './common/search-string-parser/parser';
import { DevComponent } from './components/dev/dev.component';
import { HomeComponent } from './components/home/home.component';
import { NavbarComponent } from './components/navbar/navbar.component';
import { SearchInputComponent } from './components/search-input/search-input.component';
import { SearchComponent } from './components/search/search.component';
import { UpdateDialogComponent } from './components/update-dialog/update-dialog.component';
import { AngularMaterialModule } from './modules/angular-material.module';
import { SearchService } from './services/search.service';
import { SettingsService } from './services/settings.service';
import { UpdateService } from './services/update.service';
import { VideoPlayerComponent } from './components/video-player/video-player.component';

registerLocaleData(localeDe, 'de');

@NgModule({
  declarations: [
    AppComponent,
    SearchInputComponent,
    NavbarComponent,
    DevComponent,
    HomeComponent,
    SearchComponent,
    UpdateDialogComponent,
    VideoPlayerComponent
  ],
  imports: [
    BrowserModule,
    BrowserAnimationsModule,
    HttpClientModule,
    FormsModule,
    ReactiveFormsModule,
    AppRoutingModule,
    AngularMaterialModule,
    ServiceWorkerModule.register('/ngsw-worker.js', { enabled: environment.production })
  ],
  providers: [SearchService, SettingsService, UpdateService,
    { provide: SearchStringParser, useClass: SearchStringParser },
    { provide: LOCALE_ID, useValue: 'de_DE' }],
  bootstrap: [AppComponent]
})
export class AppModule { }
