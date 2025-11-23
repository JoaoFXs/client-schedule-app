import { Component } from '@angular/core';
import { LoginDTO } from './model/login.model';
import { LoginService } from './services/login-service';
import { FormsModule } from '@angular/forms';
@Component({
  selector: 'app-login',
  standalone: true,
  imports: [FormsModule],
  templateUrl: './login.component.html',
  styleUrl: './login.component.scss'
})
export class LoginComponent {
  loginMap: LoginDTO = { email: '', password: '' };

  constructor(
    private loginService: LoginService
  ){
  }

  login(){
    this.loginService.login(this.loginMap).subscribe(
      {
       next: (resposta) => {
        console.log('Sucesso!', resposta);
        alert('Logado!');
      },
      error: (erro) => {
        console.error('Deu ruim:', erro);
        alert('Erro ao agendar.');
      }
      }
    )
  }
}
