import { NgModule } from '@angular/core';
import { Routes, RouterModule } from '@angular/router';
import {FeaturedProductComponent} from "./featured-product/featured-product.component";

const routes: Routes = [
    {
        path: "",
        component: FeaturedProductComponent,
        data: {
            title: "Featured Product"
        }
    }
];

@NgModule({
    imports: [RouterModule.forChild(routes)],
    exports: [RouterModule]
})
export class FeaturedRoutingModule { }
