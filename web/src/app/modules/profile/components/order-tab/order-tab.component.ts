import {Component, OnInit, ViewChild} from '@angular/core';
import {Store} from "@ngrx/store";
import {Observable} from "rxjs/Observable";
import {MatPaginator} from "@angular/material";
import {AuthService, OrderService, UserService} from "../../../../services";
import * as fromStore from "../../../../state-management/index";
import {AppSettings} from "../../../../config/app.config";
import {PartialPaymentModalService} from "../../../../services/ui/partial-payment-modal.service";

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

    /*
    * constructor for OrderTabComponent
    */
    constructor(private store: Store<fromStore.HomeState>,
                private authService: AuthService,
                private orderService: OrderService,
                private userService: UserService,
                private partialPaymentModalService: PartialPaymentModalService) {
    }

    //init the component
    ngOnInit(): void {

        this.currentUser = this.authService.getCurrentUserId();
        this.orderService.getByUserId(this.currentUser).subscribe(orders => {
            this.orderList = orders;
        })

        this.userService.getByIdForDashBoard(this.authService.getCurrentUserId()).subscribe(result => {
            this.dashboardData = result;
        }, (error) => {
            console.log(error);
        })
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

