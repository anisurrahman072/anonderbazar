import {NgModule} from '@angular/core';
import {Routes, RouterModule} from '@angular/router';
import {IsLoggedIn} from "./isLoggedIn";

//This route const for home and profile
const routes: Routes = [ 
    {path: '', loadChildren: '../modules/home/home.module#HomeModule'},
    {path: 'profile', canActivate: [IsLoggedIn], loadChildren: '../modules/profile/profile.module#ProfileModule'},
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
