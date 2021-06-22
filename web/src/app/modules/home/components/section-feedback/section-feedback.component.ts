import {Component, Input, OnInit} from '@angular/core';
import {AppSettings} from "../../../../config/app.config";
import {OfferService, ProductService} from '../../../../services';
import {Offer} from "../../../../models";

@Component({
    selector: 'app-section-feedback',
    templateUrl: './section-feedback.component.html',
    styleUrls: ['./section-feedback.component.scss']
})
export class FeedbackComponent implements OnInit {
    @Input('offerData') offerData: Offer;
    topSellProducts: any;
    newProducts: any;
    IMAGE_ENDPOINT = AppSettings.IMAGE_ENDPOINT;

    /*for offer*/
    calculationType;
    discountAmount;
    originalPrice;

    constructor(private productService: ProductService,
                private offerService: OfferService) {
    }

    ngOnInit() {
        this.productService.getTopSellProducts().subscribe(arg => {
            this.topSellProducts = arg.data.slice(0, 4);

            /** finding out the products exists in the offer store*/
            this.topSellProducts.forEach(product => {
                this.setOfferDataToProduct(product);
            })
        });

        this.productService.getNewProducts().subscribe(arg => {
            this.newProducts = arg.data;

            /** finding out the products exists in the offer store*/
            this.newProducts.forEach(product => {
                this.setOfferDataToProduct(product);
            })
        });
    }

    /**Method for setting offer data to the offered products*/
    setOfferDataToProduct(product) {
        if (this.offerData && this.offerData.finalCollectionOfProducts && product.id in this.offerData.finalCollectionOfProducts) {
            this.calculationType = this.offerData.finalCollectionOfProducts[product.id].calculation_type;
            this.discountAmount = this.offerData.finalCollectionOfProducts[product.id].discount_amount;
            this.originalPrice = product.price;

            product.offerPrice = this.offerService.calculateOfferPrice(this.calculationType, this.originalPrice, this.discountAmount);

            product.calculationType = this.calculationType;
            product.discountAmount = this.discountAmount;
        }
    }

}
