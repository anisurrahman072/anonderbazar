import {Component, OnInit} from '@angular/core';
import {BrandService, ProductService} from "../../../../services";
import {AppSettings} from "../../../../config/app.config";

@Component({
    selector: 'app-section-brand',
    templateUrl: './section-brand.component.html',
    styleUrls: ['./section-brand.component.scss']
})
export class SectionBrandComponent implements OnInit {

    dataBrandList: any = [];
    IMAGE_ENDPOINT = AppSettings.IMAGE_ENDPOINT;

    constructor(private brandService: BrandService,
                private productService: ProductService) {
    }

    ngOnInit() {
        this.brandService.getAll(true)
            .concatMap((brands: any) => {
                let allBrandIds = brands.map(brand => {
                    return brand.id;
                });
                return this.productService.getCountByBrandIds(allBrandIds);
            })
            .subscribe((counts: any) => {
                this.dataBrandList = counts.data.filter(count => count);
                this.dataBrandList.length = 12;
            }, error => {
                console.log('Error occurred while fetching brands', error);
            })
    }
}
