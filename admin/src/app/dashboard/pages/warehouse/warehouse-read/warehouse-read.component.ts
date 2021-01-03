import {Component, OnDestroy, OnInit} from '@angular/core';
import {Subscription} from 'rxjs';
import {NzNotificationService} from 'ng-zorro-antd';
import {ActivatedRoute} from '@angular/router';
import {WarehouseService} from '../../../../services/warehouse.service';

import {environment} from "../../../../../environments/environment";

@Component({
    selector: 'app-warehouse-read',
    templateUrl: './warehouse-read.component.html',
    styleUrls: ['./warehouse-read.component.css']
})
export class WarehouseReadComponent implements OnInit, OnDestroy {
    sub: Subscription;
    id: number;
    data: any;
    products:any=[];
    IMAGE_ENDPOINT = environment.IMAGE_ENDPOINT;
    _isSpinning = true;
    img: any;

    constructor(private route: ActivatedRoute,
                private _notification: NzNotificationService,
                private warehouseService: WarehouseService) {
    }
 // init the component
    ngOnInit() {
        this.sub = this.route.params.subscribe(params => {
            this.id = +params['id']; // (+) converts string 'id' to a number
            this.warehouseService.getById(this.id)
                .subscribe(result => {
                    setTimeout(() => {
                        this._isSpinning = false;
                        this.data = result;
                    }, 100);
                    console.log(result);

                });

            this.warehouseService.getallproductbywarehouseid(this.id).subscribe(result=>{
                this.products = result;
            });
        });

    }

    ngOnDestroy(): void {
        this.sub ? this.sub.unsubscribe() : '';
    
    }

}
