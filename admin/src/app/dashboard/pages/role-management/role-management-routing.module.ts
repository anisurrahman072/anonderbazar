import {NgModule} from '@angular/core';
import {RouterModule, Routes} from "@angular/router";
import {AccessControl} from "../../../auth/core/guard/AccessControl.guard";
import {RoleManagementComponent} from "./role-management/role-management.component";
import {RoleManagementCreateComponent} from "./role-management-create/role-management-create.component";
import {RoleManagementEditComponent} from "./role-management-edit/role-management-edit.component";

const routes: Routes = [
    {
        path: '',
        children: [
            {
                path: '',
                canActivate: [AccessControl],
                data: {accessData: 'role-management'},
                component: RoleManagementComponent
            },
            {
                path: 'create',
                canActivate: [AccessControl],
                data: {accessData: 'role-management-create'},
                component: RoleManagementCreateComponent
            },
            {
                path: 'edit/:id',
                canActivate: [AccessControl],
                data: {accessData: 'role-management-edit'},
                component: RoleManagementEditComponent
            },
            {
                path: '**',
                redirectTo: '',
                pathMatch: 'full'
            }
        ]
    }
]

@NgModule({
    imports: [
        RouterModule.forChild(routes)
    ],
    exports: [RouterModule],
    declarations: []
})
export class RoleManagementRoutingModule {
}
