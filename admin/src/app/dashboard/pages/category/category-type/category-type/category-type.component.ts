import {Component, OnInit} from '@angular/core';
import {CategoryTypeService} from '../../../../../services/category-type.service';
import {environment} from "../../../../../../environments/environment";
import {NzNotificationService} from 'ng-zorro-antd';

@Component({
    selector: 'app-category-type',
    templateUrl: './category-type.component.html',
    styleUrls: ['./category-type.component.css']
})
export class CategoryTypeComponent implements OnInit {
    data = [];
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
    _isSpinning = true;

    subcategorySearchOptions: any;
    categorySearchOptions: any[] = [];
    loading: boolean = false;

    constructor(
        private categoryTypeService: CategoryTypeService,
        private _notification: NzNotificationService
    ) {
    }

    ngOnInit(): void {
        this.getPageData();
    }

    getPageData() {
        this.loading = true;
        this.categoryTypeService
            .getAllCategories(
                this.page,
                this.limit,
                this.nameSearchValue,
                this.categoryId ? this.categoryId : '',
                this.subcategoryId ? this.subcategoryId : '',
                this.filterTerm(this.sortValue.name),
                this.filterTerm(this.sortValue.price)
            )
            .subscribe(
                (result: any) => {
                    this.loading = false;
                    this.data = result.data;
                    this.total = result.total;
                    this._isSpinning = false;
                },
                error => {
                    this._isSpinning = false;
                    this.loading = false;
                }
            );
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

    sort(sort: { key: string, value: string }) {
        this.page = 1;
        this.sortValue[sort.key] = sort.value;
        this.getPageData();
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

    changePage(page: number, limit: number) {
        this.page = page;
        this.limit = limit;
        this.getPageData();
        return false;
    }

    deleteConfirm(id) {
        this.categoryTypeService.delete(id).subscribe(result => {
            this._notification.create('warning', 'Delete', 'Product type has been removed successfully');
            this.getPageData();
        });
    }
}
