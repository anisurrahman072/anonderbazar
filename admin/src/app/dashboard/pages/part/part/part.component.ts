import { Component, OnInit } from '@angular/core';
import { AuthService } from '../../../../services/auth.service';
import { PartService } from '../../../../services/part.service';
import { CategoryProductService } from '../../../../services/category-product.service';
import {environment} from "../../../../../environments/environment";
import {NzNotificationService} from "ng-zorro-antd";

@Component({
  selector: 'app-part',
  templateUrl: './part.component.html',
  styleUrls: ['./part.component.css']
})
export class PartComponent implements OnInit {
  data = [];
  _isSpinning = true;
  IMAGE_ENDPOINT = environment.IMAGE_ENDPOINT;
  currentUser: any;

  limit: number = 10;
  page: number = 1;
  total: number;

  loading = true;

  nameSearchValue: string = '';
  sortValue = {
    name: null,
    price: null
  };
  typeId: any = null;
  categoryId: any = null;
  subcategoryId: any = null;
  subcategorySearchOptions: any;
  categorySearchOptions: any[] = [];
  typeSearchOptions: any[] = [];
  category_item = [];

  editMode: boolean = false;

  constructor(
      private partService: PartService,
      private categoryProductService: CategoryProductService,
      private _notification: NzNotificationService,
      private authService: AuthService
  ) {}

  ngOnInit(): void {
    this.currentUser = this.authService.getCurrentUser();
    this.getPageData();
  }

  getPageData() {
    this.loading = true;
    this.partService
        .getAllParts(
            this.page,
            this.limit,
            this.nameSearchValue,
            this.typeId || '',
            this.categoryId || '',
            this.subcategoryId || '',
            this.filterTerm(this.sortValue.name),
            this.filterTerm(this.sortValue.price)
        )
        .subscribe(
            result => {
              this.loading = false;
              this.data = result.data;
              this.total = result.total;
              this._isSpinning = false;
            },
            result => {
              this.loading = false;
              this._isSpinning = false;
            }
        );

    this.categoryProductService.getAllCategory().subscribe((result: any) => {
      this.categorySearchOptions = result;
    });

    this.categoryProductService.getAllType().subscribe((result: any) => {
      this.typeSearchOptions = result;
    });
  }

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
  sort(sort: { key: string, value: string }) {
    this.page = 1;
    this.sortValue[sort.key] = sort.value;
    this.getPageData();
  }

  changePage(page: number, limit: number) {
    this.page = page;
    this.limit = limit;
    this.getPageData();
    return false;
  }

  categoryIdChange($event) {
    this.page = 1;
    const query = encodeURI($event);

    this.subcategorySearchOptions = [];
    this.subcategoryId = null;
    this.getPageData();

    if (query !== 'null') {
      this.categoryProductService
          .getSubcategoryByCategoryId(query)
          .subscribe(result => {
            this.subcategorySearchOptions = result;
          });
    }
  }

  typeIdChange($event) {
    this.page = 1;
    this.getPageData();
  }

  categoryIdSearchChange($event) {}

  subcategoryIdChange($event) {
    this.page = 1;
    this.getPageData();
  }

  subcategoryIdSearchChange($event) {}

  deleteConfirm(id) {
    this.partService.delete(id).subscribe(result => {
      this._notification.create('warning', 'Delete', 'Product part has been removed successfully');
      this.getPageData();
    });
  }

  editModeOn() {
    this.editMode = true;
    console.log(this.editMode);
  }
}
