import {NgModule} from '@angular/core';
import {RouterModule, Routes} from '@angular/router';
import {AccessControl} from "../../../auth/core/guard/AccessControl.guard";
import {CanceledOrderComponent} from "./canceled-order/canceled-order.component";

const routes: Routes = [
    {
        path: '',
        data: {accessData: 'canceled-order', breadcrumbs: 'canceled-order'},
        children: [
            {
                path: '',
                canActivate: [AccessControl],
                data: {accessData: 'canceled-order', breadcrumbs: 'list'},
                component: CanceledOrderComponent,
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
export class CanceledOrderRoutingModule {
}
