import {NgModule} from '@angular/core';
import {CommonModule} from '@angular/common';
import {RouterModule, Routes} from '@angular/router';
import {LoginComponent} from '../pages/login/login.component';
import {ForgotPasswordComponent} from '../pages/forgot-password/forgot-password.component';
import {SignupComponent} from '../pages/signup/signup.component';
import {ReactiveFormsModule} from '@angular/forms';
import {WarehouseEntryComponent} from '../pages/warehouse-entry/warehouse-entry.component';
import {UiModule} from "../../dashboard/shared/ui.module";
import {CKEditorModule} from "@ckeditor/ckeditor5-angular";


// return false;
const routes: Routes = [
    {path: 'login', component: LoginComponent},
    {path: 'forgot-password', component: ForgotPasswordComponent},
    {path: 'signup', component: SignupComponent},
    {path: '', component: LoginComponent},
    {
        path: 'warehouse-entry',
        component: WarehouseEntryComponent
    }
];

@NgModule({
    imports: [
        CommonModule,
        RouterModule.forChild(routes),
        ReactiveFormsModule,
        UiModule,
        CKEditorModule

    ],
    declarations: [LoginComponent, SignupComponent, WarehouseEntryComponent, ForgotPasswordComponent]
})
export class AuthModule {
}
