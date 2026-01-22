import { Injectable } from '@angular/core';
import { HttpClient } from '@angular/common/http';
import { Observable } from 'rxjs';
import { ForgotPasswordDTO } from '../model/forgot-password.model';
import { SimpleMessageReturn } from '../model/forgot-password.model';

@Injectable({
  providedIn: 'root'
})
export class ForgotPasswordService {
  constructor(private http: HttpClient ) { }
  private readonly baseUrl = 'http://localhost:8080/api/'

  requestPasswordReset(dados: ForgotPasswordDTO): Observable<SimpleMessageReturn>{
    console.log("Dados antes de enviar", dados)
    return this.http.post<SimpleMessageReturn>(`${this.baseUrl}reset-password`, dados);
  }
  
}
