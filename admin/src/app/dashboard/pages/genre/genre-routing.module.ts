import {NgModule} from '@angular/core';
import {RouterModule, Routes} from '@angular/router';
import {GenreComponent} from "./genre/genre.component";
import {GenreReadComponent} from "./genre-read/genre-read.component";
import {GenreCreateComponent} from "./genre-create/genre-create.component";
import {GenreEditComponent} from "./genre-edit/genre-edit.component";
import {AccessControl} from "../../../auth/core/guard/AccessControl.guard";


const routes: Routes = [
    {
        path: '',
        children: [
            {
                path: '',
                canActivate: [AccessControl],
                data: {accessData: 'genre-read'},
                component: GenreComponent,
            },
            {
                path: 'details/:id',
                canActivate: [AccessControl],
                data: {accessData: 'genre-read'},
                component: GenreReadComponent,
            }, {
                path: 'create',
                canActivate: [AccessControl],
                data: {accessData: 'genre-create'},
                component: GenreCreateComponent,
            }, {
                path: 'edit/:id',
                canActivate: [AccessControl],
                data: {accessData: 'genre-edit'},
                component: GenreEditComponent,
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
export class GenreRoutingModule {
}
