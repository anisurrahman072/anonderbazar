import {NgModule} from '@angular/core';
import {Routes, RouterModule} from '@angular/router';
import {ComparePageComponent} from "./compare-page/compare-page.component";

const routes: Routes = [
    {
        path: "",
        component: ComparePageComponent,
        data: {
            title: "Compare"
        }
    }
];

@NgModule({
    imports: [RouterModule.forChild(routes)],
    exports: [RouterModule]
})
export class CompareProductRoutingModule {
}
