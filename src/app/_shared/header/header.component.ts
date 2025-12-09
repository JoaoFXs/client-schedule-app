import { Component, OnInit } from '@angular/core';
import { Router } from '@angular/router';
import { LoginService } from '../../pages/login/services/login-service';


@Component({
  selector: 'app-header',
  standalone: false,
  templateUrl: './header.component.html',
  styleUrl: './header.component.scss'
})
export class HeaderComponent implements OnInit{
  showFiller = false;
  loggedIn = false;
  username: string | undefined = '';
  email: string | undefined = '';
  
  ngOnInit(): void {
    const dados = this.login.getDadosUsuario();
    console.log("DADOS", dados);
    console.log(this.loggedIn)
    this.username = dados?.name;
    this.email = dados?.sub;
  }

  constructor(
    private router: Router,
    private login: LoginService
  ){
  }
  
 
  redirectLogin(){
    console.log("redirectLogin");
    this.router.navigate(['/login']);
  }


}
