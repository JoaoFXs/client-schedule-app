import { HttpErrorResponse, HttpInterceptorFn } from '@angular/common/http';
import { inject } from '@angular/core';
import { Router } from '@angular/router';
import { catchError, throwError } from 'rxjs';
/**
 * Interceptador para adicionar Authorization bearer na requisição
 * @param req 
 * 
 * @param next 
 * @returns 
 */
export const authInterceptor: HttpInterceptorFn = (req, next) => {

    const router = inject(Router);
    
    const token = localStorage.getItem('token');

    // Clona a requisição se tiver token 
    let authReq = req;
    //  Se o token existir, a requisição é clonada e adicionamos o cabeçalho de authenticação
    if (token){
        console.log(`Token utilizado no interceptador: Bearer ${token}`)
        const authReq = req.clone(
            {
                setHeaders:{
                    Authorization: `Bearer ${token}`
                }
            }
        );
    }
    return next(authReq).pipe(
        catchError((error: HttpErrorResponse) => {
        
        // Verifica se o erro é 401 (Unauthorized) ou 403 (Forbidden)
        if (error.status === 401 || error.status === 403) {
            
            // Limpa o token inválido/expirado
            localStorage.removeItem('token');
            
            // Limpa outros dados do usuário
            //localStorage.removeItem('usuario-dados');

            // Redireciona para o login
            router.navigate(['/login']);
            // Mostra um alerta
            // alert('Sua sessão expirou. Por favor, faça login novamente.');
        }

        // 3. Importante: Repassa o erro para quem chamou (o Componente)
        // Isso permite que o componente pare o "loading", por exemplo.
        return throwError(() => error);
        })
    );
};