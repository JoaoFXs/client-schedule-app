import { Component } from '@angular/core';
import { LoginDTO, TokenDTO } from './model/login.model';
import { LoginService } from './services/login-service';
import { FormControl, FormGroup, FormsModule } from '@angular/forms';
import { MatSnackBar } from  '@angular/material/snack-bar';
import { timeout } from 'rxjs';
import { Validators } from '@angular/forms';
import { matchPasswordValidator } from './validators/match-password-validator';
import { Router } from '@angular/router';
@Component({
  selector: 'app-login',
  standalone: false,
  templateUrl: './login.component.html',
  styleUrl: './login.component.scss'
})
export class LoginComponent {
  
  loginMap!: LoginDTO;
  tokenMap!: TokenDTO;
  loginForm!: FormGroup;
  // Regex que exige: 1 maiúscula, 1 minúscula, 1 número, 1 especial, e mínimo 8 caracteres.
  complexPasswordRegex = /^(?=.*[a-z])(?=.*[A-Z])(?=.*[0-9])(?=.*[!@#$%^&*])(?=.{8,})/;

  // Regex que exige
  complexNameRegex = /^(?![ ])(?!.*[ ]{2})((?:e|da|do|das|dos|de|d'|D'|la|las|el|los)\s*?|(?:[a-zA-ZàáâäãåąčćęèéêëėįìíîïłńòóôöõøùúûüųūÿýżźñçčšžÀÁÂÄÃÅĄĆČĖĘÈÉÊËÌÍÎÏĮŁŃÒÓÔÖÕØÙÚÛÜŲŪŸÝŻŹÑßÇŒÆČŠŽ∂ð'][^\s]*\s*?)(?!.*[ ]$))+$/;
  
  // Regex que exige
  complexEmailRegex = /^[a-z0-9._%+-]+@[a-z0-9.-]+\.[a-z]{2,}$/i;
  
  loginState: boolean = true;
  constructor(
    private loginService: LoginService,
    private snack: MatSnackBar,
    private router: Router
  ){
  }

  ngOnInit(){
    this.loginForm = new FormGroup({
        email: new FormControl(''),
        phone: new FormControl(''),
        password: new FormControl(''),
        passwordConfirmation: new FormControl(''),
        cpf: new FormControl(''),
        username: new FormControl('') //
    });
  }

  


  public login(){
    this.setValidators()
        console.log("LOGIN STATE", this.loginState)
    if(this.loginForm.invalid){
      return;
    }

    this.loginMap = this.loginForm.value;
    
    if(!this.loginState){
      console.log("Registrando usuario")
          this.loginService.register(this.loginMap).subscribe(
            {
              next: (resposta) =>{
                  this.loginMap = new LoginDTO();
                  console.log(resposta);
                      this.loginState = true
                  this.router.navigateByUrl("/login");
              }
            }
          )
      
    }else{
        console.log(this.loginMap)
            this.loginService.login(this.loginMap).subscribe(
              {
              next: (resposta) => {
                this.loginMap = new LoginDTO();
                console.log(resposta);
                this.tokenMap = (resposta as TokenDTO);
                localStorage.setItem('token', JSON.stringify(this.tokenMap.token));
                this.showMessage('Login realizado com sucesso!', 'OK');
                this.loginState = true
                this.router.navigateByUrl("/");
              },
              error: (erro) => {
                this.showMessage('Email ou senha incorretos, tente novamente', 'X');
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
        const emailControl = this.loginForm.get('email');
        const passControl = this.loginForm.get('password');
        const passConfirmationControl = this.loginForm.get('passwordConfirmation');
        const phoneControl = this.loginForm.get('phone');
        const usernameControl = this.loginForm.get('username');
        const cpfControl = this.loginForm.get('cpf');

        if (this.loginState) {
          // Estado de Login: Remove ou simplifica validações
          emailControl?.setValidators([Validators.required, Validators.email]);
          passControl?.setValidators([Validators.required]);
          passConfirmationControl?.clearValidators();
          phoneControl?.clearValidators();
          usernameControl?.clearValidators();
          cpfControl?.clearValidators();
          this.loginForm.clearValidators();

        } else {
          // Estado de Cadastro (loginState false): Validações complexas
          emailControl?.setValidators([Validators.required, Validators.email, Validators.pattern(this.complexEmailRegex)]);
          passControl?.setValidators([Validators.required, Validators.minLength(12), Validators.pattern(this.complexPasswordRegex)]);
          passConfirmationControl?.setValidators([Validators.required]);
          phoneControl?.setValidators([Validators.required]);
          usernameControl?.setValidators([Validators.required, Validators.minLength(3), Validators.maxLength(100), Validators.pattern(this.complexNameRegex)]);
          cpfControl?.setValidators([Validators.required]);
          this.loginForm.setValidators(matchPasswordValidator);
        }

        // ESSENCIAL: Avisa o Angular para checar os campos agora
        emailControl?.updateValueAndValidity();
        passControl?.updateValueAndValidity();
        passConfirmationControl?.updateValueAndValidity();
        phoneControl?.updateValueAndValidity();
        usernameControl?.updateValueAndValidity();
        cpfControl?.updateValueAndValidity();

        // Inverte o estado
        this.loginForm.updateValueAndValidity();
  }


  changeValidatorsAndState(){
    this.setValidators();
    this.loginState = !this.loginState;
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
