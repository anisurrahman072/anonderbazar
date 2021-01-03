import { Component, OnDestroy, OnInit } from '@angular/core';
import { WarehouseVariantService } from '../../../../services/warehouse-variant.service';

import { AuthService } from '../../../../services/auth.service';
import { UIService } from '../../../../services/ui/ui.service';
import { Subscription } from 'rxjs';
import { NzNotificationService } from 'ng-zorro-antd';
import {environment} from "../../../../../environments/environment";

@Component({
  selector: 'app-warehouse-variant',
  templateUrl: './warehouse-variant.component.html',
  styleUrls: ['./warehouse-variant.component.css']
})
export class WarehouseVariantComponent implements OnInit, OnDestroy {
  ngOnDestroy(): void {
    this.currentWarehouseSubscriprtion
      ? this.currentWarehouseSubscriprtion.unsubscribe()
      : '';
  }

  data = [];
  _isSpinning = true;
  IMAGE_ENDPOINT = environment.IMAGE_ENDPOINT;

  categoryId: any = null;
  subcategoryId: any = null;

  limit: number = 10;
  page: number = 1;
  total: number;
  nameSearchValue: string = '';
  emailSearchValue: string = '';
  phoneSearchValue: string = '';
  genderSearchValue: string = '';

  sortValue = {
    name: null,
    price: null
  };
  subcategorySearchOptions: any;
  categorySearchOptions: any[] = [];

  private currentWarehouseSubscriprtion: Subscription;
  private currentWarehouseId: any;

  constructor(
    private warehouseVariantService: WarehouseVariantService,
    private uiService: UIService,
    private _notification: NzNotificationService,
    private authService: AuthService
  ) {}
  // For initiating the section element with data
  ngOnInit(): void {
    this.currentWarehouseSubscriprtion = this.uiService.currentSelectedWarehouseInfo.subscribe(
      warehouseId => {
        this.currentWarehouseId = warehouseId || '';
        this.getPageData();
      }
    );
  }
  // Event method for getting all the data for the page
  getAllData() {
    this.warehouseVariantService
      .getAllVariant(this.currentWarehouseId)
      .subscribe(
        (result: any) => {
          this.data = result;
          this._isSpinning = false;
        },
        result => {
          // this.data = result;
          this._isSpinning = false;
        }
      );
  }
  // Event method for getting all the data for the page
  getPageData() {
    this.warehouseVariantService
      .getAllWarehouseVariant(
        this.page,
        this.currentWarehouseId,
        this.limit,
        this.emailSearchValue || '',
        this.nameSearchValue || '',
        this.phoneSearchValue || '',
        this.genderSearchValue || '',
        this.categoryId ? this.categoryId : '',
        this.subcategoryId ? this.subcategoryId : '',
        this.filterTerm(this.sortValue.name),
        this.filterTerm(this.sortValue.price)
      )
      .subscribe(
        result => {
          this.data = result.data;
          this.total = result.total;
          this._isSpinning = false;
          console.log(result);
        },
        error => {
          this._isSpinning = false;
        }
      );
  }
  // Event method for setting up filter data
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
  // Event method for setting up filter data
  sort(sortName, sortValue) {
    this.page = 1;
    this.sortValue[sortName] = sortValue;
    this.getPageData();
  }
// Event method for resetting all filters
  resetAllFilter() {
    this.limit = 5;
    this.page = 1;
    this.nameSearchValue = '';
    this.sortValue = {
      name: null,
      price: null
    };
    this.categoryId = null;
    this.subcategoryId = null;
    this.subcategorySearchOptions = [];
    this.getPageData();
  }
  // Event method for pagination change
  changePage(page: number, limit: number) {
    this.page = page;
    this.limit = limit;
    this.getPageData();
    return false;
  }  
  // Event method for deleting warehouse variant
  deleteConfirm(id) {
    this.warehouseVariantService.delete(id).subscribe(result => {
      this._notification.create('warning', 'Delete', 'Product attribute has been removed successfully');
      this.getPageData();
    });
    
  }
}
