import { Component, OnInit } from '@angular/core';
import { CategoryProductService } from '../../../../../services/category-product.service';

import { DesignCategoryService } from '../../../../../services/design-category.service';
import { NzNotificationService } from 'ng-zorro-antd';
import { ActivatedRoute, Router } from '@angular/router';
import {environment} from "../../../../../../environments/environment";

@Component({
  selector: 'app-design-category',
  templateUrl: './design-category.component.html',
  styleUrls: ['./design-category.component.css']
})
export class DesignCategoryComponent implements OnInit {
  data = [];
  _isSpinning = true;
  IMAGE_ENDPOINT = environment.IMAGE_ENDPOINT;

  limit: number = 10;
  page: number = 1;
  total: number;
  nameSearchValue: string = '';

  sortValue = {
    name: null,
    price: null
  };
  categoryId: any = null;
  subcategoryId: any = null;

  subcategorySearchOptions: any;
  categorySearchOptions: any[] = [];

  constructor(
    private router: Router,
    private route: ActivatedRoute,
    private _notification: NzNotificationService,
    private designcategoryService: DesignCategoryService
  ) {}
 // init the component
  ngOnInit(): void {
    this.getPageData();
  }
  //Event method for getting all the data for the page
  getPageData() {
    this.designcategoryService
      .getAlldesigncategories(
        this.page,
        this.limit,
        this.nameSearchValue || '',
        this.categoryId ? this.categoryId : '',
        this.subcategoryId ? this.subcategoryId : '',
        this.filterTerm(this.sortValue.name)
      )
      .subscribe(
        result => {
          this.data = result.data;
          this.total = result.total;
          this._isSpinning = false;
        },
        error => {
          this._isSpinning = false;
        }
      );
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
  //Event method for setting up filter data
  sort(sortName, sortValue) {
    this.page = 1;
    this.sortValue[sortName] = sortValue;
    this.getPageData();
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
    this.categoryId = null;
    this.subcategoryId = null;
    this.subcategorySearchOptions = [];
    this.getPageData();
  }
  //Event method for pagination change
  changePage(page: number, limit: number) {
    this.page = page;
    this.limit = limit;
    this.getPageData();
    return false;
  }
  //Method for subcategory

  subcategoryIdChange($event) {
    this.page = 1;
    this.getPageData();
  }

  subcategoryIdSearchChange($event) {}
  //Event method for deleting category
  deleteConfirm(id) {
    this.designcategoryService.delete(id).subscribe(result => {
      this._notification.create('warning', 'delete', 'Design category has been removed successfully');
      this.getPageData();
    });
  }
}
