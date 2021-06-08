import {NgModule} from '@angular/core';
import {CommonModule} from '@angular/common';
import {RouterModule, Routes} from '@angular/router';
import {FormsModule, ReactiveFormsModule} from '@angular/forms';
import {TabsModule} from "ngx-bootstrap";
import {MaterialModule} from "../../core/material.module";
import {FavouriteProductTabComponent} from "./components/favourite-product-tab/favourite-product-tab.component";
import {OrderTabComponent} from "./components/order-tab/order-tab.component";
import {OrderComponent} from "../shared/components";
import {OrderInvoiceComponent} from "../shared/components";
import {SuborderComponent} from "../shared/components";
import {SuborderInvoiceComponent} from "../shared/components";
import {ProfileComponent} from "./profile-core/profile.component";
import {SharedModule} from "../shared/shared.module";
import {NgxChartsModule} from '@swimlane/ngx-charts';
import {ProfileTabComponent} from './components/profile-tab/profile-tab.component';
import {AddressTabComponent} from './components/address-tab/address-tab.component';
import {MessagingTabComponent} from './components/messaging-tab/messaging-tab.component';
import {ImageUploadModule} from "angular2-image-upload";
import {NgxPaginationModule} from "ngx-pagination";
import {BKashAccountComponent} from "./components/bkash-tab/bKash-account.component";
import { ChangePasswordTabComponent } from './components/change-password-tab/change-password-tab.component';

//init route path for profile module
const routes: Routes = [
    {
        path: '',
        component: ProfileComponent,
        children: [
            {
                path: 'orders', component: OrderTabComponent, data: {
                    title: 'My Orders - Anonderbazar'
                }
            },
            {
                path: 'favourites', component: FavouriteProductTabComponent, data: {
                    title: 'My Favourites - Anonderbazar'
                }
            },
            {
                path: 'bkash-accounts', component: BKashAccountComponent, data: {
                    title: 'My Bkash Accounts - Anonderbazar'
                }
            },
            {
                path: 'profile-tab', component: ProfileTabComponent, data: {
                    title: 'My Profile - Anonderbazar'
                }
            },
            {
                path: 'address-tab', component: AddressTabComponent, data: {
                    title: 'My Addresses - Anonderbazar'
                }
            },
            {
                path: 'messaging-tab', component: MessagingTabComponent, data: {
                    title: 'My Messages - Anonderbazar'
                }
            },
            {
                path: 'change-password-tab', component: ChangePasswordTabComponent, data: {
                    title: 'change-password - Anonderbazar'
                }
            },
        ]
    },
    {
        path: 'orders/invoice/:id', component: OrderInvoiceComponent, data: {
            title: 'Orders Invoice - Anonderbazar'
        }
    },
    {
        path: 'suborders/invoice/:id', component: SuborderInvoiceComponent, data: {
            title: 'Suborders Invoice - Anonderbazar'
        }
    },
    {
        path: 'suborders/details/:id', component: SuborderComponent, data: {
            title: 'Suborders Details - Anonderbazar'
        }
    },
    {
        path: 'orders/details/:id', component: OrderComponent, data: {
            title: 'Orders Details - Anonderbazar'
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
        TabsModule.forRoot(),
        NgxChartsModule,
        NgxPaginationModule
    ],
    declarations: [
        ProfileComponent, FavouriteProductTabComponent, OrderTabComponent, SuborderComponent, OrderComponent,
        ProfileTabComponent, AddressTabComponent, MessagingTabComponent, BKashAccountComponent, ChangePasswordTabComponent
    ],

})
export class ProfileModule {
}
