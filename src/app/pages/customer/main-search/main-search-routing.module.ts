import { Routes } from "@angular/router";
import { NgModule } from "@angular/core";
import { RouterModule } from "@angular/router";
import { MainSearchComponent } from "./main-search.component";


const routes: Routes = [
    {
        path: 'main-search',
        component: MainSearchComponent
    }
]

@NgModule({
    imports: [RouterModule.forChild(routes)],
    exports: [RouterModule]
})
export class MainSearchRoutingModule{
    
}