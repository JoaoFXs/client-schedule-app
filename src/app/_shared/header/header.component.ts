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

  username: string | undefined = '';
  email: string | undefined = '';
  
  ngOnInit(): void {
    const dados = this.loginService.getDadosUsuario();
    console.log("DADOS", dados);
    this.username = dados?.name;
    this.email = dados?.sub;
  }

  constructor(
    private router: Router,
    public loginService: LoginService
  ){
  }
  
 
  redirectLogin(){
    console.log("redirectLogin");
    this.router.navigate(['/login']);
  }


}
