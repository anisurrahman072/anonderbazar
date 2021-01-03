import { Component, OnInit, QueryList, ViewChildren } from "@angular/core";
import { OrderService } from "../../../services/order.service";
import { SuborderService } from "../../../services/suborder.service";

import { AuthService } from "../../../services/auth.service";
import { NzNotificationService } from "ng-zorro-antd";
import { of, Subscription } from "rxjs";
import { format } from "url";
import { formatDate } from "@angular/common";
import { UIService } from "../../../services/ui/ui.service";

@Component({
  selector: "app-online-order",
  templateUrl: "./online-order.component.html",
  styleUrls: ["./online-order.component.css"]
})
export class OnlineOrderComponent implements OnInit {
  options: { value: number; label: string; icon: string }[];
  currentUser: any;
  data: any = [];
  _isSpinning: boolean;
  isVisibleOnline : boolean;
  style: any = {
    top: '10px'
  };
  currentDate: any;
  allDataOnline: any = [];
  private currentWarehouseSubscriprtion: Subscription;
  private currentWarehouseId: any;
  constructor(
    private orderService: OrderService,
    private _notification: NzNotificationService,
    private uiService: UIService,
    private subOrderService: SuborderService,
    private authService: AuthService
  ) {}
  //Event method for getting all the data for the page

  ngOnInit() {
    this.isVisibleOnline = false;
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
    let now = new Date();
    let now2 = new Date();
    this.currentDate = now2.getFullYear()+"-"+(now2.getMonth()+1)+"-"+now2.getDate();
    this.currentUser = this.authService.getCurrentUser();
    this.currentWarehouseSubscriprtion = this.uiService.currentSelectedWarehouseInfo.subscribe(
      warehouseId => { 
        this.currentWarehouseId = warehouseId || '';
        this.getPageData();
      }
    ); 
    
    
  }
    //Event method for getting all the data for the page

  getPageData(): void {
    this.subOrderService
      .getSuborderWithDate(this.currentWarehouseId, 1,this.currentDate, null)
      .subscribe(result => {
        this.data = result.data;
      });
  }
  //Method for showing the modal 
  showModalOnline = () => {
    this.isVisibleOnline = true;
    this.currentUser = this.authService.getCurrentUser(); 
    if (this.currentUser.warehouse) {
      this.subOrderService
      .getSuborderWithDate(this.currentUser.warehouse.id, 1,this.currentDate, null)
      .subscribe(result => {
        this.allDataOnline = result.data;
      });
    } else {
      this.subOrderService
      .getSuborderWithDate('', 1,this.currentDate, null)
      .subscribe(result => {
        this.allDataOnline = result.data;
      });
    }
    

  }

  handleOk = (e) => {
    this.isVisibleOnline = false;
  }

  handleCancel = (e) => {
    this.isVisibleOnline = false;
  }
}
