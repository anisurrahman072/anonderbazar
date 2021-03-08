import { Component, OnInit, QueryList, ViewChildren } from '@angular/core';
import { Subscription } from 'rxjs';
import { UIService } from '../../../../services/ui/ui.service';
import { FormGroup, FormBuilder, Validators } from '@angular/forms';
import { CourierService } from '../../../../services/courier.service';
import { ActivatedRoute } from '@angular/router';
import { CourierPriceService } from '../../../../services/courier-price.service';
import { StatusChangeService } from '../../../../services/statuschange.service';
import { AuthService } from '../../../../services/auth.service';
import { SuborderService } from '../../../../services/suborder.service';
import { OrderService } from '../../../../services/order.service';
import {NzNotificationService} from "ng-zorro-antd";


@Component({
  selector: 'app-courier-list',
  templateUrl: './courier-list.component.html',
  styleUrls: ['./courier-list.component.css']
})

export class CourierListComponent implements OnInit {
  @ViewChildren('dataFor') dataFor: QueryList<any>;
  status: any;
  limit: number = 10;
  page: number = 1;
  total: number;
  data: any = [];
  _isSpinning: boolean = false;
  isVisible = false;
  isEditVisible = false;
  isConfirmLoading = false;
  validateForm: FormGroup;
  style: any = {
    height: '500px'
  };
  styleEdit: any = {
    height: '500px'
  };
  editName: string;
  editPrice: number;
  editRemarks: string;
  validateEditForm: FormGroup;
  id: number;
  selectedOption: any[] = [];
  options: any[];
  viewNotRendered: boolean = true;
  listOfSubOrder = [];
  listOfCourier = [];
  listOfCourierPrice = [];
  currentWarehouseSubscriprtion: Subscription;
  currentWarehouseId: any;
  statusData: any;
  currentUser: any;
  data1:any;
  loading;
  constructor(private route: ActivatedRoute,
              private uiService: UIService,
              private courierPriceService: CourierPriceService,
              private suborderService: SuborderService,
              private orderService: OrderService,
              private statusChangeService: StatusChangeService,
              private fb: FormBuilder,private authService: AuthService,
              private _notification: NzNotificationService,
              private courierService: CourierService) {

  }
  options1 = [
    { value: 3, label: 'Prepared', icon: 'anticon-spin anticon-loading' },
    { value: 4, label: 'Pickup/Departure', icon: 'anticon-spin anticon-loading' },
    { value: 10, label: 'Out For Delivery', icon: 'anticon-check-circle' },
    { value: 11, label: 'Delivered', icon: 'anticon-check-circle' },
    { value: 12, label: 'Returned', icon: 'anticon-close-circle' }
  ];
  options2 = [
    { value: 3, label: 'Prepared', icon: 'anticon-spin anticon-loading' },
    { value: 4, label: 'Departure', icon: 'anticon-spin anticon-loading' },
    { value: 6, label: 'In the Air', icon: 'anticon-spin anticon-loading' },
    { value: 7, label: 'landed', icon: 'anticon-spin anticon-loading' },
    { value: 8, label: 'Arrived At Warehouse', icon: 'anticon-spin anticon-loading' },
    { value: 9, label: 'Shipped', icon: 'anticon-spin anticon-hourglass' },
    { value: 10, label: 'Out For Delivery', icon: 'anticon-check-circle' },
    { value: 5, label: 'Pickup', icon: 'anticon-spin anticon-loading' },
    { value: 11, label: 'Delivered', icon: 'anticon-check-circle' },
    { value: 12, label: 'Returned', icon: 'anticon-close-circle' }
  ];
  // init the component
  ngOnInit() {

    this.validateForm = this.fb.group({
      suborder_id: ["", [Validators.required]],
      courier_id: ["", [Validators.required]],
      courier_price_id: ["", [Validators.required]],
      price: [""],
      destination: [""],
      shipping_date: [""],
      arrival_date: [""]

    });

    this.validateEditForm = this.fb.group({
      suborder_id: ["", [Validators.required]],
      courier_id: ["", [Validators.required]],
      courier_price_id: ["", [Validators.required]],
      price: [""],
      destination: [""],
      shipping_date: [""],
      arrival_date: [""]
    });

    this.currentUser = this.authService.getCurrentUser();

    this.currentWarehouseSubscriprtion = this.uiService.currentSelectedWarehouseInfo.subscribe(
        warehouseId => {
          this.currentWarehouseId = warehouseId || '';
          this.getCourierSettingsData();
        }
    );
  }

  //Event method for setting up courier setting data
  getCourierSettingsData(): void {
    this.loading = true;
    this.courierService.getAllCouriers(this.currentWarehouseId,this.page, this.limit).subscribe(result => {
      this.data = result.data;
      this.total = result.total;
    });
  }
  //Method for status change
  changeStatusConfirm($event, id, oldStatus, order_id) {
    this.courierService.update($event,id,oldStatus).subscribe(result=>{
      this.data1 = result[0].status;
      this.getCourierSettingsData();
    });

    this.statusChangeService.updateStatusCourier({ order_id: order_id, status: $event,changed_by: this.currentUser.id  })
        .subscribe(arg => this.statusData = arg);
  }
  //Method for set status
  setStatus(index, status) {
    if (!this.viewNotRendered) return;
    this.selectedOption[index] = status;
  }
  //Event method for submitting the form
  submitForm = ($event, value) => {
    $event.preventDefault();
    for (const key in this.validateForm.controls) {
      this.validateForm.controls[key].markAsDirty();
    }
    const formData: FormData = new FormData();
    formData.append("suborder_id", value.suborder_id);
    formData.append("courier_id", value.courier_id);
    formData.append("courier_price_id", value.courier_price_id);
    formData.append("destination", value.destination);
    formData.append("shipping_date", value.shipping_date);
    formData.append("arrival_date", value.arrival_date);
    formData.append("warehouse_id", this.currentWarehouseId);
    this.courierService.insert(formData).subscribe(
        result => {
          if (result.id) {
            this._notification.create(
                "success",
                "Courier list has been successfully added.",
                result.name
            );
          }
          this.isVisible = false;
          this.getCourierSettingsData();
          this.resetAllFilter();
          this._isSpinning = false;
        },
        error => {
          this._isSpinning = false;
        }
    );
  };
  //Method for showing the modal
  showModal = () => {
    this.isVisible = true;
    this.isEditVisible = false;
    this.courierService.getAllSubOrder(this.currentWarehouseId).subscribe(result => {
      this.listOfSubOrder = result.data;
    });
    this.courierService.getAllCourier().subscribe(result => {
      this.listOfCourier = result;
    });
  };

