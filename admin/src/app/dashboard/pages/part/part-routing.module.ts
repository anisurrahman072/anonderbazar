import {NgModule} from '@angular/core';
import {RouterModule, Routes} from '@angular/router';
import {PartComponent} from "./part/part.component";
import {PartReadComponent} from "./part-read/part-read.component";
import {PartCreateComponent} from "./part-create/part-create.component";
import {PartEditComponent} from "./part-edit/part-edit.component";
import {AccessControl} from "../../../auth/core/guard/AccessControl.guard";


const routes: Routes = [
    {
        path: '',
        children: [
            {
                path: '',
                canActivate: [AccessControl],
                data: {accessData: 'part-read'},
                component: PartComponent,
            },
            {
                path: 'details/:id',
                canActivate: [AccessControl],
                data: {accessData: 'part-read'},
                component: PartReadComponent,
            }, {
                path: 'create',
                canActivate: [AccessControl],
                data: {accessData: 'part-create'},
                component: PartCreateComponent,
            }, {
                path: 'edit/:id',
                canActivate: [AccessControl],
                data: {accessData: 'part-edit'},
                component: PartEditComponent,
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
export class PartRoutingModule {
}
