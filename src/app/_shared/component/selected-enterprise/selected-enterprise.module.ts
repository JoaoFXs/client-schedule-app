import { NgModule } from '@angular/core';
import { CommonModule } from '@angular/common';
import { SelectedEnterpriseComponent } from './selected-enterprise.component';
import { CommonsImports } from '../../commons_imports/commonsImports.module';
import { MatIconModule } from '@angular/material/icon';



@NgModule({
  declarations: [SelectedEnterpriseComponent],
  exports: [SelectedEnterpriseComponent],
  imports: [
    CommonModule,
    CommonsImports,
    MatIconModule
  ]
})
export class SelectedEnterpriseModule {

 }
