import {NgModule} from '@angular/core';
import {Routes, RouterModule} from '@angular/router';
import {IsLoggedIn} from "./isLoggedIn";

//This route const for home and profile
const routes: Routes = [
    {path: '', loadChildren: '../modules/home/home.module#HomeModule'},
    {path: 'products', loadChildren: '../modules/category-nsearch/category-nsearch.module#CategoryNsearchModule'},
    {path: 'product-details', loadChildren: '../modules/product-details/product-details.module#ProductDetailsModule'},
    {path: 'cart', loadChildren: '../modules/shopping-cart/shopping-cart.module#ShoppingCartModule'},
    {path: 'compare', loadChildren: '../modules/compare-product/compare-product.module#CompareProductModule'},
    {path: 'lottery', loadChildren: '../modules/coupon-lottery/coupon-lottery.module#CouponLotteryModule'},
    {path: 'checkout', loadChildren: '../modules/checkout/checkout.module#CheckoutModule'},
    {path: 'cms', loadChildren: '../modules/cms/cms.module#CmsModule'},
    {path: 'brands', loadChildren: '../modules/brand/brand.module#BrandModule'},
    {path: 'featured-product', loadChildren: '../modules/featured/featured.module#FeaturedModule'},
    {path: 'categories', loadChildren: '../modules/category-list/category-list.module#CategoryListModule'},
    {path: 'profile', canActivate: [IsLoggedIn], loadChildren: '../modules/profile/profile.module#ProfileModule'},
    {path: 'request', canActivate: [IsLoggedIn], loadChildren: '../modules/request/request.module#RequestModule'},
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
