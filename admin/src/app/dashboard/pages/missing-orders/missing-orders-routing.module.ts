import {NgModule} from '@angular/core';
import {RouterModule, Routes} from '@angular/router';
import {MissingOrdersComponent} from './missing-orders/missing-orders.component';
import {AccessControl} from "../../../auth/core/guard/AccessControl.guard";

const routes: Routes = [
    {
        path: '',
        data: {accessData: 'missing-orders', breadcrumbs: 'missing-orders'},
        children: [
            {
                path: '',
                canActivate: [AccessControl],
                data: {accessData: 'missing-orders', breadcrumbs: 'list'},
                component: MissingOrdersComponent,
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
export class MissingOrdersRoutingModule {
}
