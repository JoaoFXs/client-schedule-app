import { Component, OnInit, OnDestroy } from '@angular/core';
import { LoginDTO, TokenDTO, ErrorResponse } from './model/login.model';
import { LoginService } from './services/login-service';
import { FormControl, FormGroup, FormsModule } from '@angular/forms';
import { MatSnackBar } from  '@angular/material/snack-bar';
import { timeout } from 'rxjs';
import { Validators } from '@angular/forms';
import { matchPasswordValidator } from './validators/match-password-validator';
import { Router } from '@angular/router';
import { SocialAuthService, SocialUser } from '@abacritt/angularx-social-login';
import { REGEX_PATTERNS } from '../../_shared/constants/regex.constants';
import { Subject,takeUntil, filter, switchMap,tap, EMPTY, catchError,  } from 'rxjs';
import { NotificationServiceService } from '../../_shared/services/notification-service.service';
import { PasswordValidationUtils } from '../../_shared/utils/password-validation-utils';
@Component({
  selector: 'app-login',
  standalone: false,
  templateUrl: './login.component.html',
  styleUrl: './login.component.scss'
})
export class LoginComponent implements OnInit, OnDestroy {
  
  loginMap!: LoginDTO; // Mapeamento para o login, pode ser usado tanto para login quanto para registro
  tokenMap!: TokenDTO; // Mapeamento para o token
  loginForm!: FormGroup; // Formulário reativo para login e registro
  loginState: boolean = true; // true = Login, false = Cadastro
  isLoading: boolean = false; // Indicador de carregamento para feedback visual
  socialUser: SocialUser | null = null; // Armazena os dados do usuário social (Google)
  private destroy$ = new Subject<void>(); // Para limpar os subscribes

  constructor(
    private loginService: LoginService,
    private notificationService: NotificationServiceService,
    private router: Router,
    private authService: SocialAuthService,
    public passwordValidationUtils: PasswordValidationUtils
  ){
  }

  ngOnInit(){
    this.initForm();
    this.listenToLoginSocial();
  }

  ngOnDestroy() {
    this.destroy$.next();
    this.destroy$.complete();
  }

  private listenToLoginSocial() {
    // Inscreva-se para escutar o retorno do login do Google
    this.authService.authState.pipe(
      takeUntil(this.destroy$),
      // 1. Filtra se o usuário existe e salva os dados iniciais
      tap(user => {
        this.socialUser = user;
        console.log('Dados recebidos do Google:', user);
      }),
      // 2. Muda para o fluxo de verificação no backend
      switchMap(user => {
        if (!user) return EMPTY; // Se não houver user, encerra o fluxo
        
        return this.loginService.verifyIfUserExists(user.idToken).pipe(
          // Se o usuário existir e retornar o token
          tap((resposta: any) => {
            if (resposta) {

              this.handleLoginSuccess();
            }
          }),
          // 3. Tratamento de erro: se o usuário não existe (404 ou erro do backend)
          catchError(err => {
            console.error('Usuário não existe, iniciando pré-cadastro:', err);
            this.prepareRegistrationForm(user);
            
            // Aqui você pode decidir se quer disparar o registro automaticamente
            // ou se o fluxo deve parar para o usuário clicar em "Confirmar"
            return this.handleAutoRegistration(user.idToken); 
          })
        );
      })
    ).subscribe();
  }

// --- Métodos Auxiliares do listenToLoginSocial ---
private prepareRegistrationForm(user: any) {
  this.loginState = false;
  this.loginForm.patchValue({
    email: user.email,
    username: user.name
  });

  //Desabilita apenas o campo de email para edição
  this.loginForm.get('email')?.disable();
  this.setValidators();
}

private handleAutoRegistration(jwt: string | undefined) {
    if (this.loginForm.invalid) return EMPTY;

    this.isLoading = true;
    const registrationData = this.loginForm.value;

    return this.loginService.registerSocialUser(registrationData, jwt).pipe(
      tap(() => {
        this.isLoading = false;
        this.loginMap = new LoginDTO();
        this.loginState = true;
        this.router.navigateByUrl("/login");
      }),
      catchError(erro => {
        this.isLoading = false;
        const errorMsg = erro.error?.message || 'Erro ao registrar';
        this.notificationService.showMessage(errorMsg, 'X');
        return EMPTY;
      })
    );
  }
  
  public handleLoginSuccess(){
    this.notificationService.showMessage('Login realizado com sucesso!', 'OK');
    this.loginState = true
    this.router.navigateByUrl("/");
    this.isLoading = false;
  }

