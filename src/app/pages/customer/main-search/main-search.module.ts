import { NgModule } from '@angular/core';
import { CommonModule } from '@angular/common';
import { MainSearchComponent } from './main-search.component';
import { CommonsImports } from '../../../_shared/commons_imports/commonsImports.module';
import { MainSearchRoutingModule } from './main-search-routing.module';
import { PermissionLocationModule } from '../../../_shared/component/permission-location/permission-location.module';
import { PermissionLocationComponent } from '../../../_shared/component/permission-location/permission-location.component';



@NgModule({
  declarations: [MainSearchComponent],
  imports: [
    CommonModule,
    CommonsImports,
    MainSearchRoutingModule,
    PermissionLocationModule
  ],
  exports: [
    MainSearchComponent
  ]
})
export class MainSearchModule { }
