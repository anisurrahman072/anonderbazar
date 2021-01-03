import {NgModule} from '@angular/core';
import {RouterModule, Routes} from '@angular/router';
import {WarehouseVariantComponent} from './warehouse-variant/warehouse-variant.component';
import {WarehouseVariantReadComponent} from './warehouse-variant-read/warehouse-variant-read.component';
import {WarehouseVariantCreateComponent} from './warehouse-variant-create/warehouse-variant-create.component';
import {WarehouseVariantEditComponent} from './warehouse-variant-edit/warehouse-variant-edit.component';
import {AccessControl} from "../../../auth/core/guard/AccessControl.guard";

const routes: Routes = [
    {
        path: '',
        children: [
            {
                path: '',
                canActivate: [AccessControl],
                data: {accessData: 'warehousevariant'},
                component: WarehouseVariantComponent,
            }, {
                path: 'details/:id',
                canActivate: [AccessControl],
                data: {accessData: 'warehousevariant-read'},
                component: WarehouseVariantReadComponent,
            }, {
                path: 'create',
                canActivate: [AccessControl],
                data: {accessData: 'warehousevariant-create'},
                component: WarehouseVariantCreateComponent,
            }, {
                path: 'edit/:id',
                canActivate: [AccessControl],
                data: {accessData: 'warehousevariant-edit'},
                component: WarehouseVariantEditComponent,
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
export class WarehouseVariantRoutingModule {
}
