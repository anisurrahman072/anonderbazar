import {NgModule} from '@angular/core';
import {RouterModule, Routes} from "@angular/router";
import {AccessControl} from "../../../auth/core/guard/AccessControl.guard";
import {RoleManagementComponent} from "../role-management/role-management/role-management.component";
import {RoleManagementCreateComponent} from "../role-management/role-management-create/role-management-create.component";
import {RoleManagementEditComponent} from "../role-management/role-management-edit/role-management-edit.component";
import {AdminUsersComponent} from "./admin-users/admin-users.component";
import {AdminUsersCreateComponent} from "./admin-users-create/admin-users-create.component";
import {AdminUsersEditComponent} from "./admin-users-edit/admin-users-edit.component";
import {AdminUsersDetailsComponent} from "./admin-users-details/admin-users-details.component";

const routes: Routes = [
    {
        path: '',
        children: [
            {
                path: '',
                canActivate: [AccessControl],
                data: {accessData: 'admin-users'},
                component: AdminUsersComponent
            },
            {
                path: 'create',
                canActivate: [AccessControl],
                data: {accessData: 'admin-users-create'},
                component: AdminUsersCreateComponent
            },
            {
                path: 'edit/:id',
                canActivate: [AccessControl],
                data: {accessData: 'admin-users-edit'},
                component: AdminUsersEditComponent
            },
            {
                path: 'details/:id',
                canActivate: [AccessControl],
                data: {accessData: 'admin-users-details'},
                component: AdminUsersDetailsComponent
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
export class AdminUsersRoutingModule {
}
