import { Routes } from "@angular/router";
import { NgModule } from "@angular/core";
import { RouterModule } from "@angular/router";
import { MainSearchComponent } from "./search.component";


const routes: Routes = [
    {
        path: 'search',
        component: MainSearchComponent
    }
]

@NgModule({
    imports: [RouterModule.forChild(routes)],
    exports: [RouterModule]
})
export class MainSearchRoutingModule{
    
}