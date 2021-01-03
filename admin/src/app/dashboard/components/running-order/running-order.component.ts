import { Component, OnInit, QueryList, ViewChildren } from "@angular/core";
import { SuborderService } from "../../../services/suborder.service";
import { OrderService } from "../../../services/order.service";
import { UserService } from "../../../services/user.service";

import { AuthService } from "../../../services/auth.service";
import { NzNotificationService } from "ng-zorro-antd";
import { of, Subscription } from "rxjs";
import { UIService } from "../../../services/ui/ui.service";

@Component({
  selector: "app-running-order",
  templateUrl: "./running-order.component.html",
  styleUrls: ["./running-order.component.css"]
})
export class RunningOrderComponent implements OnInit {
  orderList: any = [];
  options: { value: number; label: string; icon: string }[];
  currentUser: any;
  data: any = [];
  _isSpinning: boolean;
  view: any[] = [630, 350];
  
  // options
  showLegend = true;
  style: any = {
    top: '10px'
  };

  colorScheme = {
    domain: ["#5AA454", "#A10A28", "#C7B42C", "#AAAAAA"]
  };

  // pie
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
    private subOrderService: SuborderService,
    private userService: UserService,
    private uiService:UIService
  ) {}
  //Event method for getting all the data for the page

  ngOnInit() {
    this.isVisibleRunning = false;
    
    this.options = [
      {
        value: 1,
        label: "Pending",
        icon: "anticon-spin anticon-loading"
      },
      {
        value: 2,
        label: "Processing",
        icon: "anticon-spin anticon-hourglass"
      },
      {
        value: 3,
        label: "Delivered",
        icon: "anticon-check-circle"
      },
      {
        value: 4,
        label: "Canceled",
        icon: "anticon-close-circle"
      }
    ];
    this.currentUser = this.authService.getCurrentUser();

    this.currentWarehouseSubscriprtion = this.uiService.currentSelectedWarehouseInfo.subscribe(
      warehouseId => { 
        this.currentWarehouseId = warehouseId || '';
        this.getPageData();
      }
    );
    
  }
  //Event method for getting all the data for the page

  getPageData(){
    let pendingCount = 0;
    let processingCount = 0;
    let deliveredCount = 0;
    let canceledCount = 0;
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
      });
  }
  //Event method for getting all the data for dashboard

  setDashboardData(
   PendingCount,
    processingCount,
    deliveredCount,
    canceledCount
  ) {
    this.single = [
      {
        name: "Pending",
        value:PendingCount
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

  //Method for showing the modal 
  showModal = () => {
    this.isVisibleRunning = true;
    this.currentUser = this.authService.getCurrentUser();
    if (this.currentUser.warehouse) {
      this.subOrderService
      .getSuborder(this.currentUser.warehouse.id, 1, null)
      .subscribe(result => {
        this.allData = result.data;
      });
    } else {
      this.subOrderService
      .getSuborder('', 1, null)
      .subscribe(result => {
        this.allData = result.data;
      });
    }
    this.subOrderService
      .getSuborder(this.currentUser.warehouse.id, 1, null)
      .subscribe(result => {
        this.allData = result.data;
      });

  }

  handleOk = (e) => {
    this.isVisibleRunning = false;
  }

  handleCancel = (e) => {
    this.isVisibleRunning = false;
  }
}
