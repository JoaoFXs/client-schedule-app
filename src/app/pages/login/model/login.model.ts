export class LoginDTO{
    email?: String;
    password?: String;
}

export class TokenDTO{
    token?: String;
}

export interface TokenPayload{
  sub: string;       // Geralmente é o email ou username (subject)
  exp: number;       // Data de expiração
  role?: string[];     
  name?: string;     
}

