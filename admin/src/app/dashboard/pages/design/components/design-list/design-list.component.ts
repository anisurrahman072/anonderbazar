import {Component, OnDestroy, OnInit} from '@angular/core';
import {FormBuilder} from '@angular/forms';
import {Router} from '@angular/router';
import {AuthService} from '../../../../../services/auth.service';
import {DesignService} from '../../../../../services/design.service';
import {UIService} from '../../../../../services/ui/ui.service';
import {Subscription} from 'rxjs';
import {environment} from "../../../../../../environments/environment";
import {NzNotificationService} from "ng-zorro-antd";

@Component({
    selector: 'app-design-list',
    templateUrl: './design-list.component.html',
    styleUrls: ['./design-list.component.css']
})
export class DesignListComponent implements OnInit, OnDestroy {
    ngOnDestroy(): void {
        this.currentWarehouseSubscriprtion
            ? this.currentWarehouseSubscriprtion.unsubscribe()
            : '';
    }

    IMAGE_ENDPOINT = environment.IMAGE_ENDPOINT;
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

    currentUser: any;
    private currentWarehouseId: any;
    private currentWarehouseSubscriprtion: Subscription;
    loading: boolean = false;

    constructor(
        private fb: FormBuilder,
        private router: Router,
        private uiService: UIService,
        private _notification: NzNotificationService,
        private designService: DesignService,
        private uiservice: UIService,
        private authService: AuthService
    ) {
    }

    // init the component
    ngOnInit(): void {
        this.currentWarehouseSubscriprtion = this.uiService.currentSelectedWarehouseInfo.subscribe(
            warehouseId => {
                this.currentWarehouseId = warehouseId || '';
                this.getPageData();
            }
        );
        this.getPageData();
    }

    //Event method for getting all the data for the page
    getPageData() {
        this.loading = true;
        this.designService
            .getAllDesign(
                this.currentWarehouseId,
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
                    this._isSpinning = false;
                    this.loading = false;
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

    //Method for status change

    changePage(page: number, limit: number) {
        this.page = page;
        this.limit = limit;
        this.getPageData();
        return false;
    }

    subcategoryIdChange($event) {
        this.page = 1;
        this.getPageData();
    }

    subcategoryIdSearchChange($event) {
    }

    //Event method for deleting design
    deleteConfirm(id) {
        this.designService.delete(id).subscribe(result => {
            this._notification.create('warning', 'Delete', 'Design has been removed successfully');

            this.getPageData();
        });
    }
}
