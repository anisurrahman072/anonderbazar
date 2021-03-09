import {Component, OnDestroy, OnInit} from '@angular/core';
import {BrandService} from '../../../../services/brand.service';
import {AuthService} from '../../../../services/auth.service';
import {Subscription} from 'rxjs';
import {UIService} from '../../../../services/ui/ui.service';
import {environment} from "../../../../../environments/environment";
import {NzNotificationService} from "ng-zorro-antd";
import {distinctUntilChanged} from "rxjs/operators";

@Component({
    selector: 'app-brand',
    templateUrl: './brand.component.html',
    styleUrls: ['./brand.component.css']
})
export class BrandComponent implements OnInit, OnDestroy {
    ngOnDestroy(): void {
        this.currentWarehouseSubscriprtion
            ? this.currentWarehouseSubscriprtion.unsubscribe()
            : '';
    }

    data = [];
    _isSpinning = true;
    IMAGE_ENDPOINT = environment.IMAGE_ENDPOINT;
    currentUser: any;

    limit: number = 10;
    page: number = 1;
    total: number;
    nameSearchValue: string = '';
    loading: boolean = false;


    sortValue = {
        name: null,
        code: null,
        slug: null
    };
    private currentWarehouseSubscriprtion: Subscription;
    private currentWarehouseId: any;

    constructor(
        private brandService: BrandService,
        private uiService: UIService,
        private _notification: NzNotificationService,
        private authService: AuthService
    ) {
    }

    // init the component
    ngOnInit(): void {
        this.currentUser = this.authService.getCurrentUser();

        this.currentWarehouseSubscriprtion = this.uiService.currentSelectedWarehouseInfo
            .pipe(
                distinctUntilChanged((prev, curr) => {
                    return prev == curr;
                })
            ).subscribe(
                warehouseId => {
                    this.currentWarehouseId = warehouseId || '';
                    this.getAllData();
                }
            );
    }

    //Event method for getting all the data for the page
    getAllData() {
        this.loading = true;
        this.brandService
            .getAllBrands(
                this.page,
                this.limit,
                this.nameSearchValue,
                this.currentWarehouseId,
                this.filterTerm(this.sortValue.name),
                this.filterTerm(this.sortValue.code),
                this.filterTerm(this.sortValue.slug)
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
        this.getAllData();
    }

    //Event method for pagination change
    changePage(page: number, limit: number) {
        this.page = page;
        this.limit = limit;
        this.getAllData();
        return false;
    }

    //Event method for resetting all filters
    resetAllFilter() {
        this.limit = 5;
        this.page = 1;
        this.nameSearchValue = '';
        this.sortValue = {
            name: null,
            code: null,
            slug: null
        };
        this.getAllData();
    }

    //Event method for deleting brands
    deleteConfirm(id) {
        this.brandService.delete(id).subscribe(
            result => {
                this._notification.create('warning', 'Delete', 'Brand has been removed successfully');
                this.getAllData();
            },
            error => {
                this._notification.create('error', 'Delete', 'Something went wrong');
            }
        );
    }
}
