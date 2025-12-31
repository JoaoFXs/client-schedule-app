import { inject } from "@angular/core";
import { CanActivate, Router } from "@angular/router";
import { CanActivateFn } from "@angular/router";
import { LoginService } from "../../pages/login/services/login-service";

export const authGuard: CanActivateFn = () => {
    
    const loginService = inject(LoginService);
    const router = inject(Router);

    if(loginService.verifyIfLoggedIn()){
        return true;
    }
    else{
        router.navigateByUrl("/login");
        return false;
    }

}