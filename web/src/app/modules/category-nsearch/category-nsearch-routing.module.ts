import {NgModule} from '@angular/core';
import {Routes, RouterModule} from '@angular/router';
import {CategoryPageComponent} from "./category-page/category-page.component";


const routes: Routes = [
    {
        path: "",
        component: CategoryPageComponent,
        data: {
            title: "Products"
        }
    },
    {
        path: ":type/:id",
        component: CategoryPageComponent,
        data: {
            title: "Products"
        }
    },
];

@NgModule({
    imports: [RouterModule.forChild(routes)],
    exports: [RouterModule]
})
export class CategoryNsearchRoutingModule {
}
