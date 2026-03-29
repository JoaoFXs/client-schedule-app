import { HttpClient } from '@angular/common/http';
import { Injectable } from '@angular/core';
import { jwtDecode } from 'jwt-decode';
import { LoginDTO, TokenDTO, TokenPayload } from '../model/login.model';
import { Observable } from 'rxjs';

@Injectable({
  providedIn: 'root'
})
export class LoginService {

  constructor(private http: HttpClient) { }
  private readonly baseUrl = 'http://localhost:8080/api/'
  private loggedIn: boolean = false;


  login(dados: LoginDTO): Observable<LoginDTO>{
    var token  = this.http.post<LoginDTO>(`${this.baseUrl}auth/login`, dados);
    var tokenStr = token as TokenDTO;
    localStorage.setItem('token', JSON.stringify(tokenStr.token));
    return token;
  }

  register(dados: LoginDTO): Observable<LoginDTO>{
    console.log("Dados antes do cadastro:", dados);
    return this.http.post<LoginDTO>(`${this.baseUrl}auth/register`, dados);
  }
  
  getDadosUsuario(): TokenPayload | null{
    const token = localStorage.getItem('token');

    if (token){
      try{
        const decoded = jwtDecode<TokenPayload>(token);
        return decoded;
      } catch(error){
        console.error('Token invalidao', error);
        return null;
      }
    }
    return null;
  }

  isAdmin(): boolean | undefined{
    const dados = this.getDadosUsuario();
    return dados?.role?.includes("ADMIN");
  }

  verifyIfLoggedIn(): boolean{
    const token = localStorage.getItem('token');  
    return !!token;  
  }

  logout(){
    localStorage.removeItem('token');
  } 

  verifyIfUserExists(jwt: string | undefined): Observable<TokenDTO>{
    var token = this.http.get<TokenDTO>(`${this.baseUrl}auth/social-login/${jwt}`)
    var tokenStr = token as TokenDTO;
    localStorage.setItem('token', JSON.stringify(tokenStr.token));
    return token;
  }

  registerSocialUser(dados: LoginDTO, jwt: string | undefined): Observable<LoginDTO>{
    return this.http.post<LoginDTO>(`${this.baseUrl}auth/social-login/${jwt}`, dados);
  }

}
