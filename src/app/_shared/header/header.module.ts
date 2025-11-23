import { NgModule } from "@angular/core";
import { CommonsImports } from "../commons_imports/commonsImports.module";
import { HeaderComponent } from "./header.component";


@NgModule({
    declarations: [HeaderComponent],
    imports: [CommonsImports],
    exports: [HeaderComponent],
    providers: []
})
export class HeaderModule {

}