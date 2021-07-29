import { NgModule } from '@angular/core';
import { CommonModule } from '@angular/common';
import {AdminUsersRoutingModule} from "./admin-users-routing.module";
import { AdminUsersComponent } from './admin-users/admin-users.component';
import { AdminUsersCreateComponent } from './admin-users-create/admin-users-create.component';
import { AdminUsersEditComponent } from './admin-users-edit/admin-users-edit.component';
import { AdminUsersDetailsComponent } from './admin-users-details/admin-users-details.component';

@NgModule({
  imports: [
    CommonModule,
    AdminUsersRoutingModule
  ],
  declarations: [AdminUsersComponent, AdminUsersCreateComponent, AdminUsersEditComponent, AdminUsersDetailsComponent]
})
export class AdminUsersModule { }
