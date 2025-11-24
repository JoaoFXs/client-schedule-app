import { HttpClient } from '@angular/common/http';
import { Injectable } from '@angular/core';
import { jwtDecode } from 'jwt-decode';
import { LoginDTO, TokenPayload } from '../model/login.model';
import { Observable } from 'rxjs';

@Injectable({
  providedIn: 'root'
})
export class LoginService {

  constructor(private http: HttpClient) { }
  private readonly baseUrl = 'http://localhost:8080/api/'

  login(dados: LoginDTO): Observable<LoginDTO>{
    console.log("Dados antes de enviar", dados)
    return this.http.post<LoginDTO>(`${this.baseUrl}auth/login`, dados);
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


}
