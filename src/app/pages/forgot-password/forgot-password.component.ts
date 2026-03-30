import { Component } from '@angular/core';
import { Form, FormGroup, Validators, FormControl } from '@angular/forms';
import { ForgotPasswordService } from './services/forgot-password.service';
import { MatSnackBar } from '@angular/material/snack-bar';
import { tap, timeout } from 'rxjs';
import { Router, ActivatedRoute } from '@angular/router';
import { NotificationServiceService } from '../../_shared/services/notification-service.service';
import { PasswordValidationUtils } from '../../_shared/utils/password-validation-utils';
import { REGEX_PATTERNS} from '../../_shared/constants/regex.constants';
import { Subject } from 'rxjs';
@Component({
  selector: 'app-forgot-password',
  templateUrl: './forgot-password.component.html',
  styleUrl: './forgot-password.component.scss',
  standalone: false
})
export class ForgotPasswordComponent {
  forgotPasswordForm!: FormGroup; // Formulário reativo para solicitação de reset de senha
  changePasswordForm!: FormGroup; // Formulário reativo para mudança de senha, inicializado após validação do token
  messageConfirmated: boolean = false; // Indicador para mostrar mensagem de confirmação após solicitação de reset de senha
  statusMessage: string | undefined = ""; // Mensagem de status para exibir feedback ao usuário
  isLoading: boolean = false; // Indicador de carregamento para feedback visual durante operações assíncronas
  token: string | undefined; // Armazena o token recebido para mudança de senha
  validationSuccess: boolean = false; // Indicador para mostrar o formulário de mudança de senha apenas se o token for validado com sucesso
  errorToken: boolean = false; // Indicador para mostrar mensagem de erro caso o token seja inválido ou expirado
  errorTokenMessage: string | undefined = ""; // Mensagem de erro específica para problemas com o token
  private destroy$ = new Subject<void>(); // Para limpar os subscribes

  constructor(
    private forgotPasswordService: ForgotPasswordService,
    private notificationService: NotificationServiceService,
    private router: Router,
    private route: ActivatedRoute,
    public passwordValidationUtils: PasswordValidationUtils
  ){
  }
  ngOnInit(){
    this.initForm();
    this.listenToQueryParams();
  }

  ngOnDestroy() {
    this.destroy$.next();
    this.destroy$.complete();
  }

  // Inicializa o formulário de solicitação de reset de senha
  private initForm(){
    this.forgotPasswordForm = new FormGroup({
      email: new FormControl('')
    });
  }
  // Lógica para escutar os parâmetros da URL e validar o token
  private listenToQueryParams(){
    this.route.queryParams.pipe(
      tap(params => {
        this.handleSuccessQueryParams(params);
      }),
      timeout(5000) // Timeout para evitar ficar esperando indefinidamente
    ).subscribe({
      error: (erro) => {
        this.handleErrorQueryParams(erro);
      }
    });
  }

  // Iniciar o formulário de mudança de senha com o token recebido
  private initChangePasswordForm(token: string){
    this.changePasswordForm = new FormGroup({
      password: new FormControl('', [Validators.required, Validators.pattern(REGEX_PATTERNS.COMPLEX_PASSWORD)]),  
      passwordConfirmation: new FormControl('', [Validators.required]),
      token: new FormControl(token)
    });
  }
  // Manipula o sucesso na leitura dos parâmetros da URL, indicando que o token é válido e inicializando o formulário de mudança de senha
  private handleSuccessQueryParams(params: any){
    this.validationSuccess = true;
    this.errorToken = false;
    this.initChangePasswordForm(params['token']);
  }
  // Manipula erros na leitura dos parâmetros da URL, indicando que o token é inválido ou expirado
  private handleErrorQueryParams(erro: any){
     this.errorToken = true;
     this.validationSuccess = false;
     this.errorTokenMessage = erro.error.message;
     console.log(erro);
  }

