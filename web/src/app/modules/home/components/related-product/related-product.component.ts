import {Component, Input, OnInit} from '@angular/core';
import {Observable} from "rxjs/Observable";
import {Offer} from "../../../../models";
import {OfferService, ProductService} from "../../../../services";
import {Store} from "@ngrx/store";
import * as fromStore from "../../../../state-management";
import {PAGINATION} from "../../../../../environments/global_config";

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
    public productPerPage: number = PAGINATION.PRODUCT_PER_PAGE_IN_DETAILS;
    public productTotal: number = 0;
    public page: number = 1;

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

        this.productService.getByCategory(this.categoryId, this.subCategoryId, this.productPerPage, this.page)
            .subscribe(relatedProduct => {
                this.productTotal = relatedProduct.data[0];
                this.products = relatedProduct.data[1];
               /* console.log('toatl produ for related products: ', this.products);*/

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

    /** Event method for pagination change */
    onPageChange(event) {
        this.page = event;
        this.ngOnInit();
    }
}
