import {Component, Input, OnInit} from '@angular/core';
import {ProductService, ProductVariantService} from "../../../../services";
import {Observable} from 'rxjs/Rx';
import {AppSettings} from "../../../../config/app.config";
import {Product} from "../../../../models";
import {GLOBAL_CONFIGS} from "../../../../../environments/global_config";

@Component({
    selector: 'home-product-promo',
    templateUrl: './product-promo.component.html',
    styleUrls: ['./product-promo.component.scss'],
})

export class ProductPromoComponent implements OnInit {
    IMAGE_EXT = GLOBAL_CONFIGS.productImageExtension;
    selectedProduct: Product;
    IMAGE_ENDPOINT = AppSettings.IMAGE_ENDPOINT;
    promotionalProducts$: Observable<any>; 
    _trialEndsAt;
    private _diff: number;
    private _days: number;
    private _hours: number;
    private _minutes: number;
    private _seconds: number;
    selectedProductVariants: any;
    isOn: 'selected';
    
    constructor(private productService: ProductService,
                private productVariantService: ProductVariantService) {
    }
    
    getDays(t) {
        return Math.floor(t / (1000 * 60 * 60 * 24));
    }
    
    getHours(t) {
        return Math.floor((t / (1000 * 60 * 60)) % 24);
    }
    
    getMinutes(t) {
        return Math.floor((t / 1000 / 60) % 60);
    }
    
    getSeconds(t) {
        return Math.floor((t / 1000) % 60);
    }
      //Event method for getting all the data for the page
    ngOnInit() {
        this.promotionalProducts$ = this.productService.getAllPromotionProduct();
        
        this.promotionalProducts$.subscribe((res) => {
            this.selectedProduct = res[0];
            
            this.productVariantService.getAllVariantByProductId(this.selectedProduct.id)
                .subscribe(result => {
                    if (result) {
                        this.selectedProductVariants = result;
                    }
                });
            this._trialEndsAt = this.selectedProduct.end_date;
        });

        Observable.interval(1000).map((x) => {
            this._diff = Date.parse(this._trialEndsAt) - Date.parse(new Date().toString());
        }).subscribe((x) => {
            this._days = this.getDays(this._diff);
            this._hours = this.getHours(this._diff);
            this._minutes = this.getMinutes(this._diff);
            this._seconds = this.getSeconds(this._diff);
        });
    }
    // Method for calculating product discount
    percentageCalculation() {
        let discountValue = (this.selectedProduct.price - this.selectedProduct.promo_price);
        let percentageValue = (discountValue / this.selectedProduct.price) * 100;
        return Math.round(percentageValue);
    }
    // Method for selecting product
    selectProduct(selectProduct){
        this.selectedProduct=selectProduct;
        this._trialEndsAt = this.selectedProduct.end_date;

        Observable.interval(1000).map((x) => {
            this._diff = Date.parse(this._trialEndsAt) - Date.parse(new Date().toString());
        }).subscribe((x) => {
            this._days = this.getDays(this._diff);
            this._hours = this.getHours(this._diff);
            this._minutes = this.getMinutes(this._diff);
            this._seconds = this.getSeconds(this._diff);
        });
    }
}