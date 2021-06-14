import {Component, OnInit} from '@angular/core';
import {AppSettings} from "../../../../config/app.config";
import {ProductService} from '../../../../services';

@Component({
    selector: 'app-section-feedback',
    templateUrl: './section-feedback.component.html',
    styleUrls: ['./section-feedback.component.scss']
})
export class FeedbackComponent implements OnInit {
    topSellProducts: any;
    newProducts: any;
    IMAGE_ENDPOINT = AppSettings.IMAGE_ENDPOINT;

    constructor(private productService: ProductService) {
    }

    ngOnInit() {
        this.productService.getTopSellProducts().subscribe(arg => {
            this.topSellProducts = arg.data.slice(0, 4);
        });
        this.productService.getNewProducts().subscribe(arg => {
            this.newProducts = arg.data;
        });
    }

}
