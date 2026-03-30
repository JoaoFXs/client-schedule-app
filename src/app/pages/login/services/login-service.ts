import { HttpClient } from '@angular/common/http';
import { Injectable } from '@angular/core';
import { jwtDecode } from 'jwt-decode';
import { LoginDTO, TokenDTO, TokenPayload } from '../model/login.model';
import { BehaviorSubject, Observable, tap } from 'rxjs';
import { SocialAuthService } from '@abacritt/angularx-social-login';

@Injectable({
  providedIn: 'root'
})
export class LoginService {

  constructor(
    private http: HttpClient,
    private authService: SocialAuthService
  ) { }
  private readonly baseUrl = 'http://localhost:8080/api/'

  // Usamos BehaviorSubject para manter o estado reativo do usuário
  private currentUserSubject = new BehaviorSubject<TokenPayload | null>(this.getDadosUsuarioDecoded());
  public currentUser$ = this.currentUserSubject.asObservable();


  login(dados: LoginDTO): Observable<LoginDTO>{
    return this.http.post<LoginDTO>(`${this.baseUrl}auth/login`, dados).pipe(
      tap((resposta: any) => {
        if (resposta && resposta.token) {
          this.salvarToken(resposta.token);
        }
      })
    );
  }

  register(dados: LoginDTO): Observable<LoginDTO>{
    return this.http.post<LoginDTO>(`${this.baseUrl}auth/register`, dados);
  }
  
  public salvarToken(token: string): void {
    // Salva o token sem JSON.stringify para evitar adicionar aspas duplas extras
    localStorage.setItem('token', token);
    // Atualiza o estado global na mesma hora
    this.currentUserSubject.next(this.getDadosUsuarioDecoded());
  }

  private getDadosUsuarioDecoded(): TokenPayload | null {
    let token = localStorage.getItem('token');
    if (token){
      try{
        // Remove aspas duplas caso tenham ficado presas no cache do navegador
        if (token.startsWith('"') && token.endsWith('"')) { token = token.substring(1, token.length - 1); }
        
        return jwtDecode<TokenPayload>(token);
      } catch(error){
        console.error('Token invalidao', error);
        return null;
      }
    }
    return null;
  }

  getDadosUsuario(): TokenPayload | null {
    return this.currentUserSubject.value;
  }

  isAdmin(): boolean | undefined{
    const dados = this.getDadosUsuario();
    return dados?.role?.includes("ADMIN");
  }

  verifyIfLoggedIn(): boolean{
    return !!this.currentUserSubject.value;  
  }

  logout(){
    localStorage.removeItem('token');
    this.currentUserSubject.next(null); // Limpa o estado global ao deslogar
    
    // Desloga também da sessão do Google, limpando a sessão em background
    this.authService.signOut().catch(err => {
      console.log('O usuário não estava logado via provedor social ou ocorreu um erro:', err);
    });
  } 

  verifyIfUserExists(jwt: string | undefined): Observable<TokenDTO>{
    return this.http.get<TokenDTO>(`${this.baseUrl}auth/social-login/${jwt}`).pipe(
      tap((resposta: any) => {
        console.log('Token recebido do backend:', resposta);
        if (resposta && resposta.token) {
          this.salvarToken(resposta.token);
        }
      })
    );
  }

  registerSocialUser(dados: LoginDTO, jwt: string | undefined): Observable<LoginDTO>{
    return this.http.post<LoginDTO>(`${this.baseUrl}auth/social-login/${jwt}`, dados);
  }

}
