import {Component, OnInit} from '@angular/core';
import {CategoryProductService, ProductService} from "../../../../services";
import {Observable} from "rxjs/Observable";

@Component({
    selector: 'app-home-page',
    templateUrl: './home.component.html',
    styleUrls: ['./home.component.scss']
})
export class HomeComponent implements OnInit {
    hotProducts$: Observable<any>;
    featureProducts$: Observable<any>;
    categories$: Observable<any>; 
    recommendedProducts$: Observable<any>;
    rewardProducts$: Observable<any>;
    wholesaleProducts$: Observable<any>;
    
    
    constructor(
        private productService: ProductService,
        private categoryProductService: CategoryProductService
        ) {
    
        
    }
    // init the component
    ngOnInit() {
        this.getHotProducts();
        this.getFeatureProducts();
        this.getProductCategory(); 
        this.getRewardProducts();
        this.getWholeSaleProducts();
        
    }
    //Event method for getting all the data for the page
    private getHotProducts() {
        this.hotProducts$ = this.productService.getAllHotProducts();
    }
    //Event method for getting all the data for the page
    private getFeatureProducts() {
        this.featureProducts$ = this.productService.getFlashDealsProducts();
    }
    //Event method for getting all the data for the page
    private getRewardProducts() {
        this.rewardProducts$ = this.productService.getRewardProducts();
    }
    //Event method for getting all the data for the page
    private getWholeSaleProducts() {
        this.wholesaleProducts$ = this.productService.getWholeSaleProducts();
    } 
    //Event method for getting all the data for the page
    private getProductCategory(){
        this.categories$ = this.categoryProductService.getAllHomeCategory(); 
    } 
}
