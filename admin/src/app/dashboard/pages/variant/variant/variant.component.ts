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

  sortValue = '';
  sortKey = '';

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
  getPageData(event?: any) {
    if (event) {
      this.page = event;
    }

    this._isSpinning = true;
    this.variantService
        .getAllvariant(
            this.page,
            this.limit,
            this.nameSearchValue || '',
            this.sortKey,
            this.filterTerm(this.sortValue),
        )
        .subscribe(
            result => {
              this.loading = false;

              this.data = result.data;

              this.total = result.total;

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
    this.sortKey = sort.key;
    this.sortValue = sort.value;
    this.getPageData();
  }

  //Event method for resetting all filters
  resetAllFilter() {
    this.limit = 5;
    this.page = 1;
    this.nameSearchValue = '';
    this.sortKey = '';
    this.sortValue = '';
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
