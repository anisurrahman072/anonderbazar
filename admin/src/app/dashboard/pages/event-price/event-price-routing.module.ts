import {NgModule} from '@angular/core';
import {RouterModule, Routes} from '@angular/router';
import {EventPriceListComponent} from './event-price-list/event-price-list.component';
import {AccessControl} from "../../../auth/core/guard/AccessControl.guard";


const routes: Routes = [
  {
      path: '',
      data: {accessData: 'event-price-read', breadcrumbs: 'event'},
      children: [
          {
              path: '',
              canActivate: [AccessControl],
              data: {accessData: 'event-price-list', breadcrumbs: 'list'},
              component: EventPriceListComponent,
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
export class EventPriceRoutingModule { }
