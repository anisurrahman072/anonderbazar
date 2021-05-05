import {Component, OnInit} from '@angular/core';
import {ActivatedRoute} from "@angular/router";
import {BrandService, ProductService} from "../../../services";
import {LoaderService} from "../../../services/ui/loader.service";
import {forkJoin} from "rxjs/observable/forkJoin";
import {Title} from "@angular/platform-browser";
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
        private title: Title

    ) {
    }

    ngOnInit() {
        this.loaderService.showLoader();
        this.route.params
            .concatMap(params => {
                this.id = +params['id'];
                return forkJoin([this.brandService.getById(this.id), this.productService.getAllByBrandId(this.id)])
            })
            .subscribe(arr => {
                this.brand = arr[0];
                console.log('brand',this.brand);
                this.addPageTitle();
                this.allProducts = arr[1].data;
                this.loaderService.hideLoader();
            }, error => {
                console.log('Error occurred while fetching brand products. Error: ', error);
            })
    }

    private addPageTitle() {
        this.title.setTitle('Brand: ' + this.brand.name + ' - Anonderbazar');
    }
}
