import {NgModule} from '@angular/core';
import {CommonModule} from '@angular/common';
import {RouterModule, Routes} from '@angular/router';
import {FormsModule, ReactiveFormsModule} from '@angular/forms';
import {TabsModule} from "ngx-bootstrap";
import {MaterialModule} from "../../core/material.module";
import {FavouriteProductTabComponent} from "./components/favourite-product-tab/favourite-product-tab.component";
import {OrderTabComponent} from "./components/order-tab/order-tab.component";
import {OrderComponent} from "../shared/components/order/order.component";
import {OrderInvoiceComponent} from "../shared/components/order-invoice/order-invoice.component";
import {SuborderComponent} from "../shared/components/suborder/suborder.component";
import {SuborderInvoiceComponent} from "../shared/components/suborder-invoice/suborder-invoice.component";
import {ProfileComponent} from "./profile-core/profile.component";
import {SharedModule} from "../shared/shared.module"; 
import {NgxChartsModule} from '@swimlane/ngx-charts';
import { ProfileTabComponent } from './components/profile-tab/profile-tab.component';
import { AddressTabComponent } from './components/address-tab/address-tab.component';
import { MessagingTabComponent } from './components/messaging-tab/messaging-tab.component';
import { ImageUploadModule } from "angular2-image-upload";
import {NgxPaginationModule} from "ngx-pagination";

//init route path for profile module
const routes: Routes = [
    {
        path: '',
        component: ProfileComponent,
        children: [ 
            {
                path: 'orders', component: OrderTabComponent, data: {
                    title: 'orders' 
                }
            },
            
            
            {
                path: 'favourites', component: FavouriteProductTabComponent, data: {
                    title: 'favourites'
                }
            },
            {
                path: 'profile-tab', component: ProfileTabComponent, data: {
                    title: 'My Profile'
                }
            },
            {
                path: 'address-tab', component: AddressTabComponent, data: {
                    title: 'My Address'
                }
            },
            {
                path: 'messaging-tab', component: MessagingTabComponent, data: {
                    title: 'Message'
                }
            },
        ]
    },
    {
        path: 'orders/invoice/:id', component: OrderInvoiceComponent, data: {
            title: 'orders invoice'
        }
    },
    {
        path: 'suborders/invoice/:id', component: SuborderInvoiceComponent, data: {
            title: 'suborders invoice'
        }
    },
    {
        path: 'suborders/details/:id', component: SuborderComponent, data: {
            title: 'suborders details'
        }
    },
    {
        path: 'orders/details/:id', component: OrderComponent, data: {
            title: 'orders details'
        }
    },
];

@NgModule({
    imports: [
        CommonModule,
        RouterModule.forChild(routes),
        FormsModule,
        ReactiveFormsModule,
        MaterialModule,
        SharedModule,
        ImageUploadModule.forRoot(),
        TabsModule.forRoot(), NgxChartsModule, NgxPaginationModule
    ],
    declarations: [ProfileComponent, FavouriteProductTabComponent, OrderTabComponent, SuborderComponent, OrderComponent, ProfileTabComponent, AddressTabComponent, MessagingTabComponent],
    
})
export class ProfileModule {
}
