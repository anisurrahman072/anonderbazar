import {NgModule} from '@angular/core';
import {Routes, RouterModule} from '@angular/router';
import {DashboardCoreComponent} from './dashboard-core.component';
import {DashboardHomeComponent} from '../pages/dashboard-home/dashboard-home.component';
import {IsAdmin} from '../../auth/core/guard/isAdmin';
import {UserComponent} from '../pages/craftsman/user/user.component';
import {CustomerComponent} from '../pages/craftsman/customer/customer.component';
import {AccessControl} from '../../auth/core/guard/AccessControl.guard';

const routes: Routes = [
    {
        path: '',
        data: {
            breadcrumbs: 'Dashboard'
        },
        component: DashboardCoreComponent,
        children: [
            {
                path: 'cms',
                canActivate: [AccessControl],
                data: {accessData: 'cms', breadcrumbs: 'cms'},
                loadChildren: '../cms/cms.module#CmsModule'
            },
            {
                path: 'usercms',
                loadChildren: '../pages/user-cms/user-cms.module#UserCmsModule'
            },
            {
                path: 'craftsman' /* /dashboard/craftman   */,
                loadChildren: '../pages/craftsman/craftsman.module#CraftsmanModule'
            },
            {
                path: 'shop-user' /* /dashboard/craftman   */,
                component: UserComponent
            },
            {
                path: 'customer' /* /dashboard/craftman   */,
                component: CustomerComponent
            },
            {
                path: 'product' /* /dashboard/product   */,
                loadChildren: '../pages/product/product.module#ProductModule'
            },
            {
                path: 'investor' /* /dashboard/investor   */,
                loadChildren: '../pages/investor/investor.module#InvestorModule'
            },
            {
                path: 'missing-orders' /* /dashboard/missing-orders   */,
                loadChildren: '../pages/missing-orders/missing-orders.module#MissingOrdersModule'
            },
            {
                path: 'profile' /* /dashboard/profile   */,
                loadChildren: '../pages/profile/profile.module#ProfileModule'
            },
            {
                path: 'category' /* /dashboard/category   */,
                loadChildren: '../pages/category/category.module#CategoryModule'
            },
            {
                path: 'brand' /* /dashboard/brand   */,
                loadChildren: '../pages/brand/brand.module#BrandModule'
            },
            {
                path: 'warehouse' /* /dashboard/warehouse   */,
                canActivate: [IsAdmin],
                loadChildren: '../pages/warehouse/warehouse.module#WarehouseModule'
            },
            {
                path: 'variant' /* /dashboard/variant   */,
                loadChildren: '../pages/variant/variant.module#VariantModule'
            },
            {
                path: 'offer' /* /dashboard/offer   */,
                loadChildren: '../pages/offer/offer.module#OfferModule'
            },
            {
                path: 'order' /* /dashboard/order   */,
                loadChildren: '../pages/order/order.module#OrderModule'
            },
            {
                path: 'suborder' /* /dashboard/suborder   */,
                loadChildren: '../pages/suborder/suborder.module#SuborderModule'
            },
            {
                path: 'coupon-lottery' /* /dashboard/suborder   */,
                loadChildren: '../pages/coupon-lottery/coupon-lottery.module#CouponLotteryModule'
            },
            {
                path: 'payment' /* /dashboard/payment   */,
                loadChildren: '../pages/payment/payment.module#PaymentModule'
            },
            {
                path: 'warehousevariant' /* /dashboard/warehousevariant   */,
                loadChildren:
                    '../pages/warehouse-variant/warehouse-variant.module#WarehouseVariantModule'
            },
            {
                path: 'design' /* /dashboard/design   */,
                loadChildren: '../pages/design/design.module#DesignModule'
            },
            {
                path: 'designcategory' /* /designcategory  */,
                loadChildren:
                    '../pages/design-category/design-category.module#DesignCategoryModule'
            },
            {
                path: 'genre' /* /genre  */,
                loadChildren: '../pages/genre/genre.module#GenreModule'
            },
            {
                path: 'part' /* /part  */,
                loadChildren: '../pages/part/part.module#PartModule'
            },
            {
                path: 'event' /* /event  */,
                loadChildren: '../pages/event-management/event-management.module#EventManagementModule'
            },
            {
                path: 'event-price' /* /event-price  */,
                loadChildren: '../pages/event-price/event-price.module#EventPriceModule'
            },
            {
                path: 'craftsmanprice' /* /craftsmanprice  */,
                loadChildren:
                    '../pages/craftman-price/craftman-price.module#CraftmanPriceModule'
            },
            {
                path: 'courier' /* /courier-list  */,
                loadChildren:
                    '../pages/courier/courier.module#CourierModule'
            },
            {
                path: 'message' /* /courier-list  */,
                loadChildren:
                    '../pages/messaging/messaging.module#MessagingModule'
            },
            {
                path: 'requisition' /* /courier-list  */,
                loadChildren:
                    '../pages/requisition/requisition.module#RequisitionModule'
            },
            {
                path: '' /* /dashboard  */,
                component: DashboardHomeComponent
            }
        ]
    }
];

@NgModule({
    imports: [RouterModule.forChild(routes)],
    exports: [RouterModule]
})
export class DashboardRoutingModule {
}
