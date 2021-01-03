import {NgModule} from '@angular/core';
import {RouterModule, Routes} from '@angular/router';
import {SuborderComponent} from './suborder/Suborder.component';
import {SuborderReadComponent} from './suborder-read/Suborder-read.component';
import {SuborderInvoiceComponent} from "./suborder-invoice/Suborder-invoice.component";
import {SuborderInvoice2Component} from "./suborder-invoice-2/Suborder-invoice-2.component";
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
                data: {accessData: 'suborder'},
                component: SuborderComponent,
            },
            {
                path: 'details/:id',
                canActivate: [AccessControl],
                data: {accessData: 'suborder-read'},
                component: SuborderReadComponent,
            },
            {
                path: 'invoice/:id',
                
                component: SuborderInvoiceComponent,
            }, {
                path: 'invoice2/:id',
                component: SuborderInvoice2Component,
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
export class SuborderRoutingModule {
}
