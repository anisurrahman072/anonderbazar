import {NgModule} from '@angular/core';
import {CommonModule} from '@angular/common';
import {RouterModule, Routes} from '@angular/router';
import {
    OrderInvoiceComponent, ProductItemComponent, ProductListComponent,
    SuborderInvoiceComponent
} from "./components"; 
import {ProductItemCompareComponent} from "./components/product-item-compare/product-item-compare.component";
import {ProductItemWholeSaleComponent} from "./components/product-item-wholesale/product-item-wholesale.component";
import {ProductItemRewardPointComponent} from "./components/product-item-rewardpoint/product-item-rewardpoint.component";
import {ProductItemFeedbackComponent} from "./components/product-item-feedback/product-item-feedback.component";
import {ProductItemNewArrivalComponent} from "./components/product-item-newarrival/product-item-newarrival.component";
import {ProductItemFlashDealComponent} from "./components/product-item-flash-deals/product-item-flash-deals.component";
import {CategoryItemComponent} from "./components/category-item/category-item.component";
import {IsAddedToComparePipe} from "../../pipes/is-added-to-compare";
import {IsAddedToFavouritePipe} from "../../pipes/is-added-to-favourite";
import {FormsModule, ReactiveFormsModule} from "@angular/forms";
import {LoginMinComponent} from "./components/login-min/login-min.component";
import {ShoppingCartComponent} from "./components/shopping-cart/shopping-cart.component";
import {MaterialModule} from "../../core/material.module";
import {OrderStatusPipe} from "../../pipes/order-status";
import { SwiperModule } from "ngx-swiper-wrapper";
import {IsAddedToCartPipe} from "../../pipes/is-added-to-cart";


const sharedComponents = [
    ProductItemComponent,
    ProductItemWholeSaleComponent,
    ProductItemRewardPointComponent,
    ProductItemFeedbackComponent,
    ProductItemNewArrivalComponent,
    ProductListComponent, 
    ProductItemFlashDealComponent,
    CategoryItemComponent,
    ProductItemCompareComponent,
    IsAddedToComparePipe,
    IsAddedToFavouritePipe,
    IsAddedToCartPipe,
    OrderStatusPipe,
    LoginMinComponent,
    ShoppingCartComponent,
    SuborderInvoiceComponent,
    OrderInvoiceComponent
];
const sharedComponents1 = [
    ProductItemComponent,
    ProductItemWholeSaleComponent,
    ProductItemFeedbackComponent,
    ProductItemRewardPointComponent,
    ProductItemNewArrivalComponent,
    ProductItemFlashDealComponent,
    CategoryItemComponent,
    ProductListComponent, 
    IsAddedToComparePipe,
    IsAddedToFavouritePipe,
    IsAddedToCartPipe,
    OrderStatusPipe,
    ShoppingCartComponent,
    LoginMinComponent,
    SuborderInvoiceComponent,
    OrderInvoiceComponent,
    ProductItemCompareComponent,
    SwiperModule
];

@NgModule({
    imports: [
        CommonModule,
        RouterModule,
        FormsModule,
        ReactiveFormsModule,
        MaterialModule,
        SwiperModule
    ],
    declarations: sharedComponents,
    exports: sharedComponents1
    
})
export class SharedModule {
}
