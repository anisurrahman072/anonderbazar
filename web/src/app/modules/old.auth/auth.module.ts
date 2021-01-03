import {NgModule} from '@angular/core';
import {CommonModule} from '@angular/common';
import {RouterModule, Routes} from '@angular/router';
import {LoginComponent} from './login/login.component';
import {SignupComponent} from './signup/signup.component';
import {FormsModule, ReactiveFormsModule} from '@angular/forms';
import {TabsModule} from "ngx-bootstrap";
import {MaterialModule} from "../../core/material.module";
import {SharedModule} from "../shared/shared.module";


const routes: Routes = [
    {
        path: 'login', component: LoginComponent, data: {
            title: 'Login Form'
        }
    },
    {
        path: 'signup', component: SignupComponent, data: {
            title: 'Register Form'
        }
    },
    {path: '', component: LoginComponent},

];

@NgModule({
    imports: [
        CommonModule,
        RouterModule.forChild(routes),
        FormsModule,
        ReactiveFormsModule,
        MaterialModule,
        TabsModule.forRoot(),
        SharedModule
    ],
    declarations: [ LoginComponent,SignupComponent]
})
export class AuthModule {
}
///add routing to src/app/core/app-routing.module.ts

