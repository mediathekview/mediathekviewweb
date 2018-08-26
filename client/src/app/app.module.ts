import { registerLocaleData } from '@angular/common';
import german from '@angular/common/locales/de';
import { LOCALE_ID, NgModule } from '@angular/core';
import { BrowserModule } from '@angular/platform-browser';
import { BrowserAnimationsModule } from '@angular/platform-browser/animations';
import { ServiceWorkerModule } from '@angular/service-worker';
import { environment } from '../environments/environment';
import { AppRoutingModule } from './app-routing.module';
import { AppComponent } from './app.component';
import { DevComponent } from './sites/dev/dev.component';
import { HomeComponent } from './sites/home/home.component';
import { AngularMaterialModule } from './modules/angular-material.module';

registerLocaleData(german, 'de');

@NgModule({
  declarations: [
    AppComponent,
    DevComponent,
    HomeComponent
  ],
  imports: [
    BrowserModule,
    AppRoutingModule,
    AngularMaterialModule,
    ServiceWorkerModule.register('ngsw-worker.js', { enabled: environment.production }),
    BrowserAnimationsModule
  ],
  providers: [{ provide: LOCALE_ID, useValue: 'de_DE' }],
  bootstrap: [AppComponent]
})
export class AppModule { }
