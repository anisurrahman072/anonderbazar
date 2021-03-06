import {Component, ElementRef, OnInit, ViewChild} from '@angular/core';
import {Store} from "@ngrx/store";
import {Observable} from "rxjs/Observable";
import {MatPaginator} from "@angular/material";
import {AuthService, GlobalConfigService, OrderService, UserService} from "../../../../services";
import * as fromStore from "../../../../state-management/index";
import {AppSettings} from "../../../../config/app.config";
import {PartialPaymentModalService} from "../../../../services/ui/partial-payment-modal.service";
import * as moment from 'moment';
import {forkJoin} from "rxjs/observable/forkJoin";
import {ORDER_STATUSES, PAYMENT_STATUS, ORDER_TYPE} from "../../../../../environments/global_config";
import {timer} from 'rxjs/observable/timer';
import {Router} from "@angular/router";
import {NotificationsService} from "angular2-notifications";
import {LoaderService} from "../../../../services/ui/loader.service";

@Component({
    selector: 'Order-tab',
    templateUrl: './order-tab.component.html',
    styleUrls: ['./order-tab.component.scss']
})
export class OrderTabComponent implements OnInit {
    @ViewChild(MatPaginator) paginator: MatPaginator;
    IMAGE_ENDPOINT: string = AppSettings.IMAGE_ENDPOINT;
    orderList: any = [];

    currentUser: any;
    orders: Observable<any>;
    currentPage: number = 1;
    limit: number = 20;
    dashboardData: any = {};
    statusFilter = 'all';

    globalPartialPaymentDuration: number;
    allRemainingTime: any[] = [];
    remainingTimeInHourMinute: any[] = [];
    PAYMENT_STATUS: any = PAYMENT_STATUS;
    isShownConfirm: boolean = false;

    orderStatus;

    /*
    * constructor for OrderTabComponent
    */
    constructor(private store: Store<fromStore.HomeState>,
                private authService: AuthService,
                private orderService: OrderService,
                private userService: UserService,
                private partialPaymentModalService: PartialPaymentModalService,
                private globalConfigService: GlobalConfigService,
                private router: Router,
                private _notify: NotificationsService,
                public loaderService: LoaderService,
                private el: ElementRef
    ) {
    }

    //init the component
    ngOnInit(): void {

        this.currentUser = this.authService.getCurrentUserId();
        forkJoin([this.globalConfigService.getGlobalConfig(), this.orderService.getByUserId(this.currentUser), this.userService.getByIdForDashBoard(this.authService.getCurrentUserId())])
            .subscribe(allData => {
                this.globalPartialPaymentDuration = allData[0].configData[0].partial_payment_duration;

                this.loadAllOrders(allData[1]);

                this.convertMilliSecondToHourMinute();

                this.dashboardData = allData[2];
                // console.log('this.dashboardData==>', this.dashboardData);
                // console.log('this.dashboardData total==>', this.dashboardData.totalOrder);
            }, error => {
                console.log(error);
            });

        timer(0, 60000)
            .subscribe(data => {
                this.remainingTimeInHourMinute = null;
                this.orderList.forEach((order, i) => {
                    if (this.allRemainingTime[order.id] - 60000 <= 0) {
                        this.allRemainingTime[order.id] = 0;
                        this.orderList[i].isAllowedForPay = false;
                    } else
                        this.allRemainingTime[order.id] -= 60000;
                });
                this.convertMilliSecondToHourMinute();
            })
    }

    loadAllOrders(allOrder) {
        this.orderList = [];
        let orders = allOrder.map(order => {
            let now = moment(new Date());
            let createdAt = moment(order.createdAt);
            let duration = moment.duration(now.diff(createdAt));
            let expendedHour = Math.floor(duration.asHours());

            const globalHourToMS = this.globalPartialPaymentDuration * 60 * 60 * 1000;
            this.allRemainingTime[order.id] = globalHourToMS - Math.floor(duration.asMilliseconds());

            if (this.globalPartialPaymentDuration >= expendedHour && order.status != ORDER_STATUSES.CANCELED_ORDER
                && order.payment_status != PAYMENT_STATUS.PAID && order.payment_status != PAYMENT_STATUS.NOT_APPLICABLE
                && order.paid_amount < order.total_price && order.order_type == ORDER_TYPE.PARTIAL_PAYMENT_ORDER) {
                order.isAllowedForPay = true;
            } else {
                order.isAllowedForPay = false;
            }
            return order;
        });
        this.orderList = orders;
    }

