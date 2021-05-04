import {Component, OnInit} from '@angular/core';
import {WarehouseService} from '../../../../services/warehouse.service';
import {UIService} from "../../../../services/ui/ui.service";
import {environment} from "../../../../../environments/environment";
import {NzNotificationService} from "ng-zorro-antd";
import {distinctUntilChanged} from 'rxjs/operators';

@Component({
    selector: 'app-warehouse',
    templateUrl: './warehouse.component.html',
    styleUrls: ['./warehouse.component.css']
})
export class WarehouseComponent implements OnInit {
    data = [];
    _isSpinning = true;
    IMAGE_ENDPOINT = environment.IMAGE_ENDPOINT;
    IMAGE_THUMB_ENDPOINT = environment.IMAGE_THUMB_ENDPOINT;
    limit: number = 10;
    page: number = 1;
    total: number;
    private currentWarehouseSubscriprtion: any;
    private currentWarehouseId: any | string;
    loading: boolean = false;
    warehouseName: string = '';

    constructor(private warehouseService: WarehouseService,
                private _notification: NzNotificationService,
                private uiService: UIService) {
    }

    // init the component
    ngOnInit(): void {
        this.currentWarehouseSubscriprtion = this.uiService.currentSelectedWarehouseInfo
            .pipe(
                distinctUntilChanged((prev, curr) => {
                    return prev == curr;
                })
            ).subscribe(
                warehouseId => {
                    this.currentWarehouseId = warehouseId || '';
                    console.log('his.currentWarehouseId', warehouseId);
                    this.getAllData();
                }
            );
    }

    //Event method for getting all the data for the page
    getAllData() {
        this.loading = true;
        this._isSpinning = true;
        this.warehouseService.getAllIndex(
            this.page,
            this.limit,
            this.currentWarehouseId,
            this.warehouseName
        )
            .subscribe(result => {
                    console.log('result.data', result.data);
                    this.data = result.data;
                    this.loading = false;
                    this.total = result.total;
                    this._isSpinning = false;
                },
                result => {
                    this.loading = false;
                    this._isSpinning = false;
                });
    }

    //Event method for pagination change
    changePage(page: number, limit: number) {
        this.page = page;
        this.limit = limit;
        this.getAllData();
        return false;
    }

    //Event method for deleting warehouse
    deleteConfirm(id) {
        this.warehouseService.delete(id)
            .subscribe(result => {
                this._notification.create(
                    'success',
                    'Shop has been removed successfully.',
                    result.name
                );
                this.getAllData();
            });
    }


    //Method for status change

    changeStatus(id: any, status: any) {
        if (status != 2) {
            this.warehouseService.updateUserStatus(id, {status: 2}).subscribe(result => {
                this._notification.create(
                    'success',
                    'Status change is successfully.',
                    ''
                );
                this.getAllData();
            })
        } else if (status == 2) {
            this.warehouseService.updateUserStatus(id, {status: 3}).subscribe(result => {
                this._notification.create(
                    'success',
                    'Status change is declined',
                    ''
                );
                this.getAllData();
            })
        }
    }
}
