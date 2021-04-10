import {NgModule} from '@angular/core';
import {Routes, RouterModule} from '@angular/router';
import {BrandComponent} from "./brand/brand.component";
import {BrandProductComponent} from "./brand-product/brand-product.component";


const routes: Routes = [
    {
        path: '',
        component: BrandComponent,
        data: {
            title: "Brands"
        }
    },
    {
        path: ":id/brand-products",
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