  // Lógica para enviar a solicitação de mudança de senha, incluindo validação do formulário, chamada ao serviço e tratamento de respostas
  changePassword(){
    this.setValidatorsChangePassword();
    if(this.changePasswordForm.invalid) return;

    this.isLoading = true;
    const formValue = this.changePasswordForm.value;
    this.changePasswordForm.disable();

    const changePasswordObj = {
      newPassword: formValue.password,
      token: formValue.token
    }

   this.forgotPasswordService.changePassword(changePasswordObj as any).subscribe(
      {  next: (resposta) => {
        this.handleChangePasswordSuccess(resposta);
      },
      error: (erro) => {
        this.handleChangePasswordError(erro);
      }
    })
  }

  // Método auxiliar para lidar com o sucesso na mudança de senha, exibindo uma mensagem de sucesso e redirecionando para a página de login
  private handleChangePasswordSuccess(resposta: any){
    this.isLoading = false;
    this.changePasswordForm.enable();
    this.statusMessage = resposta.message;
    this.notificationService.showMessage(this.statusMessage!, "OK");
    this.changePasswordForm.reset();
    this.router.navigateByUrl("/login");
  }

  // Método auxiliar para lidar com erros na mudança de senha, exibindo mensagens de erro apropriadas e permitindo que o usuário tente novamente
  private handleChangePasswordError(erro: any){
        if(erro.status == 400){
            this.errorToken = true;
            this.validationSuccess = false;
            this.errorTokenMessage = erro.error.message;
        }else{
           this.isLoading = false;
          this.changePasswordForm.enable();
          this.notificationService.showMessage(erro.error.message, "OK");
          this.changePasswordForm.reset();
          console.log(erro);
        }
  }
  // Lógica para enviar a solicitação de reset de senha, incluindo validação do formulário e chamada ao serviço
  requestReset(){
      this.setValidatorsRequestReset();
      if(this.forgotPasswordForm.invalid) return;

      this.isLoading = true;
      const formValue = this.forgotPasswordForm.value;
      this.forgotPasswordForm.disable();

      this.forgotPasswordService.requestPasswordReset(formValue).subscribe(
        {  next: (resposta) => {
            this.handleSuccessForgotPassword(resposta);
          },
          error: (erro) => {
            this.handleErrorForgotPassword(erro);
          }
        })
    }

  //Método auxiliar para lidar com o sucesso na solicitação de reset de senha, exibindo uma mensagem de confirmação e permitindo que o usuário volte para a página de login
  private handleSuccessForgotPassword(resposta: any){
      this.isLoading = false;
      this.forgotPasswordForm.enable();
      this.statusMessage = resposta.message;
      this.messageConfirmated = true;
      this.forgotPasswordForm.reset();
      console.log(resposta);
  }

  //Método auxiliar para lidar com erros na solicitação de reset de senha, exibindo mensagens de erro apropriadas e permitindo que o usuário tente novamente
  private handleErrorForgotPassword(erro: any){
      this.isLoading = false;
      this.forgotPasswordForm.enable();
      console.log(erro);
  }

  // Configura as validações para o formulário de solicitação de reset de senha, exigindo um email válido
  setValidatorsRequestReset(){
    const emailControl = this.forgotPasswordForm.get('email');
    emailControl?.setValidators([Validators.required, Validators.email, Validators.pattern(REGEX_PATTERNS.COMPLEX_EMAIL_REGEX)]);
    emailControl?.updateValueAndValidity();
    // Inverte o estado
    this.forgotPasswordForm.updateValueAndValidity();
  }

  // Configura as validações para o formulário de mudança de senha, exigindo uma senha complexa e confirmação de senha
  setValidatorsChangePassword(){
    const controls = this.changePasswordForm.controls;
    controls['password']?.setValidators([Validators.required, Validators.pattern(REGEX_PATTERNS.COMPLEX_PASSWORD)]);
    controls['passwordConfirmation']?.setValidators([Validators.required]);
    Object.values(controls).forEach(control => control.updateValueAndValidity());
    // Inverte o estado
    this.changePasswordForm.updateValueAndValidity();
  }
  get email(){
    return this.forgotPasswordForm.get('email')!;
  }
  get password(){
    return this.changePasswordForm.get('password')!;
  }

  get passwordConfirmation(){
    return this.changePasswordForm.get('passwordConfirmation')!;
  }
  redirectToLogin(){[
    this.router.navigateByUrl("/login")
  ]}
}
