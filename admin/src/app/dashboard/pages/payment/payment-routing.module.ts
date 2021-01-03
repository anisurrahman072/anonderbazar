import {NgModule} from '@angular/core';
import {RouterModule, Routes} from '@angular/router';
import {PaymentComponent} from "./payment/payment.component";
import {PaymentReadComponent} from "./payment-read/payment-read.component";
import {PaymentCreateComponent} from "./payment-create/payment-create.component";
import {PaymentEditComponent} from "./payment-edit/payment-edit.component";
import {AccessControl} from "../../../auth/core/guard/AccessControl.guard";


const routes: Routes = [
    {
        path: '',
        children: [
            {
                path: '',
                canActivate: [AccessControl],
                data: {accessData: 'payment'},
                component: PaymentComponent,
            },
            {
                path: 'details/:id',
                canActivate: [AccessControl],
                data: {accessData: 'payment-read'},
                component: PaymentReadComponent,
            }, {
                path: 'create',
                canActivate: [AccessControl],
                data: {accessData: 'payment-create'},
                component: PaymentCreateComponent,
            }, {
                path: 'edit/:id',
                canActivate: [AccessControl],
                data: {accessData: 'payment-edit'},
                component: PaymentEditComponent,
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
export class PaymentRoutingModule {
}
