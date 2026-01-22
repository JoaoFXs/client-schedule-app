import { NgModule } from '@angular/core';
import { CommonModule } from '@angular/common';
import { ForgotPasswordComponent } from './forgot-password.component';
import { CommonsImports } from '../../_shared/commons_imports/commonsImports.module';
import { ForgotPasswordRoutingModule } from './forgot-pasword-routing.module';



@NgModule({
  declarations: [ForgotPasswordComponent],
  imports: [
    CommonModule, CommonsImports, ForgotPasswordRoutingModule
  ],
  exports: [],
  providers: []
})
export class ForgotPasswordModule { }
