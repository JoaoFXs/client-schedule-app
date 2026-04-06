import { Injectable } from '@angular/core';
import { HttpClient } from '@angular/common/http';
import { Observable } from 'rxjs';
import { ChangePasswordDTO, ForgotPasswordDTO } from '../model/forgot-password.model';
import { SimpleMessageReturn } from '../model/forgot-password.model';
import { environment } from '../../../../../environments';
@Injectable({
  providedIn: 'root'
})
export class ForgotPasswordService {
  constructor(private http: HttpClient ) { }
  private readonly baseUrl = environment.apiUrl

  requestPasswordReset(dados: ForgotPasswordDTO): Observable<SimpleMessageReturn>{
    console.log("[requestPasswordReset] Dados antes de enviar", dados)
    return this.http.post<SimpleMessageReturn>(`${this.baseUrl}reset-password`, dados);
  }

  changePassword(dados: ChangePasswordDTO): Observable<SimpleMessageReturn>{
    console.log("[changePassword] Dados antes de enviar", dados)
    return this.http.put<SimpleMessageReturn>(`${this.baseUrl}reset-password`, dados);
  }

  validateToken(token: string): Observable<SimpleMessageReturn>{
    console.log("[validateToken] Dados antes de enviar", token)
    return this.http.get<SimpleMessageReturn>(`${this.baseUrl}reset-password?token=${token}`);
  }
  
}
