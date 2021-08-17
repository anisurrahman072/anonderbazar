import {NgModule} from '@angular/core';
import {RouterModule, Routes} from '@angular/router';
import {CraftsmanReadComponent} from './craftsman-read/craftsman-read.component';
import {CraftsmanEditComponent} from './craftsman-edit/craftsman-edit.component';
import {CraftsmanCreateComponent} from './craftsman-create/craftsman-create.component';
import {CraftsmanComponent} from './craftsman/craftsman.component';
import {AccessControl} from "../../../auth/core/guard/AccessControl.guard";


const routes: Routes = [
    {
        path: '',
        children: [
            {
                path: '',
                canActivate: [AccessControl],
                data: {accessData: 'craftsman-read'},
                component: CraftsmanComponent,
            },
            {
                path: 'details/:id',
                canActivate: [AccessControl],
                data: {accessData: 'craftsman-details'},
                component: CraftsmanReadComponent,
            },
            {
                path: 'create',
                canActivate: [AccessControl],
                data: {accessData: 'craftsman-create'},
                component: CraftsmanCreateComponent,
            },
            {
                path: 'edit/:id',
                canActivate: [AccessControl],
                data: {accessData: 'craftsman-edit'},
                component: CraftsmanEditComponent,
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
export class CraftsmanRoutingModule {
}
