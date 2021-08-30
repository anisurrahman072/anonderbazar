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
    @Input() offerData: Offer;
    topSellProducts: any;
    newProducts: any;
    IMAGE_ENDPOINT = AppSettings.IMAGE_ENDPOINT;

    constructor(private productService: ProductService,
                private offerService: OfferService) {
    }

    ngOnInit() {
        this.productService.getTopSellProducts('homepage').subscribe(arg => {
            console.log('hompage top sel: ', arg.data);
            /*this is in the homepage*/
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
            const calculationType = this.offerData.finalCollectionOfProducts[product.id].calculation_type;
            const discountAmount = this.offerData.finalCollectionOfProducts[product.id].discount_amount;
            const originalPrice = product.price;

            product.offerPrice = this.offerService.calculateOfferPrice(calculationType, originalPrice, discountAmount);

            product.calculationType = calculationType;
            product.discountAmount = discountAmount;
        }
    }

}
