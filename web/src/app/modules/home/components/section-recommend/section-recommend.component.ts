import {Component, OnInit} from '@angular/core';
import {ProductService} from "../../../../services";
import {ToastrService} from "ngx-toastr";

@Component({
    selector: 'app-section-recommend',
    templateUrl: './section-recommend.component.html',
    styleUrls: ['./section-recommend.component.scss']
})
export class RecommendComponent implements OnInit {
    dataProductList: any[] = [];
    limit: number = 24;
    skip: number = 0;
    productDataTrue: boolean = true;

    constructor(private productService: ProductService,
                private toastr: ToastrService,) {
    }

    //Event method for getting all the data for the page
    ngOnInit() {
        this.getRecommendedProducts(this.limit, this.skip);
    }

    //Event method for getting all the data for the page
    private getRecommendedProducts(limit, skip) {
        this.productService.getRecommendedProducts(limit, skip).subscribe(products => {
            this.dataProductList.push(...products.data);
            if (products.length < 8) {
                this.productDataTrue = false;
                this.toastr.info("No more products", 'Note');
            }
        })
    }

    //Event method for pagination change
    showMore() {
        this.skip += this.limit;
        this.getRecommendedProducts(this.limit, this.skip)
    }

}