  handleOk = (e) => {
    this.isConfirmLoading = true;
    setTimeout(() => {
      this.isVisible = false;
      this.isConfirmLoading = false;
    }, 2000);
  };

  handleCancel = (e) => {
    this.isVisible = false;
    this.validateForm.reset();
    for (const key in this.validateForm.controls) {
      this.validateForm.controls[key].markAsPristine();
    }
  };
  courierChange($event) {
    this.validateForm.controls.courier_price_id.patchValue(null);
    this.validateForm.controls.price.patchValue(null);
    this.validateEditForm.controls.courier_price_id.patchValue(null);
    this.validateEditForm.controls.price.patchValue(null);
    const query = encodeURI($event);
    if (query == 'null') {
      return;
    }
    this.courierPriceService.getAllCourierPricesByCourierId(query).subscribe(
        result => {
          this.listOfCourierPrice = result;
        },
        error => { }
    );
  }
  subOrderChange($event) {
    this.suborderService.getById($event)
        .subscribe(arg => {
          this.orderService.getById(arg.product_order_id.id)
              .subscribe(order => {
              });
        });
  }
  courierPriceChange($event) {
    this.validateForm.controls.price.patchValue(null);
    this.validateEditForm.controls.price.patchValue(null);

    const query = encodeURI($event);

    if (query == 'null') {
      return;
    }
    this.courierPriceService.getById(query).subscribe(
        result => {
          this.validateForm.controls.price.patchValue(result.price);
        },
        error => { }
    );
  }
  courierPriceEditChange($event) {
    this.validateEditForm.controls.price.patchValue(null);

    const query = encodeURI($event);

    if (query == 'null') {
      return;
    }
    this.courierPriceService.getById(query).subscribe(
        result => {
          this.validateEditForm.controls.price.patchValue(result.price);
        },
        error => { }
    );
  }
  //Event method for setting up form in validation
  getFormControl(name) {
    return this.validateForm.controls[name];
  }

  changePage(page: number, limit: number) {
    this.page = page;
    this.limit = limit;
    this.getCourierSettingsData();
    return false;
  }
  //Event method for deleting courier list
  deleteConfirm(id) {
    this.courierService.deleteCourierList(id).subscribe(result => {
      this.getCourierSettingsData();
      this._notification.create('warning', 'Delete', 'Courier has been removed successfully');

    });
  }

  //Method for showing the edit modal
  showEditModal = (id: number) => {
    this.isEditVisible = true;
    this.id = id;
    this.courierService.getAllSubOrder(this.currentWarehouseId).subscribe(result => {
      this.listOfSubOrder = result.data;
    });
    this.courierService.getAllCourier().subscribe(result => {
      this.listOfCourier = result;
    });
    this.courierService.getById(this.id).subscribe(result => {

      this.validateEditForm.patchValue({
        suborder_id: result.data.suborder_id.id,
        courier_id: result.data.courier_id.id,
        courier_price_id: result.data.courier_price_id.id,
        price: result.data.courier_price_id.price,
        destination: result.data.destination,
        shipping_date: result.data.shipping_date,
        arrival_date: result.data.arrival_date,
      });
    });
  };
  //Event method for submitting the edit form
  submitEditForm = ($event, value) => {
    $event.preventDefault();
    for (const key in this.validateForm.controls) {
      this.validateForm.controls[key].markAsDirty();
    }

    const formData: FormData = new FormData();
    formData.append("suborder_id", value.suborder_id);
    formData.append("courier_id", value.courier_id);
    formData.append("courier_price_id", value.courier_price_id);
    formData.append("destination", value.destination);
    formData.append("shipping_date", value.shipping_date);
    formData.append("arrival_date", value.arrival_date);
    formData.append("warehouse_id", this.currentWarehouseId);

    this.courierService.updateCourierList(this.id, formData).subscribe(
        result => {
          if (result.id) {
            this._notification.create(
                "success",
                "Successful Message",
                result.name
            );
          }
          this.isEditVisible = false;
          this.getCourierSettingsData();
        },
        error => {
          this._isSpinning = false;
        }
    );
  };
  //Event method for resetting all filters
  resetAllFilter() {
    this.limit = 10;
    this.page = 1;
    this.getCourierSettingsData();
  }
  handleEditOk = (e) => {
    this.isConfirmLoading = true;
    setTimeout(() => {
      this.isEditVisible = false;
      this.isConfirmLoading = false;
      this.submitForm;
    }, 2000);
  };

  handleEditCancel = (e) => {
    this.validateEditForm.reset();
    for (const key in this.validateEditForm.controls) {
      this.validateEditForm.controls[key].markAsPristine();
    }
    this.isEditVisible = false;
  };
  //Event method for setting up edit form in validation
  getEditFormControl(name) {
    return this.validateEditForm.controls[name];
  }
}
