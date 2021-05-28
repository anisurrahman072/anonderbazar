import {Component, OnInit, ViewChild} from '@angular/core';
import {Store} from "@ngrx/store";
import {Observable} from "rxjs/Observable";
import {MatPaginator} from "@angular/material";
import {AuthService, GlobalConfigService, OrderService, UserService} from "../../../../services";
import * as fromStore from "../../../../state-management/index";
import {AppSettings} from "../../../../config/app.config";
import {PartialPaymentModalService} from "../../../../services/ui/partial-payment-modal.service";
import * as moment from 'moment';
import {forkJoin} from "rxjs/observable/forkJoin";
import {ORDER_STATUSES, PAYMENT_STATUS} from "../../../../../environments/global_config";
import {timer} from 'rxjs/observable/timer';

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

    /*
    * constructor for OrderTabComponent
    */
    constructor(private store: Store<fromStore.HomeState>,
                private authService: AuthService,
                private orderService: OrderService,
                private userService: UserService,
                private partialPaymentModalService: PartialPaymentModalService,
                private globalConfigService: GlobalConfigService
    ) {
    }

    //init the component
    ngOnInit(): void {

        this.currentUser = this.authService.getCurrentUserId();
        forkJoin([this.globalConfigService.getGlobalConfig(), this.orderService.getByUserId(this.currentUser), this.userService.getByIdForDashBoard(this.authService.getCurrentUserId())])
            .subscribe(allData => {
                this.globalPartialPaymentDuration = allData[0].configData[0].partial_payment_duration;
                let orders = allData[1].map(order => {
                    let now = moment(new Date());
                    let createdAt = moment(order.createdAt);
                    let duration = moment.duration(now.diff(createdAt));
                    let expendedHour = Math.floor(duration.asHours());

                    const globalHourToMS = this.globalPartialPaymentDuration * 60 * 60 * 1000;
                    this.allRemainingTime[order.id] = globalHourToMS - Math.floor(duration.asMilliseconds());

                    if (this.globalPartialPaymentDuration >= expendedHour && order.status != ORDER_STATUSES.CANCELED_ORDER
                    && order.payment_status != PAYMENT_STATUS.PAID && order.payment_status != PAYMENT_STATUS.NOT_APPLICABLE) {
                        order.isAllowedForPay = true;
                    } else {
                        order.isAllowedForPay = false;
                    }
                    return order;
                });
                this.orderList = orders;
                this.convertMilliSecondToHourMinute();

                this.dashboardData = allData[2];
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
        if (this.statusFilter == 'all') {
            return this.orderList;
        } else {
            return this.orderList.filter(x => x.status == +this.statusFilter);
        }
    }

    /** Make payment payment for the order */
    makePartialPayment(order) {
        this.partialPaymentModalService.showPartialModal(true, order.id);
    }
}

