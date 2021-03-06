import {Component, Input, OnInit} from '@angular/core';
import {OfferService, ProductService} from "../../../../services";
import {ToastrService} from "ngx-toastr";
import {Offer} from "../../../../models"
import {Store} from "@ngrx/store";
import * as fromStore from "../../../../state-management";

@Component({
    selector: 'app-section-recommend',
    templateUrl: './section-recommend.component.html',
    styleUrls: ['./section-recommend.component.scss']
})
export class RecommendComponent implements OnInit {
    @Input() offerData: Offer;

    dataProductList: any[] = [];
    limit: number = 24;
    skip: number = 0;
    productDataTrue: boolean = true;

    constructor(private productService: ProductService,
                private toastr: ToastrService,
                private store: Store<fromStore.HomeState>,
                private offerService: OfferService
    ) {
    }

    //Event method for getting all the data for the page
    ngOnInit() {
        this.getRecommendedProducts(this.limit, this.skip);
    }


    //Event method for getting all the data for the page
    private getRecommendedProducts(limit, skip) {
        this.productService.getRecommendedProducts(limit, skip)
            .subscribe(products => {
                let recommendedProducts = products.data.filter(product => {
                    return product.warehouse_id.status == 2;
                })
                this.dataProductList.push(...recommendedProducts);

                /** finding out the products exists in the offer store*/
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
                if (products.length < 8) {
                    this.productDataTrue = false;
                    this.toastr.info("No more products", 'Note');
                }
            })
    }

    //Event method for pagination change
    showMore() {
        this.skip += this.limit;
        this.getRecommendedProducts(this.limit, this.skip)
    }

}
