import { NgModule } from '@angular/core';
import { RouterModule, Routes } from '@angular/router';
import { AccessControl } from "../../../auth/core/guard/AccessControl.guard";
import { CourierListComponent } from './courier-list/courier-list.component';
import { CourierOrderListComponent } from './courier-order-list/courier-order-list.component';
import { CourierComponent } from './courier/courier.component';
import { CourierPriceListComponent } from './courier-price-list/courier-price-list.component';


const routes: Routes = [
  {
    path: '',
    data: { accessData: 'courier', breadcrumbs: 'courier' },
    children: [
      {
        path: '',
        canActivate: [AccessControl],
        data: { accessData: 'courier-list', breadcrumbs: 'courier-list' },
        component: CourierComponent,
      },
      {
        path: 'suborderlist',
        canActivate: [AccessControl],
        data: { accessData: 'courier-suborder-list', breadcrumbs: 'courier-list' },
        component: CourierListComponent,
      },
      {
        path: 'orderlist',
        canActivate: [AccessControl],
        data: { accessData: 'courier-order-list', breadcrumbs: 'courier-order-list' },
        component: CourierOrderListComponent,
      },
      {
        path: 'price',
        canActivate: [AccessControl],
        data: { accessData: 'courier-price-list', breadcrumbs: 'courier-price' },
        component: CourierPriceListComponent,
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
export class CourierRoutingModule { }
