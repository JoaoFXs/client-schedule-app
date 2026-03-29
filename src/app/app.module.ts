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
import { GoogleLoginProvider, SocialLoginModule, GoogleSigninButtonModule, SocialAuthServiceConfig, SOCIAL_AUTH_CONFIG } from '@abacritt/angularx-social-login';
import { importProvidersFrom } from '@angular/core';
@NgModule({
  declarations: [
    AppComponent
  ],
  imports: [
    BrowserModule,
    HeaderModule,
    AppRoutingModule,
    /** Social Login Modules */
    SocialLoginModule,
    GoogleSigninButtonModule
  ],
  providers: [ 
    {
      provide: SOCIAL_AUTH_CONFIG,
      useValue: {
        autoLogin: false,
        providers: [
          {
            id: GoogleLoginProvider.PROVIDER_ID,
            provider: new GoogleLoginProvider(
              '703158384343-e06fsambbi5n9ncbf08uphtlv82a05rp.apps.googleusercontent.com', // Replace with your actual client ID
              { oneTapEnabled: false }
            ),
          },
          // Add other providers as needed (Facebook, etc.)
        ],
        onError: (err: any) => {
          console.error('SocialAuth Error', err);
        },
      } as SocialAuthServiceConfig,
    },
    provideZoneChangeDetection({ eventCoalescing: true }),  
    provideAnimations(), 
    provideHttpClient(withInterceptors([authInterceptor]))
    
  ],
  bootstrap: [AppComponent]
})
export class AppModule { }
