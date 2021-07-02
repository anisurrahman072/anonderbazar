import {Component, OnInit} from '@angular/core';
import {OfferService, ProductService} from "../../../services";
import {Title} from "@angular/platform-browser";
import {Observable} from "rxjs/Observable";
import {Offer} from "../../../models";
import {Store} from "@ngrx/store";
import * as fromStore from "../../../state-management";

@Component({
    selector: 'app-featured-product',
    templateUrl: './featured-product.component.html',
    styleUrls: ['./featured-product.component.scss'],
})
export class FeaturedProductComponent implements OnInit {

    productList: any;

    /**for offer*/
    offer$: Observable<Offer>;
    offerData: Offer;
    calculationType;
    discountAmount;
    originalPrice;

    constructor(
        private productService: ProductService,
        private title: Title,
        private offerService: OfferService,
        private store: Store<fromStore.HomeState>
    ) {
    }

    ngOnInit() {
        this.addPageTitle();

        this.offer$ = this.store.select<any>(fromStore.getOffer);
        this.offer$.subscribe(offerData => {
            this.offerData = offerData;
        })

        this.productService.getFlashDealsProducts()
            .subscribe(data => {
                this.productList = data.filter(product => {
                    return product.warehouse_id.status == 2;
                })

                if (this.productList) {
                    this.productList.forEach(product => {
                        if (this.offerData && this.offerData.finalCollectionOfProducts && product.id in this.offerData.finalCollectionOfProducts) {
                            this.calculationType = this.offerData.finalCollectionOfProducts[product.id].calculation_type;
                            this.discountAmount = this.offerData.finalCollectionOfProducts[product.id].discount_amount;
                            this.originalPrice = product.price;

                            product.offerPrice = this.offerService.calculateOfferPrice(this.calculationType, this.originalPrice, this.discountAmount);

                            product.calculationType = this.calculationType;
                            product.discountAmount = this.discountAmount;
                        }
                    })
                }

            }, error => {
                console.log("Error occurred!", error);
            })
    }

    private addPageTitle() {
        this.title.setTitle('Featured Products - Anonderbazar');
    }

}
