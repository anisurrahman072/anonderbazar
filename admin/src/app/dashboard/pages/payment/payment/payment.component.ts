import {Component, OnInit} from '@angular/core';
import {PaymentService} from '../../../../services/payment.service';
import {AuthService} from '../../../../services/auth.service';
import {environment} from "../../../../../environments/environment";
import {NzNotificationService} from "ng-zorro-antd";

@Component({
  selector: 'app-payment',
  templateUrl: './payment.component.html',
  styleUrls: ['./payment.component.css']
})
export class PaymentComponent implements OnInit {
  data = [];
  _isSpinning = true;
  IMAGE_ENDPOINT = environment.IMAGE_ENDPOINT;
  currentUser: any;

  loading = false;
  page: number = 1;
  total: number;
  selectedOption: any[] = [];
  viewNotRendered: boolean = true;

  nameSearchValue: string = '';
  orderNumberSearchValue: string = '';
  suborderNumberSearchValue: string = '';
  userIdSearchValue: string = '';
  transactionSearchValue: string = '';
  paymentTypeSearchValue: string = '';
  paymentAmountSearchValue: string = '';
  dateSearchValue: string = '';
  statusSearchValue: string = '';
  limit: number = 10;

  sortValue = {
    name: null,
    price: null
  };
  receiver_id: any = null;

  subcategorySearchOptions: any;
  categorySearchOptions: any[] = [];
  options: any[];

  constructor(
      private paymentService: PaymentService,
      private _notification: NzNotificationService,
      private authService: AuthService
  ) {
  }

  // init the component
  ngOnInit(): void {
    this.options = [
      {
        value: 1,
        label: 'Pending',
        icon: 'anticon-spin anticon-loading'
      },
      {
        value: 2,
        label: 'Processing',
        icon: 'anticon-spin anticon-hourglass'
      },
      {
        value: 3,
        label: 'Delivered',
        icon: 'anticon-check-circle'
      },
      {
        value: 4,
        label: 'Canceled',
        icon: 'anticon-close-circle'
      }
    ];
    this.currentUser = this.authService.getCurrentUser();
    if (this.currentUser.group_id != "admin") {
      this.receiver_id = this.currentUser.id;
    }
    this.getPageData();
  }

  //Event method for getting all the data for the page
  getPageData() {
    this.loading = true;
    this.paymentService
        .getAllPayment(
            this.page,
            this.limit,
            this.nameSearchValue || '',
            this.orderNumberSearchValue || '',
            this.suborderNumberSearchValue || '',
            this.userIdSearchValue || '',
            this.transactionSearchValue || '',
            this.paymentTypeSearchValue || '',
            this.paymentAmountSearchValue || '',
            this.dateSearchValue || '',
            this.statusSearchValue || '',
            this.receiver_id || '',
            this.filterTerm(this.sortValue.name),
            this.filterTerm(this.sortValue.price)
        )
        .subscribe(
            result => {
              this.loading = false;
              this.data = result.data;
              this.total = result.total;
              console.log(result);
              this._isSpinning = false;

            },
            result => {
              this.loading = false
              this._isSpinning = false;
            }
        );
  }

  //Method for status change

  changeStatusConfirm(index, id, oldStatus) {
    if (this.currentUser.group_id == "admin") {
      this.paymentService
          .update(id, {status: this.selectedOption[index]})
          .subscribe(
              res => {
                this.data[index].status = this.selectedOption[index];
              },
              err => {
                this.selectedOption[index] = oldStatus;
              }
          );
    }
  }

  //Method for set status

  setStatus(index, id) {
    if (!this.viewNotRendered) return;
    this.selectedOption[index] = status;
  }

  //Event method for pagination change
  changePage(page: number, limit: number) {
    this.page = page;
    this.limit = limit;
    this.getPageData();
    return false;
  }

  //Event method for setting up filter data
  private filterTerm(sortValue: string): string {
    switch (sortValue) {
      case 'ascend':
        return 'ASC';
      case 'descend':
        return 'DESC';
      default:
        return '';
    }
  }

  //Event method for resetting all filters
  resetAllFilter() {
    this.limit = 5;
    this.page = 1;
    this.nameSearchValue = '';
    this.sortValue = {
      name: null,
      price: null
    };


    this.getPageData();
  }

  categoryIdChange($event) {
    this.page = 1;
    const query = encodeURI($event);

    this.getPageData();
  }

  categoryIdSearchChange($event) {
  }

  subcategoryIdChange($event) {
    this.page = 1;
    this.getPageData();
  }

  subcategoryIdSearchChange($event) {
  }

  //Event method for deleting payment
  deleteConfirm(id) {
    if (this.currentUser.group_id == "admin") {
      this._isSpinning = true;

      this.paymentService.delete(id).subscribe(result => {
        this._notification.create('warning', 'Delete', 'Transaction has been removed successfully');

        this._isSpinning = false;

      });
      this.getPageData();
    }
  }
}
