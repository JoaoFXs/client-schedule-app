import { Component } from '@angular/core';
import { LoginDTO, TokenDTO } from './model/login.model';
import { LoginService } from './services/login-service';
import { FormsModule } from '@angular/forms';
import { MatSnackBar } from  '@angular/material/snack-bar';
import { timeout } from 'rxjs';

@Component({
  selector: 'app-login',
  standalone: false,
  templateUrl: './login.component.html',
  styleUrl: './login.component.scss'
})
export class LoginComponent {
  loginMap: LoginDTO = { email: '', password: '' };
  tokenMap: TokenDTO = { token: '' };

  constructor(
    private loginService: LoginService,
    private snack: MatSnackBar
  ){
  }

  public login(){
    this.loginService.login(this.loginMap).subscribe(
      {
       next: (resposta) => {
        this.loginMap = new LoginDTO();
        console.log(resposta);
        this.tokenMap = (resposta as TokenDTO);
        localStorage.setItem('token', JSON.stringify(this.tokenMap.token));
        this.showMessage('Login realizado com sucesso!', 'OK');
      },
      error: (erro) => {
        this.showMessage('Email ou senha incorretos, tente novamente', 'X');
      }
      }
    )
  }

  public showMessage(message: string, action?: string){
    this.snack.open(message, action,{
      duration: 3000,
      horizontalPosition: 'center',
      verticalPosition: 'top'
    });
  }

}
