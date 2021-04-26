import {NgModule} from '@angular/core';
import {RouterModule, Routes} from '@angular/router';
import {InvestorComponent} from './investor/investor.component';
import {AccessControl} from "../../../auth/core/guard/AccessControl.guard";

const routes: Routes = [
    {
        path: '',
        data: {accessData: 'investor', breadcrumbs: 'investor'},
        children: [
            {
                path: '',
                canActivate: [AccessControl],
                data: {accessData: 'investor', breadcrumbs: 'list'},
                component: InvestorComponent,
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
export class InvestorRoutingModule {
}
