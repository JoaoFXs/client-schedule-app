import { NgModule } from "@angular/core";
import { LoginComponent } from "./login.component";
import { HeaderComponent } from "../../_shared/header/header.component";
import { CommonsImports } from "../../_shared/commons_imports/commonsImports.module";

@NgModule({
    declarations: [LoginComponent],
    imports: [CommonsImports],
    exports: [LoginComponent],
    providers: []
})
export class LoginModule{

}