    convertMilliSecondToHourMinute() {
        this.remainingTimeInHourMinute = [];
        this.orderList.forEach(order => {
            if (this.allRemainingTime[order.id] === 0) {
                this.remainingTimeInHourMinute[order.id] = `0 hr : 0 min`;
            } else {
                let minutes = moment.duration(this.allRemainingTime[order.id]).minutes();
                let hours = Math.trunc(moment.duration(this.allRemainingTime[order.id]).asHours());
                this.remainingTimeInHourMinute[order.id] = `${hours} hr : ${minutes} min`;
            }
        });
    }

    //Event called for getting order data
    getFilteredOrderList() {
        // let document = this.el.nativeElement;
        if (this.statusFilter == 'all') {
            this.orderStatus = this.orderList;
            // if (this.orderStatus.length <= 0) {
            //     if (!(document.querySelector(".table-hide").classList.contains("hidden-class"))) {
            //         document.querySelector(".table-hide").classList.add("hidden-class");
            //         document.querySelector(".div-hide").classList.add("hidden-class");
            //     }
            //     if (document.querySelector(".hide-no-product").classList.contains("hidden-class")) {
            //         document.querySelector(".hide-no-product").classList.remove("hidden-class");
            //     }
            // }
            //
            // if (this.orderStatus.length > 0) {
            //     if (document.querySelector(".table-hide").classList.contains("hidden-class")) {
            //         document.querySelector(".table-hide").classList.remove("hidden-class");
            //         document.querySelector(".div-hide").classList.remove("hidden-class");
            //     }
            //     if(!(document.querySelector(".hide-no-product").classList.add("hidden-class"))) {
            //         document.querySelector(".hide-no-product").classList.add("hidden-class");
            //     }
            // }
            return this.orderStatus;
        } else {
            this.orderStatus = this.orderList.filter(x => x.status == +this.statusFilter);
            // if (this.orderStatus.length <= 0) {
            //     if (!(document.querySelector(".table-hide").classList.contains("hidden-class"))) {
            //         document.querySelector(".table-hide").classList.add("hidden-class");
            //     }
            //     if (!(document.querySelector(".div-hide").classList.contains("hidden-class"))) {
            //         document.querySelector(".div-hide").classList.add("hidden-class");
            //     }
            //     if (document.querySelector(".hide-no-product").classList.contains("hidden-class")) {
            //         document.querySelector(".hide-no-product").classList.remove("hidden-class");
            //     }
            // }
            //
            // if (this.orderStatus.length > 0) {
            //     if (document.querySelector(".table-hide").classList.contains("hidden-class")) {
            //         document.querySelector(".table-hide").classList.remove("hidden-class");
            //         document.querySelector(".div-hide").classList.remove("hidden-class");
            //     }
            //     if (!(document.querySelector(".hide-no-product").classList.contains("hidden-class"))) {
            //         document.querySelector(".hide-no-product").classList.add("hidden-class");
            //     }
            // }
            return this.orderStatus;
        }
    }

    /** Make payment payment for the order */
    makePartialPayment(order) {
        this.partialPaymentModalService.showPartialModal(true, order.id);
    }

    cancelOrder(oderId) {
        let confirm = window.confirm('Are you confirm to delete the order?');
        if (confirm) {
            this.loaderService.showLoader();
            this.orderService.deleteOrder(oderId)
                .concatMap(data => {
                    return this.orderService.getByUserId(this.currentUser);
                })
                .subscribe(data => {
                    this.loadAllOrders(data);
                    this.loaderService.hideLoader();
                    /*console.log('Successfully deleted the product');*/
                    this._notify.success('Successfully cancelled the order the order!');
                }, error => {
                    this.loaderService.hideLoader();
                    console.log('Error occurred while canceling the order!', error);
                    this._notify.error('Error occurred while canceling the order!');
                })
        }
    }
}

