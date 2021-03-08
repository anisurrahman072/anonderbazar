import {Component, OnInit} from '@angular/core';
import {VariantService} from '../../../../services/variant.service';
import {NzNotificationService} from "ng-zorro-antd";

@Component({
  selector: 'app-variant',
  templateUrl: './variant.component.html',
  styleUrls: ['./variant.component.css']
})
export class VariantComponent implements OnInit {
  data = [];
  _isSpinning = true;

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
  loading: boolean = false;

  constructor(
      private variantService: VariantService,
      private _notification: NzNotificationService) {
  }

  // init the component
  ngOnInit(): void {
    this.getPageData();
  }

  //Event method for getting all the data for the page
  getPageData() {
    this.loading = true;
    this.variantService
        .getAllvariant(
            this.page,
            this.limit,
            this.nameSearchValue || '',
            this.categoryId ? this.categoryId : '',
            this.subcategoryId ? this.subcategoryId : '',
            this.filterTerm(this.sortValue.name)
        )
        .subscribe(
            result => {
              this.loading = false;
              this.data = result.data;
              this.total = result.total;
              console.log(result);
              this._isSpinning = false;
            },
            error => {
              this.loading = false;
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
  sort(sort: { key: string, value: string }) {
    this.page = 1;
    this.sortValue[sort.key] = sort.value;
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

  //Event method for deleting variant
  deleteConfirm(id) {
    this.variantService.delete(id).subscribe(result => {
      this._notification.create('warning', 'Delete', 'Product attribute has been removed successfully');
      this.getPageData();
    });

  }
}
