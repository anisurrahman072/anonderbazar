import {NgModule} from '@angular/core';
import {RouterModule, Routes} from '@angular/router';
import {WarehouseComponent} from './warehouse/warehouse.component';
import {WarehouseReadComponent} from './warehouse-read/warehouse-read.component';
import {WarehouseCreateComponent} from './warehouse-create/warehouse-create.component';
import {WarehouseEditComponent} from './warehouse-edit/warehouse-edit.component';
import {AccessControl} from "../../../auth/core/guard/AccessControl.guard";

const routes: Routes = [
    {
        path: '',
        children: [
            {
                path: '',
                canActivate: [AccessControl],
                data: {accessData: 'warehouse-read'},
                component: WarehouseComponent,
            }, {
                path: 'details/:id',
                canActivate: [AccessControl],
                data: {accessData: 'warehouse-read'},
                component: WarehouseReadComponent,
            }, {
                path: 'create',
                canActivate: [AccessControl],
                data: {accessData: 'warehouse-create'},
                component: WarehouseCreateComponent,
            }, {
                path: 'edit/:id',
                canActivate: [AccessControl],
                data: {accessData: 'warehouse-edit'},
                component: WarehouseEditComponent,
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
export class WarehouseRoutingModule {
}
