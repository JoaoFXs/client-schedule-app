export class ForgotPasswordDTO{
    email?: String;
}

export class SimpleMessageReturn{
    message?: string;
}

export class ChangePasswordDTO{
    token?: string;
    password?: string; 
}