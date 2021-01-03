import {AfterViewInit, Component, Input, OnInit, ViewChild} from '@angular/core';

import {Store} from "@ngrx/store";
import {Observable} from "rxjs/Observable";


import {MatPaginator, MatTableDataSource} from "@angular/material";
import {FavouriteProduct, Product, User} from "../../../../models/index";
import {AuthService, OrderService, UserService} from "../../../../services/index";
import * as fromStore from "../../../../state-management/index";
import {AppSettings} from "../../../../config/app.config";

@Component({
    selector: 'Order-tab',
    templateUrl: './order-tab.component.html',
    styleUrls: ['./order-tab.component.scss']
})
export class OrderTabComponent implements OnInit {
    IMAGE_ENDPOINT: string = AppSettings.IMAGE_ENDPOINT;
    displayedColumns = ['id',  'invoice', 'total_quantity', 'total_price', 'status', 'suborders'];
    orderList: any = []; 
    
    @ViewChild(MatPaginator) paginator: MatPaginator;
    currentUser: any;
    orders: Observable<any>;
    currentPage:number = 1;
    limit:number = 20;
    dashboardData:any = {};
    statusFilter = 'all';
    /*
    * constructor for OrderTabComponent
    */
    constructor(private store: Store<fromStore.HomeState>,
                private authService: AuthService,
                private orderService: OrderService,
                private userService: UserService,) {
    }
    
    //init the component
    ngOnInit(): void {
        
        this.currentUser = this.authService.getCurrentUserId();
        this.orderService.getByUserId(this.currentUser).subscribe(orders => {
            this.orderList = orders; 
        })

        this.userService.getByIdForDashBoard(this.authService.getCurrentUserId()).subscribe(result => {
            this.dashboardData = result;
        })
    }

    //Event called for getting order data
    getFilteredOrderList(){
        if (this.statusFilter == 'all'){
            return this.orderList;
        } else {
            return this.orderList.filter(x=>x.status == +this.statusFilter);
        }
    }
}

