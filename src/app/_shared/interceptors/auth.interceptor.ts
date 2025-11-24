import { HttpInterceptorFn } from "@angular/common/http"; 

/**
 * Interceptador para adicionar Authorization bearer na requisição
 * @param req 
 * 
 * @param next 
 * @returns 
 */
export const authInterceptor: HttpInterceptorFn = (req, next) => {

    const token = localStorage.getItem('token');
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
        return next(authReq)
    }
  //  Se o token não existir, a requisição é feita sem o autorization
    return next(req);
};