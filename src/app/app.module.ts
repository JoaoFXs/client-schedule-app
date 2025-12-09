import { NgModule } from '@angular/core';
import { BrowserModule } from '@angular/platform-browser';
import { HeaderModule } from './_shared/header/header.module';
import { AppRoutingModule } from './app-routing.module'
import { AppComponent } from './app.component';
import { ApplicationConfig, provideZoneChangeDetection } from '@angular/core';
import { provideRouter } from '@angular/router';
import { provideAnimations } from '@angular/platform-browser/animations';

import { provideHttpClient, withInterceptors } from '@angular/common/http';
import { authInterceptor } from './_shared/interceptors/auth.interceptor';
@NgModule({
  declarations: [
    AppComponent
  ],
  imports: [
    BrowserModule,
    HeaderModule,
    AppRoutingModule
  ],
  providers: [ provideZoneChangeDetection({ eventCoalescing: true }),  
    provideAnimations(), 
    provideHttpClient(), 
    provideHttpClient(withInterceptors([authInterceptor]))],
  bootstrap: [AppComponent]
})
export class AppModule { }
