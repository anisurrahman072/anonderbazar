import {Component, OnInit} from '@angular/core';
import {DesignCategoryService} from '../../../../../services/design-category.service';
import {ActivatedRoute, Router} from '@angular/router';
import {environment} from "../../../../../../environments/environment";
import {NzNotificationService} from "ng-zorro-antd";

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
    loading: boolean = false;

    constructor(
        private router: Router,
        private route: ActivatedRoute,
        private _notification: NzNotificationService,
        private designcategoryService: DesignCategoryService
    ) {
    }

    // init the component
    ngOnInit(): void {
        this.getPageData();
    }

    //Event method for getting all the data for the page
    getPageData() {
        this.loading = true;
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

    //Method for subcategory

    subcategoryIdChange($event) {
        this.page = 1;
        this.getPageData();
    }

    subcategoryIdSearchChange($event) {
    }

    //Event method for deleting category
    deleteConfirm(id) {
        this.designcategoryService.delete(id).subscribe(result => {
            this._notification.create('warning', 'delete', 'Design category has been removed successfully');
            this.getPageData();
        });
    }
}
