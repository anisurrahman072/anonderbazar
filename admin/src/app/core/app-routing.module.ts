import {NgModule} from '@angular/core';
import {Routes, RouterModule} from '@angular/router';
import {AuthGuard} from '../auth/core/guard/guard';
import {GroupGuard} from '../auth/core/guard/group.guard';
import {AlreadyLoggedIn} from "../auth/core/guard/AlreadyLoggedIn";

const routes: Routes = [
    {
        path: 'dashboard',
        canActivate: [AuthGuard, GroupGuard],
        loadChildren: '../dashboard/core/dashboard.module#DashboardModule'
    },
    {
        path: 'auth',
        canActivate: [AlreadyLoggedIn],
        loadChildren: '../auth/core/auth.module#AuthModule'
    },
    {path: '', redirectTo: '/auth', pathMatch: 'full'},
    {path: '**', redirectTo: '/'} 
];

@NgModule({
    imports: [
        RouterModule.forRoot(routes)
    ],
    exports: [RouterModule],
    declarations: []
})
export class AppRoutingModule {
}
