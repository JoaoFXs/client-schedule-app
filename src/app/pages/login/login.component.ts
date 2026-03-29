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
@Component({
  selector: 'app-login',
  standalone: false,
  templateUrl: './login.component.html',
  styleUrl: './login.component.scss'
})
export class LoginComponent implements OnInit, OnDestroy {
  
  loginMap!: LoginDTO;
  tokenMap!: TokenDTO;
  loginForm!: FormGroup;
  private destroy$ = new Subject<void>(); // Para limpar os subscribes
  loginState: boolean = true;
  isLoading: boolean = false;
  socialUser: SocialUser | null = null;

  constructor(
    private loginService: LoginService,
    private snack: MatSnackBar,
    private router: Router,
    private authService: SocialAuthService
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
              // Ajuste 'resposta.token' de acordo com o retorno da sua API
              const tokenStr = resposta.token || resposta;
              localStorage.setItem('token', tokenStr);

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

// --- Métodos Auxiliares para manter o código limpo ---
private prepareRegistrationForm(user: any) {
  this.loginState = false;
  this.loginForm.patchValue({
    email: user.email,
    username: user.name
  });
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
        this.showMessage(errorMsg, 'X');
        return EMPTY;
      })
    );
  }

  public handleLoginSuccess(){
    this.showMessage('Login realizado com sucesso!', 'OK');
    this.loginState = true
    this.router.navigateByUrl("/");
    this.isLoading = false;
  }

  public redirectToForgotPassword(){
    this.router.navigateByUrl("/forgot-password");
  }

  public login(){
    this.setValidators()
    console.log("LOGIN STATE", this.loginState)
    if(this.loginForm.invalid){
      return;
    }
    this.isLoading = true;
    this.loginMap = this.loginForm.value;

    if(!this.loginState){
       this.setValidators()
       
       if (this.socialUser && this.socialUser.idToken) {
         // 1. Usa o endpoint de cadastro social se veio do Google
         this.handleAutoRegistration(this.socialUser.idToken).subscribe();
       } else {
         // 2. Usa o endpoint de cadastro normal se for um usuário comum
         this.loginService.register(this.loginMap).subscribe(
           {
             next: (resposta) =>{
                 this.isLoading = false;
                 this.loginMap = new LoginDTO();
                 console.log(resposta);
                 this.loginState = true
                 this.router.navigateByUrl("/login");
             },
             error: (erro) =>{
                 this.isLoading = false;
                 const error = erro.error.message;
                 this.showMessage(error, 'X');
                 console.log(erro);
             }
           }
         )
       }
    }else{
        console.log(this.loginMap)
          this.loginService.login(this.loginMap).subscribe(
              {
              next: (resposta: any) => {
                // Ajuste 'resposta.token' de acordo com o retorno da sua API
                const tokenStr = resposta?.token || resposta;
                if (tokenStr) {
                  localStorage.setItem('token', tokenStr);
                }

                this.loginMap = new LoginDTO();
                this.showMessage('Login realizado com sucesso!', 'OK');
                this.loginState = true
                this.router.navigateByUrl("/");
                this.isLoading = false;
              },
              error: () => {
                this.showMessage('Email ou senha incorretos, tente novamente', 'X');
                this.isLoading = false;
              }
              }
      )
    }
  }

  public showMessage(message: string, action?: string){
    this.snack.open(message, action,{
      duration: 3000,
      horizontalPosition: 'center',
      verticalPosition: 'top'
    });
  }
  public cleanForm(){
    this.loginForm.reset();
  }
  hasUpperCase(val: string) { return /[A-Z]/.test(val); }
  hasLowerCase(val: string) { return /[a-z]/.test(val); }
  hasNumber(val: string) { return /[0-9]/.test(val); }
  hasSpecial(val: string) { return /[!@#$%^&*]/.test(val); }
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
        username: new FormControl('') //
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
}
