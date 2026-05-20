import { NgModule } from '@angular/core';
import { CommonModule } from '@angular/common';
import { MainSearchComponent } from './search.component';
import { CommonsImports } from '../../../_shared/commons_imports/commonsImports.module';
import { MainSearchRoutingModule } from './search-routing.module';
import { PermissionLocationModule } from '../../../_shared/component/permission-location/permission-location.module';
import { PermissionLocationComponent } from '../../../_shared/component/permission-location/permission-location.component';
import { SelectedEnterpriseModule } from '../../../_shared/component/selected-enterprise/selected-enterprise.module';



@NgModule({
  declarations: [MainSearchComponent],
  imports: [
    CommonModule,
    CommonsImports,
    MainSearchRoutingModule,
    PermissionLocationModule,
    SelectedEnterpriseModule
  ],
  exports: [
    MainSearchComponent
  ]
})
export class MainSearchModule { }
