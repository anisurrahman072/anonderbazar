import {NgModule} from '@angular/core';
import {RouterModule, Routes} from '@angular/router';
import {OrderComponent} from './order/Order.component';
import {OrderReadComponent} from './order-read/Order-read.component';
import {AccessControl} from "../../../auth/core/guard/AccessControl.guard";

const routes: Routes = [
    {
        path: '',
        canActivate: [AccessControl],
        data: {accessData: 'order',breadcrumbs: 'order'},
        children: [
            {
                path: '',
                canActivate: [AccessControl],
                data: {accessData: 'order-list'},
                component: OrderComponent,
            },
            {
                path: 'details/:id',
                canActivate: [AccessControl],
                data: {accessData: 'order-read'},
                component: OrderReadComponent,
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
export class OrderRoutingModule {
}
