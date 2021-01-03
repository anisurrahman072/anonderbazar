import {Component, OnInit} from '@angular/core';
import {WarehouseService} from '../../../../services/warehouse.service';

import {environment} from "../../../../../environments/environment";
import { NzNotificationService } from 'ng-zorro-antd';

@Component({
    selector: 'app-warehouse',
    templateUrl: './warehouse.component.html',
    styleUrls: ['./warehouse.component.css']
})
export class WarehouseComponent implements OnInit {
    data = [];
    _isSpinning = true;
    IMAGE_ENDPOINT = environment.IMAGE_ENDPOINT;
    limit: number = 10;
    page: number = 1;
    total: number;

    constructor(private warehouseService: WarehouseService,
        private _notification: NzNotificationService) {
    }
     // init the component
    ngOnInit(): void {
        this.getAllData();
    }
      //Event method for getting all the data for the page
    getAllData() {
        
        this.warehouseService.getAllIndex(
            this.page,
            this.limit
        )
            .subscribe(result => {
                    this.data = result.data; 
                    this.total = result.total; 
                    console.log(this.data); 
                    this._isSpinning = false;
                },
                result => { 
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
            this.warehouseService.update(id, {status: 2}).subscribe(result => {
                this._notification.create(
                    'success',
                    'Status change is declined',
                    ''
                );
                this.getAllData();
            })
        } else if (status == 2) {
            this.warehouseService.update(id, {status: 3}).subscribe(result => {
                this._notification.create(
                    'success',
                    'Status change is successfully.',
                    ''
                );
                this.getAllData();
            })
        }
    }
}
