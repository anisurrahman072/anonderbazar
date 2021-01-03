import {NgModule} from '@angular/core';
import {RouterModule, Routes} from '@angular/router';
import {VariantComponent} from './variant/variant.component';
import {VariantReadComponent} from './variant-read/variant-read.component';
import {VariantCreateComponent} from './variant-create/variant-create.component';
import {VariantEditComponent} from './variant-edit/variant-edit.component';
import {IsAdmin} from "../../../auth/core/guard/isAdmin";
import {AccessControl} from "../../../auth/core/guard/AccessControl.guard";

const routes: Routes = [
    {
        path: '',
        children: [
            {
                path: '',
                canActivate: [AccessControl],
                data: {accessData: 'variant-list'},
                component: VariantComponent,
            }, {
                path: 'details/:id',
                canActivate: [AccessControl],
                data: {accessData: 'variant-read'},
                component: VariantReadComponent,
            }, {
                path: 'create',
                canActivate: [AccessControl],
                data: {accessData: 'variant-create'},
                component: VariantCreateComponent,
            }, {
                path: 'edit/:id',
                canActivate: [AccessControl],
                data: {accessData: 'variant-edit'},
                component: VariantEditComponent,
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
export class VariantRoutingModule {
}
