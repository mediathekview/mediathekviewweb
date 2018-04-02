import { HttpClientModule } from '@angular/common/http';
import { NgModule } from '@angular/core';
import { FormsModule, ReactiveFormsModule } from '@angular/forms';
import { BrowserModule } from '@angular/platform-browser';
import { BrowserAnimationsModule } from '@angular/platform-browser/animations';
import { ServiceWorkerModule } from '@angular/service-worker';

import { environment } from '../environments/environment';
import { AppRoutingModule } from './app-routing.module';
import { AppComponent } from './app.component';
import { SearchStringParser } from './common/search-string-parser/parser';
import { NavbarComponent } from './components/navbar/navbar.component';
import { SearchInputComponent } from './components/search-input/search-input.component';
import { SearchResultTableComponent } from './components/search-result-table/search-result-table.component';
import { AngularMaterialModule } from './modules/angular-material.module';
import { SearchService } from './services/search.service';
import { SettingsService } from './services/settings.service';
import { DevComponent } from './components/dev/dev.component';
import { HomeComponent } from './components/home/home.component';

@NgModule({
  declarations: [
    AppComponent,
    SearchInputComponent,
    NavbarComponent,
    SearchResultTableComponent,
    DevComponent,
    HomeComponent
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
  providers: [SearchService, SettingsService, { provide: SearchStringParser, useClass: SearchStringParser }],
  bootstrap: [AppComponent]
})
export class AppModule { }
