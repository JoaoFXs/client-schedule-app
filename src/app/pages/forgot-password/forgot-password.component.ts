import { Component } from '@angular/core';
import { Form, FormGroup, Validators, FormControl } from '@angular/forms';
import { ForgotPasswordService } from './services/forgot-password.service';
import { MatSnackBar } from '@angular/material/snack-bar';
import { timeout } from 'rxjs';
import { Router, ActivatedRoute } from '@angular/router';
@Component({
  selector: 'app-forgot-password',
  templateUrl: './forgot-password.component.html',
  styleUrl: './forgot-password.component.scss',
  standalone: false
})
export class ForgotPasswordComponent {

  constructor(
    private forgotPasswordService: ForgotPasswordService,
    private snack: MatSnackBar,
    private router: Router,
    private route: ActivatedRoute
  ){
  }
  // Regex que exige
  complexEmailRegex = /^[a-z0-9._%+-]+@[a-z0-9.-]+\.[a-z]{2,}$/i;

  // Regex que exige: 1 maiúscula, 1 minúscula, 1 número, 1 especial, e mínimo 8 caracteres.
  complexPasswordRegex = /^(?=.*[a-z])(?=.*[A-Z])(?=.*[0-9])(?=.*[!@#$%^&*])(?=.{8,})/;

  forgotPasswordForm!: FormGroup;
  changePasswordForm!: FormGroup;
  messageConfirmated: boolean = false;
  statusMessage: string | undefined = "";
  isLoading: boolean = false;
  token: string | undefined;
  validationSuccess: boolean = false;


  ngOnInit(){
    this.route.queryParams.subscribe(params => { 
      this.token = params['token'];
    });

    if(this.token){
      this.validationSuccess = true;
      this.changePasswordForm = new FormGroup({
        password: new FormControl('', [Validators.required, Validators.pattern(this.complexPasswordRegex)]),
        passwordConfirmation: new FormControl('', [Validators.required]),
        token: new FormControl(this.token)
      });
    }

    console.log("Token capturado", this.token);
     this.forgotPasswordForm = new FormGroup({
      email: new FormControl('')
    });

  }


  changePassword(){
    this.setValidatorsChangePassword();
    console.log(this.changePasswordForm.value);
    if(this.changePasswordForm.invalid){
    return;
    }
    this.isLoading = true;
    const formValue = this.changePasswordForm.value;
    this.changePasswordForm.disable();

    const changePasswordObj = {
      newPassword: formValue.password,
      token: formValue.token
    }

    this.forgotPasswordService.changePassword(changePasswordObj as any).subscribe(
      {  next: (resposta) => {
        this.isLoading = false;
        this.changePasswordForm.enable();
        this.statusMessage = resposta.message;
        this.showMessage(this.statusMessage!, "OK");
        this.changePasswordForm.reset();
        this.router.navigateByUrl("/login");
      },
      error: (erro) => {
        this.isLoading = false;
        this.changePasswordForm.enable();
        console.log(erro);
        }
    })
  }


  requestReset(){
      this.setValidatorsRequestReset();
      console.log(this.forgotPasswordForm.value);
      if(this.forgotPasswordForm.invalid){
      return;
      }
      this.isLoading = true;
      const formValue = this.forgotPasswordForm.value;
      this.forgotPasswordForm.disable();
      this.forgotPasswordService.requestPasswordReset(formValue).subscribe(
        {  next: (resposta) => {
          this.isLoading = false;
          this.forgotPasswordForm.enable();
          this.statusMessage = resposta.message;
          this.messageConfirmated = true;
          this.forgotPasswordForm.reset();
            console.log(resposta);
          },
          error: (erro) => {
            this.isLoading = false;
            this.forgotPasswordForm.enable();
            console.log(erro);
          }
        })
    }

  
  setValidatorsRequestReset(){
    const emailControl = this.forgotPasswordForm.get('email');
    emailControl?.setValidators([Validators.required, Validators.email, Validators.pattern(this.complexEmailRegex)]);
    emailControl?.updateValueAndValidity();
    // Inverte o estado
    this.forgotPasswordForm.updateValueAndValidity();
  }

   setValidatorsChangePassword(){
    const passControl = this.changePasswordForm.get('password');
    const passConfirmationControl = this.changePasswordForm.get('passwordConfirmation');
    passControl?.setValidators([Validators.required, Validators.minLength(12), Validators.pattern(this.complexPasswordRegex)]);
    passConfirmationControl?.setValidators([Validators.required]);
    passControl?.updateValueAndValidity();
    passConfirmationControl?.updateValueAndValidity();
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

  hasUpperCase(val: string) { return /[A-Z]/.test(val); }
  hasLowerCase(val: string) { return /[a-z]/.test(val); }
  hasNumber(val: string) { return /[0-9]/.test(val); }
  hasSpecial(val: string) { return /[!@#$%^&*]/.test(val); }

  redirectToLogin(){[
    this.router.navigateByUrl("/login")
  ]}
  public showMessage(message: string, action?: string){
    this.snack.open(message, action,{
      duration: 3000,
      horizontalPosition: 'center',
      verticalPosition: 'top'
    });
  }
}
