import {Component, OnInit} from '@angular/core';
import {ActivatedRoute} from "@angular/router";
import {BrandService, ProductService} from "../../../services";
import {LoaderService} from "../../../services/ui/loader.service";
import {forkJoin} from "rxjs/observable/forkJoin";
import {error} from "util";

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

    constructor(
        private route: ActivatedRoute,
        private productService: ProductService,
        private brandService: BrandService,
        public loaderService: LoaderService,
    ) {
    }

    ngOnInit() {
        this.route.params.subscribe(params => {
            this.id = +params['id'];

            this.loaderService.showLoader();
            forkJoin([this.brandService.getById(this.id), this.productService.getAllByBrandId(this.id)])
                .subscribe(arr => {
                    this.brand = arr[0];
                    this.allProducts = arr[1].data;
                    this.loaderService.hideLoader();
                }, error => {
                    console.log('Error occurred while fetching brand products. Error: ', error);
                })
        });
    }
}
