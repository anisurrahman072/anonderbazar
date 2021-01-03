import {NgModule} from '@angular/core';
import {RouterModule, Routes} from '@angular/router';
import {ProductComponent} from './product/product.component';
import {ProductReadComponent} from './product-read/product-read.component';
import {ProductCreateComponent} from './product-create/product-create.component';
import {ProductEditComponent} from './product-edit/product-edit.component';
import {AccessControl} from "../../../auth/core/guard/AccessControl.guard";

const routes: Routes = [
    {
        path: '',
        canActivate: [AccessControl],
        data: {accessData: 'product',breadcrumbs: 'product'},
        children: [
            {
                path: '',
                canActivate: [AccessControl],
                data: {accessData: 'product',breadcrumbs: 'list'},
                component: ProductComponent,
            }, {
                path: 'details/:id',
                canActivate: [AccessControl],
                data: {accessData: 'product-read',breadcrumbs: 'details'},
                component: ProductReadComponent,
            }, {
                path: 'create',
                canActivate: [AccessControl],
                data: {accessData: 'product-create',breadcrumbs: 'create'},
                component: ProductCreateComponent,
            }, {
                path: 'edit/:id',
                canActivate: [AccessControl],
                data: {accessData: 'product-edit',breadcrumbs: 'edit'},
                component: ProductEditComponent,
            }, {
                path: '**',
                redirectTo: '',
                pathMatch: 'full'
            }
        ]
    }
];


@NgModule({
    imports: [
        RouterModule.forChild(routes)
    ],
    exports: [RouterModule],
    declarations: []
})
export class ProductRoutingModule {
}
