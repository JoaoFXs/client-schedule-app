import { NgModule } from '@angular/core';
import { CommonModule } from '@angular/common';
import { MainSearchComponent } from './main-search.component';
import { CommonsImports } from '../../../_shared/commons_imports/commonsImports.module';
import { MainSearchRoutingModule } from './main-search-routing.module';



@NgModule({
  declarations: [MainSearchComponent],
  imports: [
    CommonModule,
    CommonsImports,
    MainSearchRoutingModule 
  ],
  exports: [
    MainSearchComponent
  ]
})
export class MainSearchModule { }