  public redirectToForgotPassword(){
    this.router.navigateByUrl("/forgot-password");
  }
// Método principal para lidar com login e registro dependendo do estado atual (loginState)
public login(): void {
  this.setValidators();
  
  if (this.loginForm.invalid) return;

  this.isLoading = true;
  const payload = this.loginForm.value;

  // 1. Determina qual fluxo seguir
  const request$ = this.loginState 
    ? this.loginService.login(payload) 
    : this.getRegisterObservable(payload);

  // 2. Executa a requisição de forma limpa
  request$.subscribe({
    next: (res) => this.handleAuthSuccess(res),
    error: (err) => this.handleAuthError(err),
    complete: () => this.isLoading = false
  });
}

/** * Métodos Auxiliares de login()
 */

private getRegisterObservable(payload: any) {
  // Se for social, usa o auto-registro, senão o registro normal
  return (this.socialUser?.idToken) 
    ? this.handleAutoRegistration(this.socialUser.idToken)
    : this.loginService.register(payload);
}

private handleAuthSuccess(resposta: any) {
  const token = resposta?.token || resposta;
  if (token) this.loginService.salvarToken(token);

  this.notificationService.showMessage('Login realizado com sucesso!', 'OK');
  
  // Reset de estado
  this.loginMap = new LoginDTO();
  this.loginState = true;
  
  const targetUrl = this.loginState ? '/' : '/login';
  this.router.navigateByUrl(targetUrl);
}

private handleAuthError(erro: any) {
  this.isLoading = false;
  const msg = erro?.error?.message || 'Email ou senha incorretos, Tente novamente.';
  this.notificationService.showMessage(msg, 'X');
}
  
  public cleanForm(){
    this.loginForm.reset();
  }

  setValidators(){      
        const controls = this.loginForm.controls;
        if (this.loginState) {
          // Estado de Login: Remove ou simplifica validações
          controls['email']?.setValidators([Validators.required, Validators.email]);
          controls['password']?.setValidators([Validators.required]);
          controls['passwordConfirmation']?.clearValidators();
          controls['phone']?.clearValidators();
          controls['username']?.clearValidators();
          controls['cpf']?.clearValidators();
          this.loginForm.clearValidators();
        } else {
          // Estado de Cadastro (loginState false): Validações complexas
          controls['email']?.setValidators([Validators.required, Validators.email, Validators.pattern(REGEX_PATTERNS.COMPLEX_EMAIL_REGEX)]);
          controls['password']?.setValidators([Validators.required, Validators.minLength(8), Validators.pattern(REGEX_PATTERNS.COMPLEX_PASSWORD)]);
          controls['passwordConfirmation']?.setValidators([Validators.required]);
          controls['phone']?.setValidators([Validators.required]);
          controls['username']?.setValidators([Validators.required, Validators.minLength(3), Validators.maxLength(100), Validators.pattern(REGEX_PATTERNS.COMPLEX_NAME_REGEX)]);
          controls['cpf']?.setValidators([Validators.required]);
          controls['isCompany']?.setValidators([Validators.required]);
          this.loginForm.setValidators(matchPasswordValidator);
        }
        // ESSENCIAL: Avisa o Angular para checar os campos agora
        Object.values(controls).forEach(control => control.updateValueAndValidity());
        // Inverte o estado
        this.loginForm.updateValueAndValidity();
  }
  changeValidatorsAndState(){
    this.loginState = !this.loginState;
    if (this.loginState) {
      // Se desistiu do cadastro e voltou para o Login, limpa os rastros do Google
      this.socialUser = null;
    }
    this.setValidators();
  }
  private initForm(){
   this.loginForm = new FormGroup({
        email: new FormControl(''),
        phone: new FormControl(''),
        password: new FormControl(''),
        passwordConfirmation: new FormControl(''),
        cpf: new FormControl(''),
        username: new FormControl(''),
        isCompany: new FormControl('')
    });
  }
  get email(){
    return this.loginForm.get('email')!;
  }
  get password(){
    return this.loginForm.get('password')!;
  }
  get phone(){
    return this.loginForm.get('phone');
  }
  get username(){
    return this.loginForm.get('username');
  }
  get passwordConfirmation(){
    return this.loginForm.get('passwordConfirmation')!;
  }
  get cpf(){
    return this.loginForm.get('cpf')!;
  }
  get isCompany(){
    return this.loginForm.get('isCompany')!;
  }
}
