import {Component, OnInit} from '@angular/core';
import {CategoryProductService} from '../../../../../services/category-product.service';
import {environment} from "../../../../../../environments/environment";
import {NzNotificationService} from "ng-zorro-antd";

@Component({
    selector: 'app-category-product',
    templateUrl: './category-product.component.html',
    styleUrls: ['./category-product.component.css']
})
export class CategoryProductComponent implements OnInit {
    _isSpinning = true;
    IMAGE_ENDPOINT = environment.IMAGE_ENDPOINT;
    IMAGE_THUMB_ENDPOINT = environment.IMAGE_THUMB_ENDPOINT;
    data = [];

    categoryId: any = null;
    subcategoryId: any = null;

    limit: number = 10;
    page: number = 1;
    total: number;
    nameSearchValue: string = '';
    codeSearchValue: string = '';
    sortValue = 'DESC';
    sortKey = 'child_count';

    subcategorySearchOptions: any;
    categorySearchOptions: any[] = [];
    loading;

    constructor(
        private categoryProductService: CategoryProductService,
        private _notification: NzNotificationService
    ) {
    }

    // init the component
    ngOnInit(): void {
        this.getPageData();
    }

    //Event method for getting all the data for the page
    getPageData() {
        this._isSpinning = true;
        this.categoryProductService
            .getAllWithSubcategory(
                this.page,
                this.limit,
                this.nameSearchValue,
                this.codeSearchValue,
                this.sortKey,
                this.sortValue
            )
            .subscribe(
                result => {
                    this.data = result.data;
                    this.total = result.total;
                    this._isSpinning = false;
                },
                error => {
                    console.log('error', error);
                    this._isSpinning = false;
                }
            );
    }

    //Event method for setting up filter data
    sort(sort: { key: string, value: string }) {
        console.log('sort', sort);
        this.page = 1;
        this.sortKey = sort.key;
        this.sortValue = CategoryProductComponent.filterTerm(sort.value);
        this.getPageData();
    }

    //Event method for setting up filter data
    private static filterTerm(sortValue: string): string {
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
        this.sortKey = 'child_count';
        this.sortValue = 'DESC';
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

    //Event method for deleting brands
    deleteConfirm(id) {
        this.categoryProductService.delete(id).subscribe(result => {
            this._notification.create('warning', 'Delete', 'Product category has been removed successfully');
            this.getPageData();
        });
    }

    //Event method for getting subcategory
    getSubCategory(isExpand, category) {
        if (isExpand) {
            category['loading'] = true;
            this.categoryProductService.getSubcategoryByCategoryId(category.id).subscribe((result: any) => {
                category['subCategories'] = result;
                category['loading'] = false;
            });
        }
    }
}
