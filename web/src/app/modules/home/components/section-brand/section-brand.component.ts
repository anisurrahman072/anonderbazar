import {Component, OnInit} from '@angular/core';
import {BrandService, ProductService} from "../../../../services";
import {concatMap, debounceTime} from 'rxjs/operators';
import {from} from "rxjs/observable/from";
import {error} from "util";


@Component({
    selector: 'app-section-brand',
    templateUrl: './section-brand.component.html',
    styleUrls: ['./section-brand.component.scss']
})
export class SectionBrandComponent implements OnInit {

    dataBrandList: any = [];
    IMAGE_ENDPOINT = 'https://anonderbazar.s3-ap-southeast-1.amazonaws.com';

    constructor(private brandService: BrandService,
                private productService: ProductService) {
    }

    ngOnInit() {
        let allBrands;
        this.brandService.getAll(true)
            .subscribe((brands) =>{
                allBrands = brands;
                console.log('All brands:', allBrands);

                let allBrandIds = allBrands.map(brand => {
                    return brand.id;
                });

                this.productService.getCountByBrandIds(allBrandIds)
                    .subscribe((counts) => {
                        console.log('data asce', counts);
                        this.dataBrandList = counts.data.map((count, index) => {
                            if(count){
                                return allBrands[index];
                            }
                        }).filter(data => data);
                    });
            })
    }
}
