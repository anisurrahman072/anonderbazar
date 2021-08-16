import {NgModule} from '@angular/core';
import {CommonModule} from '@angular/common';
import {RoleManagementComponent} from './role-management/role-management.component';
import {RoleManagementRoutingModule} from "./role-management-routing.module";
import {NgZorroAntdModule} from "ng-zorro-antd";
import {UiModule} from "../../shared/ui.module";
import {ReactiveFormsModule} from "@angular/forms";
import { RoleManagementCreateComponent } from './role-management-create/role-management-create.component';
import { RoleManagementEditComponent } from './role-management-edit/role-management-edit.component';

@NgModule({
    imports: [
        CommonModule,
        RoleManagementRoutingModule,
        NgZorroAntdModule,
        UiModule,
        ReactiveFormsModule
    ],
    declarations: [
        RoleManagementComponent,
        RoleManagementCreateComponent,
        RoleManagementEditComponent
    ]
})
export class RoleManagementModule {
}
