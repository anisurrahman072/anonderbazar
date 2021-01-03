import {NgModule} from '@angular/core';
import {RouterModule, Routes} from '@angular/router';
import {ProfileReadComponent} from './profile-read/profile-read.component';
import {ProfileEditComponent} from './profile-edit/profile-edit.component';


const routes: Routes = [
    {
        path: '',
        children: [
            {
                path: '',
                component: ProfileReadComponent,
            },
            {
                path: 'edit',
                component: ProfileEditComponent,
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
export class ProfileRoutingModule {
}
