import {Component, OnInit} from '@angular/core';
import {OrderService} from "../../../../services/order.service";
import {NzNotificationService} from "ng-zorro-antd";
import {GLOBAL_CONFIGS} from "../../../../../environments/global_config";
import * as ___ from 'lodash';
import {AuthService} from "../../../../services/auth.service";

@Component({
    selector: 'app-canceled-order',
    templateUrl: './canceled-order.component.html',
    styleUrls: ['./canceled-order.component.css']
})
export class CanceledOrderComponent implements OnInit {

    page: number = 1;
    limit: number = 20;
    total: any;
    cancelledOrders: any = null;
    _isSpinning = true;

    options: any[] = GLOBAL_CONFIGS.REFUND_STATUS;
    statusSearchValue: any = null;

    currentUser: any;
    ORDER_STATUS_UPDATE_ADMIN_USER = GLOBAL_CONFIGS.ORDER_STATUS_CHANGE_ADMIN_USER;
    isAllowedToUpdateRefundStatus: boolean = false;

    constructor(
        private orderService: OrderService,
        private _notification: NzNotificationService,
        private authService: AuthService
    ) {
    }

    ngOnInit() {
        this.getPageData();
        this.currentUser = this.authService.getCurrentUser();
        if(this.currentUser.id == this.ORDER_STATUS_UPDATE_ADMIN_USER){
            this.isAllowedToUpdateRefundStatus = true;
        }
    }

    getPageData($event?: any) {
        this._isSpinning = true;
        if ($event) {
            this.page = $event;
        }

        this.orderService.getCancelledOrder(this.page, this.limit, this.statusSearchValue)
            .subscribe(orders => {
                this._isSpinning = false;
                this.total = orders.total;
                this.cancelledOrders = orders.data;
            })
    }

    refundCancelOrder($event, id, status) {
        this._isSpinning = true;
        console.log('The status', id, status);
        if (status == 0) {
            this._notification.create('error', 'This order already has been refunded!', 'Already refunded!');
            return false;
        }
        this.orderService.refundCancelOrder(id, status).subscribe(() => {
            this._notification.create('success', 'Refund completed successfully', 'Succeeded');
            this.getPageData();
            this._isSpinning = false;
        }, error => {
            this._notification.create('error', 'Error occurred while refunding for the order!', error.error);
            this._isSpinning = false;
        })
    }

}
