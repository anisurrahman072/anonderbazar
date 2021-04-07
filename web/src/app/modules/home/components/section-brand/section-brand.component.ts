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

                let currentBrand;
                from(allBrands)
                    .concatMap((brand:any) => {
                        currentBrand = brand;
                        return this.productService.getAllByBrandId(brand.id)
                    })
                    .subscribe(products => {
                        if(products.length !== 0){
                            if(!this.dataBrandList) this.dataBrandList = [];
                            if(this.dataBrandList.length < 8) this.dataBrandList.push(currentBrand);
                        }}, error => {
                        console.log('Error occurred', error);
                    })
            })
    }
}
