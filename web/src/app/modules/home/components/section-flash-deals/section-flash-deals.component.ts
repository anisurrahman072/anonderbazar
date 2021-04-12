import {Component, Input, OnInit} from '@angular/core';
import {Observable} from "rxjs/Observable";
import {Product} from '../../../../models';
import {ProductService} from "../../../../services";

@Component({
    selector: 'app-flash-deals',
    templateUrl: './section-flash-deals.component.html',
    styleUrls: ['./section-flash-deals.component.scss']
})
export class FlashDealsComponent implements OnInit {
    @Input() private dataProductList: any;

    productList: Product[] = [];

    constructor() {
    }

    //Event method for getting all the data for the page
    ngOnInit() {
        this.productList = this.dataProductList;
    }

}
