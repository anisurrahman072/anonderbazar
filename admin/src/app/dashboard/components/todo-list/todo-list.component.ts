import date from "./../../../../../node_modules/date-and-time";
import { Component, OnInit, QueryList, ViewChildren } from "@angular/core";
import { OrderService } from "../../../services/order.service";
import { UserService } from "../../../services/user.service";
import { SuborderService } from "../../../services/suborder.service";
import { SuborderItemService } from "../../../services/suborder-item.service";
import { ProductService } from "../../../services/product.service";


import { AuthService } from "../../../services/auth.service";
import { NzNotificationService } from "ng-zorro-antd";
import { of, Subscription } from "rxjs";
import { format } from "url";
import { formatDate } from "@angular/common";
import { UIService } from "../../../services/ui/ui.service";

@Component({
  selector: "app-todo-list",
  templateUrl: "./todo-list.component.html",
  styleUrls: ["./todo-list.component.css"]
})
export class TodoListComponent implements OnInit {
  now: any;
  options: { value: number; label: string; icon: string }[];
  currentUser: any;
  data: any = [];
  newData: any = [];
  subOrderdata: any;
  _isSpinning: boolean;

  isVisibleTodayTodo: boolean;
  isVisibleAllTodo: boolean;
  style: any = {
    top: "10px"
  };
  currentDate: any;
  allDataTodayTodo: any = [];
  allDataAllTodo: any = [];
  private currentWarehouseSubscriprtion: Subscription;
  private currentWarehouseId: any;
  constructor(
    private orderService: OrderService,
    private _notification: NzNotificationService,
    private authService: AuthService,
    private subOrderService: SuborderService,
    private productService: ProductService,
    private suborderItemService: SuborderItemService,
    private uiService:UIService,
    private userService: UserService
  ) {}
    //Event method for getting all the data for the page

  ngOnInit() {
    this.isVisibleTodayTodo = false;
    this.isVisibleAllTodo = false;
    this.now = new Date(); 
    this.now = date.format(this.now, "MMMM DD YYYY"); 

    this.currentUser = this.authService.getCurrentUser();
    this.currentWarehouseSubscriprtion = this.uiService.currentSelectedWarehouseInfo.subscribe(
      warehouseId => {
        this.currentWarehouseId = warehouseId || '';
        this.getPageData();
      }
    );
    let now2 = new Date();
    this.currentDate = now2.getFullYear()+"-"+(now2.getMonth()+1)+"-"+now2.getDate();
  }

  //Event method for getting all the data for the page

  getPageData(){
    this.suborderItemService
        .getSuborderItems(this.currentWarehouseId, 2,this.currentDate, null)
        .subscribe(result => {
          this.data = result.data;
        });

      this.suborderItemService
        .getSuborderItems(this.currentWarehouseId, 1,'' ,null)
        .subscribe(result => {
          this.newData = result.data;
        });
  }
  replaceNumbers(input) {
    let output = [];
    let numbers = {
      0: "0",
      1: "1",
      2: "2",
      3: "3",
      4: "4",
      5: "5",
      6: "6",
      7: "7",
      8: "8",
      9: "9"
    };
    for (var i = 0; i < input.length; ++i) {
      if (numbers.hasOwnProperty(input[i])) {
        output.push(numbers[input[i]]);
      } else {
        output.push(input[i]);
      }
    }
    return output.join("");
  }
  //Method for showing the modal

  showModalTodayTodo = () => {
    this.isVisibleTodayTodo = true;
    this.suborderItemService
        .getSuborderItems(this.currentWarehouseId, 2,this.currentDate, null)
        .subscribe(result => {
          this.allDataTodayTodo = result.data;
        });
  };

  handleOk = e => {
    this.isVisibleTodayTodo = false;
  };

  handleCancel = e => {
    this.isVisibleTodayTodo = false;
  };
  //Method for showing the modal

  showModalAllTodo = () => {
    this.isVisibleAllTodo = true;
    this.suborderItemService
        .getSuborderItems(this.currentWarehouseId, 1,'', null)
        .subscribe(result => {
          this.allDataAllTodo = result.data;
        });
  };

  handleAllOk = e => {
    this.isVisibleAllTodo = false;
  };

  handleAllCancel = e => {
    this.isVisibleAllTodo = false;
  };
}
