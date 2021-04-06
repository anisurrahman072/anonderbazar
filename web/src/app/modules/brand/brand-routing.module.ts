import {NgModule} from '@angular/core';
import {Routes, RouterModule} from '@angular/router';
import {BrandProductComponent} from "./brand-product/brand-product.component";


const routes: Routes = [
    {
        path: "brand-product/:id",
        component: BrandProductComponent,
        data: {
            title: "Brand products"
        }
    },
];

@NgModule({
    imports: [RouterModule.forChild(routes)],
    exports: [RouterModule]
})
export class BrandRoutingModule {
}
