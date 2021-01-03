import {Component, Directive, Input, OnInit} from '@angular/core';
import {AppSettings} from "../../../../config/app.config";
import {Router} from "@angular/router";
import {FavouriteProduct, Product} from "../../../../models/index";
import * as fromStore from "../../../../state-management/index";
import {Store} from "@ngrx/store";
import {Observable} from "rxjs/Observable";
import {WOW} from "ngx-wow/services/wow.service";
import {AuthService, CartItemService, FavouriteProductService} from "../../../../services";
import {catchError, map} from "rxjs/operators";
import * as cartActions from "../../../../state-management/actions/cart.action";
import {of} from "rxjs/observable/of";
import {NotificationsService} from "angular2-notifications";
import {LoginModalService} from "../../../../services/ui/loginModal.service";
import {CompareService} from "../../../../services/compare.service";
import {NgProgress} from "@ngx-progressbar/core";
import {ToastrService} from "ngx-toastr";


@Component({
    selector: 'app-category-item',
    templateUrl: './category-item.component.html',
    styleUrls: ['./category-item.component.scss']
})
//This is a child component for category component
//Included in category component view
export class CategoryItemComponent implements OnInit {
    IMAGE_ENDPOINT = AppSettings.IMAGE_ENDPOINT;
    @Input() dataCategory;
    category: any;
    isDisplay: boolean;
    /*
    * constructor for CategoryItemComponent
    */
    constructor(private _notify: NotificationsService,
                public _progress: NgProgress) {
                    this.isDisplay = false;
    }

    //init the component
    ngOnInit() { 
        this.category = this.dataCategory;
    }
    // Method called in error
    erroralert() {
        this._notify.error('compare list is full, delete first!!!');
    }
}
