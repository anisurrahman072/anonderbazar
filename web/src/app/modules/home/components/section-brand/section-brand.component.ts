import {Component, OnInit} from '@angular/core';
import {BrandService, ProductService} from "../../../../services";
import {AppSettings} from "../../../../config/app.config";
import * as ___ from 'lodash';
@Component({
    selector: 'app-section-brand',
    templateUrl: './section-brand.component.html',
    styleUrls: ['./section-brand.component.scss']
})
export class SectionBrandComponent implements OnInit {

    dataBrandList: any;
    IMAGE_ENDPOINT = AppSettings.IMAGE_ENDPOINT;

    constructor(private brandService: BrandService,
                private productService: ProductService) {
    }

    ngOnInit() {
        this.brandService.getAll(true)
            .concatMap((brands: any) => {
                this.dataBrandList = brands;
                let allBrandIds = brands.map(brand => {
                    return brand.id;
                });
                return this.productService.getCountByBrandIds('homepage', allBrandIds);
            })
            .subscribe((result: any) => {
                const brandCount = result.data;

                if(!___.isEmpty(brandCount)){
                    this.dataBrandList = this.dataBrandList.filter((brand: any) => {
                        return !___.isUndefined(brandCount[brand.id]);
                    });
                    this.dataBrandList =  this.dataBrandList.slice(0, 12);
                } else {
                    this.dataBrandList = [];
                }

            }, error => {
                console.log('Error occurred while fetching brands', error);
            })
    }
}
