import {Component, Input, OnInit} from '@angular/core';
import {Observable} from "rxjs/Observable";
import {Offer, Product} from '../../../../models';
import {OfferService, ProductService} from "../../../../services";

@Component({
    selector: 'app-flash-deals',
    templateUrl: './section-flash-deals.component.html',
    styleUrls: ['./section-flash-deals.component.scss']
})
export class FlashDealsComponent implements OnInit {
    @Input() dataProductList;
    @Input() offerData: Offer;

    constructor(private offerService: OfferService) {
    }

    //Event method for getting all the data for the page
    ngOnInit() {
        this.dataProductList.forEach(product => {
            if (this.offerData && this.offerData.finalCollectionOfProducts && product.id in this.offerData.finalCollectionOfProducts) {
                const calculationType = this.offerData.finalCollectionOfProducts[product.id].calculation_type;
                const discountAmount = this.offerData.finalCollectionOfProducts[product.id].discount_amount;
                const originalPrice = product.price;

                product.offerPrice = this.offerService.calculateOfferPrice(calculationType, originalPrice, discountAmount);

                product.calculationType = calculationType;
                product.discountAmount = discountAmount;
            }
        })
    }

}
