import {Component, OnInit} from '@angular/core';
import {OfferService, ProductService} from "../../../services";
import {Observable} from "rxjs/Observable";
import {Offer} from "../../../models";
import {Store} from "@ngrx/store";
import * as fromStore from "../../../state-management";

@Component({
    selector: 'app-top-sell',
    templateUrl: './top-sell.component.html',
    styleUrls: ['./top-sell.component.scss']
})
export class TopSellComponent implements OnInit {

    topSellProducts: any;
    page: any;

    /**offer related variables*/
    offer$: Observable<Offer>;
    offerData: Offer;
    calculationType;
    discountAmount;
    originalPrice;

    constructor(private productService: ProductService,
                private offerService: OfferService,
                private store: Store<fromStore.HomeState>
    ) {
    }

    ngOnInit() {
        this.offer$ = this.store.select<any>(fromStore.getOffer);
        this.offer$.subscribe(offerData => {
            this.offerData = offerData;
        })

        this.productService.getTopSellProducts().subscribe(arg => {
            this.topSellProducts = arg.data;

            /** finding out the products exists in the offer store*/
            this.topSellProducts.forEach(product => {
                if (this.offerData && this.offerData.finalCollectionOfProducts && product.id in this.offerData.finalCollectionOfProducts) {
                    this.calculationType = this.offerData.finalCollectionOfProducts[product.id].calculation_type;
                    this.discountAmount = this.offerData.finalCollectionOfProducts[product.id].discount_amount;
                    this.originalPrice = product.price;

                    product.offerPrice = this.offerService.calculateOfferPrice(this.calculationType, this.originalPrice, this.discountAmount);

                    product.calculationType = this.calculationType;
                    product.discountAmount = this.discountAmount;
                }
            })
        });
    }

}
