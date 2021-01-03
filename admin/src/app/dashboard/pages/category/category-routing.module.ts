import {NgModule} from '@angular/core';
import {RouterModule, Routes} from '@angular/router';
import {CategoryCoreComponent} from './category-core/category-core.component';

import {CategoryProductComponent} from './category-product/category-product/category-product.component';
import {CategoryProductCreateComponent} from './category-product/category-product-create/category-product-create.component';
import {CategoryProductReadComponent} from './category-product/category-product-read/category-product-read.component';
import {CategoryProductEditComponent} from './category-product/category-product-edit/category-product-edit.component';

import {CategoryTypeComponent} from './category-type/category-type/category-type.component';
import {CategoryTypeCreateComponent} from './category-type/category-type-create/category-type-create.component';
import {CategoryTypeReadComponent} from './category-type/category-type-read/category-type-read.component';
import {CategoryTypeEditComponent} from './category-type/category-type-edit/category-type-edit.component';
import {AccessControl} from "../../../auth/core/guard/AccessControl.guard";

const routes: Routes = [
    {
        path: '', /*  /dashboard/category */
        component: CategoryCoreComponent,
        children: [
            {
                path: 'product',
                canActivate: [AccessControl],
                data: {accessData: 'productcategory-read', breadcrumbs: 'category'},
                children: [
                    {
                        path: '',
                        canActivate: [AccessControl],
                        data: {accessData: 'productcategory-read', breadcrumbs: 'list'},
                        component: CategoryProductComponent,
                    }, {
                        path: 'details/:id',
                        canActivate: [AccessControl],
                        data: {accessData: 'productcategory-read', breadcrumbs: 'details'},
                        component: CategoryProductReadComponent,
                    }, {
                        path: 'create',
                        canActivate: [AccessControl],
                        data: {accessData: 'productcategory-create', breadcrumbs: 'create'},
                        component: CategoryProductCreateComponent,
                    }, {
                        path: 'edit/:id', canActivate: [AccessControl],
                        data: {accessData: 'productcategory-edit', breadcrumbs: 'edit'},
                        component: CategoryProductEditComponent,
                    }, {
                        path: '**',
                        redirectTo: '',
                        pathMatch: 'full'
                    }
                ]
                
            },
            {
                path: 'type',
                canActivate: [AccessControl],
                data: {accessData: 'producttype-list', breadcrumbs: 'list'},
                children: [
                    {
                        path: '',
                        canActivate: [AccessControl],
                        data: {accessData: 'producttype-list', breadcrumbs: 'list'},
                        component: CategoryTypeComponent,
                    }, {
                        path: 'details/:id',
                        canActivate: [AccessControl],
                        data: {accessData: 'producttype-read', breadcrumbs: 'details'},
                        component: CategoryTypeReadComponent,
                    }, {
                        path: 'create',
                        canActivate: [AccessControl],
                        data: {accessData: 'producttype-create', breadcrumbs: 'create'},
                        component: CategoryTypeCreateComponent,
                    }, {
                        path: 'edit/:id',
                        canActivate: [AccessControl],
                        data: {accessData: 'producttype-edit', breadcrumbs: 'edit'},
                        component: CategoryTypeEditComponent,
                    }, {
                        path: '**',
                        redirectTo: '',
                        pathMatch: 'full'
                    }
                ]
                
            },
        ]
    },
];

@NgModule({
    imports: [
        RouterModule.forChild(routes)
    ],
    exports: [RouterModule],
    declarations: []
})
export class CategoryRoutingModule {
}
