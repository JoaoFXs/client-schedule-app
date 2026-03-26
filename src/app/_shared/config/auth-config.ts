import { SocialAuthService, SocialAuthServiceConfig } from "@abacritt/angularx-social-login";

import { GoogleLoginProvider } from "@abacritt/angularx-social-login";

//Definição da configuração fora do módulo principal para organização
export const socialAuthConfig: SocialAuthServiceConfig = {
    autoLogin: false,
    providers: [
      {
        id: GoogleLoginProvider.PROVIDER_ID,
        provider: new GoogleLoginProvider(
          '703158384343-e06fsambbi5n9ncbf08uphtlv82a05rp.apps.googleusercontent.com'
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