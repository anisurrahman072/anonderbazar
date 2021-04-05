import {NgModule} from '@angular/core';
import {RouterModule, Routes} from '@angular/router';
import {AccessControl} from "../../../auth/core/guard/AccessControl.guard";
import {CouponLotteryComponent} from "./coupon-lottery/coupon-lottery.component";

const routes: Routes = [
    {
        path: '',
        data: {accessData: 'coupon-lottery', breadcrumbs: 'Coupon Lottery'},
        children: [
            {
                path: '',
                canActivate: [AccessControl],
                data: {accessData: 'coupon-lottery', breadcrumbs: 'list'},
                component: CouponLotteryComponent,
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
export class CouponLotteryRoutingModule {
}
