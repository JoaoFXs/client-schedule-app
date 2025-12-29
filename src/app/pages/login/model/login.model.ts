export class LoginDTO{
    name?: String;
    email?: String;
    password?: String;
    cpf?: String;
    phone?: String;
    passwordConfirmation?: String;
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


export class ErrorResponse{
  error?: ErrorDetail;
  status?: string;
  code?: string;
  message?: string;
}

export class ErrorDetail {
  status?: string;
  code?: string;
  message?: string;
}
