import { SocialAuthService, SocialAuthServiceConfig } from "@abacritt/angularx-social-login";

import { GoogleLoginProvider } from "@abacritt/angularx-social-login";

//Definição da configuração fora do módulo principal para organização
export const socialAuthConfig: SocialAuthServiceConfig = {
    autoLogin: false,
    providers: [
      {
        id: GoogleLoginProvider.PROVIDER_ID,
        provider: new GoogleLoginProvider(
          'client-id'
        )
      }
    ],
    onError: (err) => {
      console.error(err);
    }
  };

  export const provideSocialAuth = {
    provide: 'SocialAuthServiceConfig',
    useValue: socialAuthConfig
  }