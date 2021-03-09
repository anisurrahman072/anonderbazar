import {Component, OnInit} from '@angular/core';
import {AuthService} from '../../../services/auth.service';
import {UIService} from "../../../services/ui/ui.service";
import {Subscription} from "rxjs";
import {SuborderService} from "../../../services/suborder.service";
import {distinctUntilChanged} from "rxjs/operators";

@Component({
    selector: 'app-home',
    templateUrl: './dashboard-home.component.html',
    styleUrls: ['./dashboard-home.component.css']
})
export class DashboardHomeComponent implements OnInit {
    currentUser: any;
    currentWarehouseSubscriprtion: Subscription;
    currentWarehouseId: any;
    data: any;
    _isSpinning: boolean = true;

    constructor(private authService: AuthService, private subOrderService: SuborderService, private uiService: UIService) {
    }

    // init the component
    ngOnInit() {
        this.currentUser = this.authService.getCurrentUser();

        this.currentWarehouseSubscriprtion = this.uiService.currentSelectedWarehouseInfo
            .pipe(
                distinctUntilChanged((prev, curr) => {
                    return prev == curr;
                })
            )
            .subscribe(
                warehouseId => {
                    this.currentWarehouseId = warehouseId || '';
                    this.getPageData();
                }
            );
    }

    //Event method for getting all the data for the page
    getPageData() {
        this._isSpinning = true;
        if (this.currentWarehouseId) {
            this.subOrderService
                .getSuborder(this.currentWarehouseId, 1, null)
                .subscribe(result => {
                    this.data = result;

                    this._isSpinning = false;
                }, (error) => {
                    console.log(error);
                    this._isSpinning = false;
                });
        } else {
            this.subOrderService
                .getSuborder(null, 1, null)
                .subscribe(result => {
                    this.data = result;

                    this._isSpinning = false;
                }, (error) => {
                    console.log(error);
                    this._isSpinning = false;
                });
        }

    }

}
