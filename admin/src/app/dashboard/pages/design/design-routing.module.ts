import {NgModule} from '@angular/core';
import {RouterModule, Routes} from '@angular/router';
import {DesignCoreComponent} from "./core/design-core.component";
import {DesignCreateComponent} from "./components/design-create/design-create.component";
import {DesignEditComponent} from "./components/design-edit/design-edit.component";
import {DesignListComponent} from "./components/design-list/design-list.component";
import {DesignReadComponent} from "./components/design-read/design-read.component";
import {AccessControl} from "../../../auth/core/guard/AccessControl.guard";

const routes: Routes = [
    {
        path: '', /*  /dashboard/design */
        component: DesignCoreComponent,
        children: [
            {
                path: '',
                canActivate: [AccessControl],
                data: {accessData: 'design'},
                component: DesignListComponent,
            }, {
                path: 'details/:id',
                canActivate: [AccessControl],
                data: {accessData: 'design-read'},
                component: DesignReadComponent,
            }, {
                path: 'create',
                canActivate: [AccessControl],
                data: {accessData: 'design-create'},
                component: DesignCreateComponent,
            }, {
                path: 'edit/:id',
                canActivate: [AccessControl],
                data: {accessData: 'design-edit'},
                component: DesignEditComponent,
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
export class DesignRoutingModule {
}
