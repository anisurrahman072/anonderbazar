import {Component, OnInit} from '@angular/core';
import {BrandService, ProductService} from "../../../../services";

@Component({
    selector: 'app-section-brand',
    templateUrl: './section-brand.component.html',
    styleUrls: ['./section-brand.component.scss']
})
export class SectionBrandComponent implements OnInit {

    dataBrandList: any = null;
    IMAGE_ENDPOINT = 'https://anonderbazar.s3-ap-southeast-1.amazonaws.com';

    constructor(private brandService: BrandService,
                private productService: ProductService) {
    }

    ngOnInit() {
        this.brandService.getAll()
            .subscribe(brands => {
                brands.map(brand => {
                    this.productService.getAllByBrandId(brand.id)
                        .subscribe(products => {
                            if(products.length > 0){
                                if(!this.dataBrandList) this.dataBrandList = [];
                                if(this.dataBrandList.length < 8) this.dataBrandList.push(brand);
                            }
                        });
                });
            }, error => {
                console.log('Error occurred');
            });
    }
}
