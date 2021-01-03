import {NgModule} from '@angular/core';
import {RouterModule, Routes} from '@angular/router';
import {EventListComponent} from './event-list/event-list.component';
import {EventCreateComponent} from './event-create/event-create.component';
import {EventReadComponent} from './event-read/event-read.component';
import {EventEditComponent} from './event-edit/event-edit.component';
import {AccessControl} from "../../../auth/core/guard/AccessControl.guard";

const routes: Routes = [
  {
      path: '',
      data: {accessData: 'event-read', breadcrumbs: 'event'},
      children: [
          {
              path: '',
              canActivate: [AccessControl],
              data: {accessData: 'event-list', breadcrumbs: 'list'},
              component: EventListComponent,
          },
          {
              path: 'details/:id',
              canActivate: [AccessControl],
              data: {accessData: 'event-read', breadcrumbs: 'detail'},
              component: EventReadComponent,
          }, {
              path: 'create',
              canActivate: [AccessControl],
              data: {accessData: 'event-create', breadcrumbs: 'create'},
              component: EventCreateComponent,
          }, {
              path: 'edit/:id',
              canActivate: [AccessControl],
              data: {accessData: 'event-edit', breadcrumbs: 'edit'},
              component: EventEditComponent,
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
export class EventManagementRoutingModule {
}
