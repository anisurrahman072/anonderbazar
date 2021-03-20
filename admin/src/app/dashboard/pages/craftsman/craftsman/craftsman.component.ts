///<reference path="../../../../services/user.service.ts"/>
import {Component, OnDestroy, OnInit} from '@angular/core';
import {CraftsmanService} from '../../../../services/craftsman.service';

import {AuthService} from '../../../../services/auth.service';
import {UserService} from '../../../../services/user.service';
import {UIService} from '../../../../services/ui/ui.service';
import {environment} from "../../../../../environments/environment";

@Component({
    selector: 'app-craftsman',
    templateUrl: './craftsman.component.html',
    styleUrls: ['./craftsman.component.css']
})
export class CraftsmanComponent implements OnInit, OnDestroy {
    private currentWarehouseId: any | string;

    ngOnDestroy(): void {
        this.currentWarehouseSubscriprtion
            ? this.currentWarehouseSubscriprtion.unsubscribe()
            : '';
    }

    data = [];
    _isSpinning = true;
    IMAGE_ENDPOINT = environment.IMAGE_ENDPOINT;
    currentUser: any;
    private currentWarehouseSubscriprtion: any;

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
    loading: boolean = false;

    constructor(
        private userService: UserService,
        private uiService: UIService,
        private craftsmanService: CraftsmanService,
        private authService: AuthService
    ) {
    }

    // init the component
    ngOnInit(): void {
        this.currentUser = this.authService.getCurrentUser();

        this.currentWarehouseSubscriprtion = this.uiService.currentSelectedWarehouseInfo.subscribe(
            warehouseId => {
                this.currentWarehouseId = warehouseId || '';
                this.getPageData();
            }
        );
    }

    //Event method for deleting craftsman
    deleteConfirm(id) {
        this.userService.delete(id).subscribe(result => {
        });
    }

    //Event method for getting all the data for the page
    getPageData() {
        this.loading = true;
        this.craftsmanService
            .getAllCraftsman(
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
        this.emailSearchValue = '';
        this.phoneSearchValue = '';
        this.genderSearchValue = null;
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

    subcategoryIdChange($event) {
        this.page = 1;
        this.getPageData();
    }

    subcategoryIdSearchChange($event) {
    }
}
