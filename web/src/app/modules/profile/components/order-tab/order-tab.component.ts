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
import {ORDER_STATUSES} from "../../../../../environments/global_config";

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
                    let end = moment(order.createdAt);
                    let duration = moment.duration(now.diff(end));
                    let expendedHour =  Math.floor(duration.asHours());
                    if(this.globalPartialPaymentDuration >= expendedHour && order.status != ORDER_STATUSES.CANCELED_ORDER){
                        order.isAllowedForPay = true;
                    }
                    else{
                        order.isAllowedForPay = false;
                    }
                    return order;
                });
                this.orderList = orders;

                this.dashboardData = allData[2];
            }, error => {
                console.log(error);
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
    makePartialPayment(order){
        this.partialPaymentModalService.showPartialModal(true, order.id);
    }
}

