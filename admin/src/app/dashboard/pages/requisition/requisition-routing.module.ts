import {NgModule} from '@angular/core';
import {RouterModule, Routes} from '@angular/router';
import {PrRequisitionComponent} from './prrequisition/PrRequisition.component';
import {AccessControl} from "../../../auth/core/guard/AccessControl.guard";

const routes: Routes = [
    {
        path: '',
        canActivate: [AccessControl],
        data: {accessData: 'requisition',breadcrumbs: 'PrRequisition'},
        children: [
            {
                path: '',
                canActivate: [AccessControl],
                data: {accessData: 'requisition'},
                component: PrRequisitionComponent,
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
export class RequisitionRoutingModule {
}
