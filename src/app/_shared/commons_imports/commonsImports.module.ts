import { NgModule } from "@angular/core";

import { CommonModule } from "@angular/common";
import { FormsModule, ReactiveFormsModule } from "@angular/forms";
import { RouterModule } from "@angular/router";
import {MatIconModule} from '@angular/material/icon';
import {MatButtonModule} from '@angular/material/button';
import {MatToolbarModule} from '@angular/material/toolbar';
import {MatMenuModule} from '@angular/material/menu';
import {MatSidenavModule} from '@angular/material/sidenav';
import { Router } from "@angular/router";
@NgModule({
    declarations: [],
    imports: [CommonModule,
              RouterModule, 
              ReactiveFormsModule, 
              MatIconModule, 
              MatButtonModule,
              MatToolbarModule,
              MatMenuModule,
            MatSidenavModule,
            FormsModule
              ],
    exports: [CommonModule, 
              RouterModule, 
              ReactiveFormsModule, 
              MatIconModule,
              MatButtonModule, 
              MatToolbarModule,
            MatMenuModule,
          MatSidenavModule,
          FormsModule
        ],
    providers: []
})
export class CommonsImports {

}
