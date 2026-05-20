import { Component, OnInit } from '@angular/core';
import { Router } from '@angular/router';
import { LoginService } from '../../pages/core/login/services/login-service';


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
    // Se inscrevendo no estado reativo do serviço
    this.loginService.currentUser$.subscribe(dados => {
      this.username = dados?.name;
      this.email = dados?.sub;
    });
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
  get userInitials(): string {
    if (!this.username) return '?';
    return this.username.split(' ').map((n: string) => n[0]).slice(0, 2).join('').toUpperCase();
  }

  redirectScheduling(){
    console.log("redirectScheduling");
    this.router.navigate(['/scheduling/search']);
  }

}
