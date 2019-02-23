import { registerLocaleData } from '@angular/common';
import { HttpClientModule } from '@angular/common/http';
import german from '@angular/common/locales/de';
import { LOCALE_ID, NgModule } from '@angular/core';
import { ReactiveFormsModule } from '@angular/forms';
import { BrowserModule } from '@angular/platform-browser';
import { BrowserAnimationsModule } from '@angular/platform-browser/animations';
import { ServiceWorkerModule } from '@angular/service-worker';
import { environment } from '../environments/environment';
import { AppRoutingModule } from './app-routing.module';
import { AppComponent } from './app.component';
import { SearchStringParser } from './common/search-string-parser/parser';
import { EntryListComponent } from './components/entry-list/entry-list.component';
import { NavbarComponent } from './components/navbar/navbar.component';
import { SearchInputComponent } from './components/search-input/search-input.component';
import { AngularCdkModule } from './modules/angular-cdk.module';
import { AngularMaterialModule } from './modules/angular-material.module';
import { FontAwesomeIconsModule } from './modules/font-awesome-icons.module';
import { DevComponent } from './sites/dev/dev.component';
import { HomeComponent } from './sites/home/home.component';

registerLocaleData(german, 'de');

@NgModule({
  declarations: [
    AppComponent,
    DevComponent,
    HomeComponent,
    NavbarComponent,
    SearchInputComponent,
    EntryListComponent,
  ],
  imports: [
    BrowserModule,
    AppRoutingModule,
    HttpClientModule,
    ServiceWorkerModule.register('ngsw-worker.js', { enabled: environment.production }),
    BrowserAnimationsModule,
    ReactiveFormsModule,
    AngularMaterialModule,
    FontAwesomeIconsModule,
    AngularCdkModule
  ],
  providers: [
    { provide: LOCALE_ID, useValue: 'de_DE' },
    { provide: SearchStringParser, useClass: SearchStringParser }
  ],
  bootstrap: [AppComponent]
})
export class AppModule { }
