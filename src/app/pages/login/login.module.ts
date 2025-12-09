import { NgModule } from "@angular/core";
import { LoginComponent } from "./login.component";
import { CommonsImports } from "../../_shared/commons_imports/commonsImports.module";
import { FormsModule } from "@angular/forms";
import { LoginRoutingModule } from "./login-routing.module";



@NgModule({
    declarations: [LoginComponent],
    imports: [CommonsImports, LoginRoutingModule, FormsModule],
    exports: [],
    providers: []
})
export class LoginModule{

}