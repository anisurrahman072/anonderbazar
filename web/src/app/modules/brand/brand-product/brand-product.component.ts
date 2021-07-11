import {Component, OnInit} from '@angular/core';
import {ActivatedRoute} from "@angular/router";
import {BrandService, OfferService, ProductService} from "../../../services";
import {LoaderService} from "../../../services/ui/loader.service";
import {forkJoin} from "rxjs/observable/forkJoin";
import {Title} from "@angular/platform-browser";
import {error} from "util";
import {Observable} from "rxjs/Observable";
import {Offer} from "../../../models";
import {Store} from "@ngrx/store";
import * as fromStore from "../../../state-management";

@Component({
    selector: 'app-brand-product',
    templateUrl: './brand-product.component.html',
    styleUrls: ['./brand-product.component.scss']
})
export class BrandProductComponent implements OnInit {

    id: number;
    brand: any = null;
    allProducts: any;
    p: any;

    /**for offer*/
    offer$: Observable<Offer>;
    offerData: Offer;
    calculationType;
    discountAmount;
    originalPrice;

    constructor(
        private route: ActivatedRoute,
        private productService: ProductService,
        private brandService: BrandService,
        public loaderService: LoaderService,
        private title: Title,
        private offerService: OfferService,
        private store: Store<fromStore.HomeState>

    ) {
    }

    ngOnInit() {
        this.loaderService.showLoader();

        this.offer$ = this.store.select<any>(fromStore.getOffer);
        this.offer$.subscribe(offerData => {
            this.offerData = offerData;
        })

        this.route.params
            .concatMap(params => {
                this.id = +params['id'];
                return forkJoin([this.brandService.getById(this.id), this.productService.getAllByBrandId(this.id)])
            })
            .subscribe(arr => {
                this.brand = arr[0];
                /*console.log('brand',this.brand);*/
                this.addPageTitle();
                this.allProducts = arr[1].data;

                if (this.allProducts) {
                    this.allProducts.forEach(product => {
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

                this.loaderService.hideLoader();
            }, error => {
                console.log('Error occurred while fetching brand products. Error: ', error);
            })
    }

    private addPageTitle() {
        this.title.setTitle('Brand: ' + this.brand.name + ' - Anonderbazar');
    }
}
