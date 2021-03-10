import {Component, OnDestroy, OnInit} from '@angular/core';
import {UserService} from "../../../../services/user.service";
import {UIService} from "../../../../services/ui/ui.service";
import {AuthService} from "../../../../services/auth.service";
import {environment} from "../../../../../environments/environment";

@Component({
    selector: 'app-user',
    templateUrl: './user.component.html',
    styleUrls: ['./user.component.css']
})
export class UserComponent implements OnInit, OnDestroy {
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

    limit: number = 20;
    page: number = 1;
    total: number;
    nameSearchValue: string = '';
    emailSearchValue: string = '';
    phoneSearchValue: string = '';
    usernameSearchValue: string = '';

    sortKey: string = '';
    sortValue: string = '';

    subcategorySearchOptions: any;
    categorySearchOptions: any[] = [];
    loading: boolean = false;

    constructor(
        private userService: UserService,
        private uiService: UIService,
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

    //Event method for deleting user
    deleteConfirm(id) {
        this.userService.delete(id).subscribe(result => {
        });
    }

    //Event method for getting all the data for the page
    getPageData(event?: any) {
        if (event) {
            this.page = event;
        }
        this._isSpinning = true;
        this.userService
            .getAllShopOwner(
                this.page,
                this.currentWarehouseId,
                this.limit,
                this.emailSearchValue || '',
                this.nameSearchValue || '',
                this.phoneSearchValue || '',
                this.usernameSearchValue || '',
                this.sortKey,
                this.filterTerm(this.sortValue)
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
        this.emailSearchValue = '';
        this.phoneSearchValue = '';
        this.usernameSearchValue = null;
        this.sortKey = ""
        this.sortValue = ""
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

    //Method for subcategory id change
    subcategoryIdChange($event) {
        this.page = 1;
        this.getPageData();
    }

    subcategoryIdSearchChange($event) {
    }
}
