import {Component, OnInit} from '@angular/core';
import {BrandService, ProductService} from "../../../services";
import {AppSettings} from "../../../config/app.config";
import * as ___ from 'lodash';
import {Title} from "@angular/platform-browser";

@Component({
    selector: 'app-brand',
    templateUrl: './brand.component.html',
    styleUrls: ['./brand.component.scss'],
})
export class BrandComponent implements OnInit {

    dataBrandList: any = [];
    IMAGE_ENDPOINT = AppSettings.IMAGE_ENDPOINT;

    constructor(private brandService: BrandService,
                private productService: ProductService,
                private title: Title
    ) {
    }

    ngOnInit() {
        this.brandService.getAll(true)
            .concatMap((brands) => {
                this.dataBrandList = brands;

                let allBrandIds = this.dataBrandList.map(brand => {
                    return brand.id;
                });
                return this.productService.getCountByBrandIds(allBrandIds);
            })
            .subscribe((counts) => {
                let brandCounts = counts.data;
                if (!___.isEmpty(brandCounts)) {
                    this.dataBrandList = this.dataBrandList.filter((brand: any) => {
                        return !___.isUndefined(brandCounts[brand.id]);
                    })
                }
            }, error => {
                console.log('Error occurred while fetching brands', error);
            });

        this.addPageTitle();
    }

    private addPageTitle() {
        this.title.setTitle('All Brands - Anonderbazar');
    }

}
