import {Component, Input, OnInit} from '@angular/core';
import {Observable} from "rxjs/Observable";
import {Offer} from "../../../../models";
import {OfferService, ProductService} from "../../../../services";
import {Store} from "@ngrx/store";
import * as fromStore from "../../../../state-management";

@Component({
    selector: 'app-related-product',
    templateUrl: './related-product.component.html',
    styleUrls: ['./related-product.component.scss']
})
export class RelatedProductComponent implements OnInit {
    /*@Input() products: any;*/
    @Input() categoryId: any;
    @Input() subCategoryId: any;
    products: any;

    /**for offer*/
    offer$: Observable<Offer>;
    offerData: Offer;
    calculationType;
    discountAmount;
    originalPrice;

    constructor(
        private offerService: OfferService,
        private store: Store<fromStore.HomeState>,
        private productService: ProductService,
    ) {
    }

    ngOnInit() {
        this.offer$ = this.store.select<any>(fromStore.getOffer);
        this.offer$.subscribe(offerData => {
            this.offerData = offerData;
        })

        this.productService.getByCategory(this.categoryId, this.subCategoryId)
            .subscribe(relatedProduct => {
                this.products = relatedProduct;

                if (this.products) {
                    this.products.forEach(product => {
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
                console.log('similar products error: ', error);
            });
    }
}
