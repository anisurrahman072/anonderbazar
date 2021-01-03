import {NgModule} from '@angular/core';
import {RouterModule, Routes} from '@angular/router';
import {BrandComponent} from './brand/brand.component';
import {BrandCreateComponent} from './brand-create/brand-create.component';
import {BrandReadComponent} from './brand-read/brand-read.component';
import {BrandEditComponent} from './brand-edit/brand-edit.component';
import {AccessControl} from "../../../auth/core/guard/AccessControl.guard";

const routes: Routes = [
    {
        path: '',
        data: {accessData: 'brand-read', breadcrumbs: 'brand'},
        children: [
            {
                path: '',
                canActivate: [AccessControl],
                data: {accessData: 'brand', breadcrumbs: 'list'},
                component: BrandComponent,
            },
            {
                path: 'details/:id',
                canActivate: [AccessControl],
                data: {accessData: 'brand-read', breadcrumbs: 'detail'},
                component: BrandReadComponent,
            }, {
                path: 'create',
                canActivate: [AccessControl],
                data: {accessData: 'brand-create', breadcrumbs: 'create'},
                component: BrandCreateComponent,
            }, {
                path: 'edit/:id',
                canActivate: [AccessControl],
                data: {accessData: 'brand-edit', breadcrumbs: 'edit'},
                component: BrandEditComponent,
            },
            {
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
export class BrandRoutingModule {
}
