import { Component } from '@angular/core';
import { RouterOutlet } from '@angular/router';
import { HeaderModule } from './_shared/header/header.module';
import { LoginComponent } from './pages/login/login.component';

@Component({
  selector: 'app-root',
  imports: [RouterOutlet, HeaderModule],
  templateUrl: './app.component.html',
  styleUrl: './app.component.scss'
})
export class AppComponent {
  title = 'client-schedule-app';
}
