import {Component, Input, OnInit} from "@angular/core";
import {SuborderService} from "../../../services/suborder.service";
import {OrderService} from "../../../services/order.service";
import {AuthService} from "../../../services/auth.service";
import {NzNotificationService} from "ng-zorro-antd";
import {Subscription} from "rxjs";
import {GLOBAL_CONFIGS} from "../../../../environments/global_config";

@Component({
    selector: "app-running-order",
    templateUrl: "./running-order.component.html",
    styleUrls: ["./running-order.component.css"]
})
export class RunningOrderComponent implements OnInit {

    private _runningOrderData: any;
    subOrderData: any[] = [];
    options: { value: number; label: string; icon: string }[];
    currentUser: any;
    _isSpinning: boolean = true;
    view: any[] = [630, 350];
    showLegend = true;
    style: any = {
        top: '10px'
    };
    colorScheme = {
        domain: ["#5AA454", "#A10A28", "#C7B42C", "#AAAAAA"]
    };
    showLabels = true;
    explodeSlices = false;
    doughnut = false;
    single: any = [];
    customColors: any = [];
    allData: any = [];
    isVisibleRunning: boolean;
    currentWarehouseSubscriprtion: Subscription;
    currentWarehouseId: any;

    constructor(
        private orderService: OrderService,
        private _notification: NzNotificationService,
        private authService: AuthService,
        private subOrderService: SuborderService
    ) {
    }

    @Input()
    set runningOrders(data: any) {
        this._runningOrderData = data;
        let pendingCount = 0;
        let processingCount = 0;
        let deliveredCount = 0;
        let confirmedOrder = 0;
        let canceledCount = 0;
        this._isSpinning = true;

        if (this._runningOrderData) {
            this.subOrderData = this._runningOrderData.data;
            pendingCount = this._runningOrderData.pendingOrder;
            processingCount = this._runningOrderData.processingOrder;
            deliveredCount = this._runningOrderData.deliveredOrder;
            canceledCount = this._runningOrderData.canceledOrder;
            confirmedOrder = this._runningOrderData.confirmedOrder;

            this.setDashboardData(
                pendingCount,
                processingCount,
                deliveredCount,
                canceledCount,
                confirmedOrder
            );
            this._isSpinning = false;
        } else {
            this.setDashboardData(
                pendingCount,
                processingCount,
                deliveredCount,
                canceledCount,
                confirmedOrder
            );
            this._isSpinning = false;
            this.subOrderData = [];
        }

    }

    get runningOrders(): any {
        return this._runningOrderData;
    }

    //Event method for getting all the data for the page
    ngOnInit() {
        this.isVisibleRunning = false;

        this.options = GLOBAL_CONFIGS.ORDER_STATUSES;
        this.currentUser = this.authService.getCurrentUser();

        /*        this.currentWarehouseSubscriprtion = this.uiService.currentSelectedWarehouseInfo.subscribe(
                    warehouseId => {

                        this.currentWarehouseId = warehouseId || '';
                        if(!isNaN(this.currentWarehouseId)){
                            this.getPageData();
                        }

                    }
                );
          */
        /* let pendingCount = 0;
         let processingCount = 0;
         let deliveredCount = 0;
         let canceledCount = 0;
         console.log('ngOnInit', this.data);

         if (this.data) {
             this.subOrderData = this.data.data;
             pendingCount = this.data.pendingOrder;
             processingCount = this.data.processingOrder;
             deliveredCount = this.data.deliveredOrder;
             canceledCount = this.data.canceledOrder;

             this.setDashboardData(
                 pendingCount,
                 processingCount,
                 deliveredCount,
                 canceledCount
             );
         } else {
             this.setDashboardData(
                 pendingCount,
                 processingCount,
                 deliveredCount,
                 canceledCount
             );
         }*/
    }

    /*

        //Event method for getting all the data for the page
        getPageData() {

            let pendingCount = 0;
            let processingCount = 0;
            let deliveredCount = 0;
            let canceledCount = 0;
            if (this.currentWarehouseId) {
                this.subOrderService
                    .getSuborder(this.currentWarehouseId, 1, null)
                    .subscribe(result => {
                        this.data = result.data;

                        pendingCount = result.pendingOrder;
                        processingCount = result.processingOrder;
                        deliveredCount = result.deliveredOrder;
                        canceledCount = result.canceledOrder;

                        this.setDashboardData(
                            pendingCount,
                            processingCount,
                            deliveredCount,
                            canceledCount
                        );
                        this._isSpinning = false;
                    }, (error) => {
                        console.log(error);
                        this._isSpinning = false;
                    });
            } else {
                this.subOrderService
                    .getSuborder(null, 1, null)
                    .subscribe(result => {
                        this.data = result.data;

                        pendingCount = result.pendingOrder;
                        processingCount = result.processingOrder;
                        deliveredCount = result.deliveredOrder;
                        canceledCount = result.canceledOrder;

                        this.setDashboardData(
                            pendingCount,
                            processingCount,
                            deliveredCount,
                            canceledCount
                        );
                        this._isSpinning = false;
                    }, (error) => {
                        console.log(error);
                        this._isSpinning = false;
                    });
            }

        }

    */

    //Method for showing the modal
    showModal = () => {
        console.log('RunningOrderComponent-showModal')
        this.isVisibleRunning = true;
        this._isSpinning = true;
        this.currentUser = this.authService.getCurrentUser();
        if (this.currentUser.warehouse) {
            this.subOrderService
                .getSuborder(this.currentUser.warehouse.id, 1, null)
                .subscribe(result => {
                    this.allData = result.data;
                    this._isSpinning = false;
                }, (error) => {
                    console.log(error);
                    this._isSpinning = false;
                });
        } else {
            this.subOrderService
                .getSuborder('', 1, null)
                .subscribe(result => {
                    this.allData = result.data;
                    this._isSpinning = false;
                }, (error) => {
                    console.log(error);
                    this._isSpinning = false;
                });
        }
    }

    //Event method for getting all the data for dashboard
    setDashboardData(
        PendingCount,
        processingCount,
        deliveredCount,
        canceledCount,
        confirmedOrder
    ) {
        this.single = [
            {
                name: "Pending",
                value: PendingCount
            },
            {
                name: "Confirmed",
                value: confirmedOrder
            },
            {
                name: "Processing",
                value: processingCount
            },
            {
                name: "Delivered",
                value: deliveredCount
            },
            {
                name: "Canceled",
                value: canceledCount
            }
        ];

        this.customColors = [
            {
                name: "Pending",
                value: "#108EE9"
            },
            {
                name: "Confirmed",
                value: "#0f7c1d"
            },
            {
                name: "Processing",
                value: "#FFE741"
            },
            {
                name: "Delivered",
                value: "#1DBB99"
            },
            {
                name: "Canceled",
                value: "#F04723"
            }
        ];
    }

    onSelect(event) {
    }


    handleOk = (e) => {
        this.isVisibleRunning = false;
    }

    handleCancel = (e) => {
        this.isVisibleRunning = false;
    }
}
