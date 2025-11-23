import { HttpClient } from '@angular/common/http';
import { Injectable } from '@angular/core';

import { LoginDTO } from '../model/login.model';
import { Observable } from 'rxjs';

@Injectable({
  providedIn: 'root'
})
export class LoginService {

  constructor(private http: HttpClient) { }
  private readonly baseUrl = 'http://localhost/api/'

  login(dados: LoginDTO): Observable<LoginDTO>{
    console.log("Dados antes de enviar", dados)
    return this.http.post<LoginDTO>(`${this.baseUrl}auth/login`, dados);
  }


}
