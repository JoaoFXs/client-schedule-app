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
import { NgxMaskDirective, provideNgxMask } from 'ngx-mask';
import {MatProgressSpinnerModule} from '@angular/material/progress-spinner';
import { GoogleSigninButtonModule } from "@abacritt/angularx-social-login";
import { MatInputModule } from "@angular/material/input";
import { MatFormFieldModule } from "@angular/material/form-field";
import { MatSelectModule } from "@angular/material/select";
import { MatAutocompleteModule } from "@angular/material/autocomplete";
import { AsyncPipe } from "@angular/common";
import {Component} from '@angular/core';
import {MatTableModule} from '@angular/material/table';
import {MatPaginatorModule} from '@angular/material/paginator';
import {MatCardModule} from '@angular/material/card';
@NgModule({
    declarations: [],
    imports: [CommonModule,
              RouterModule, 
              ReactiveFormsModule, 
              MatIconModule, 
              MatButtonModule,
              MatToolbarModule,
              MatMenuModule,
              MatFormFieldModule,
              MatInputModule,
              MatSelectModule,
               FormsModule,
            MatFormFieldModule,
            MatInputModule,
            MatAutocompleteModule,
            ReactiveFormsModule,
            AsyncPipe,
            MatSidenavModule,
            FormsModule,
            NgxMaskDirective,
            MatProgressSpinnerModule,
              MatTableModule,
            /** Social Login Modules */
            GoogleSigninButtonModule,
            MatCardModule,
            MatPaginatorModule
              ],
    exports: [CommonModule, 
              RouterModule, 
              ReactiveFormsModule, 
              MatIconModule,
              MatButtonModule, 
              MatToolbarModule,
            MatMenuModule,
          MatSidenavModule,
          FormsModule,
          NgxMaskDirective,
          MatProgressSpinnerModule,
          /** Social Login Modules */
            GoogleSigninButtonModule,
            MatInputModule,
            MatFormFieldModule,
            MatSelectModule,
            MatAutocompleteModule,
            ReactiveFormsModule,
            AsyncPipe,
            MatTableModule,
            MatCardModule,
            MatPaginatorModule
        ],
    providers: [
      provideNgxMask()]
})
export class CommonsImports {

}
