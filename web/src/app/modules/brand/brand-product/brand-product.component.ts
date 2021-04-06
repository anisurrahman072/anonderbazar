import { Component, OnInit } from '@angular/core';
import {ActivatedRoute} from "@angular/router";
import {BrandService, ProductService} from "../../../services";

@Component({
  selector: 'app-brand-product',
  templateUrl: './brand-product.component.html',
  styleUrls: ['./brand-product.component.scss']
})
export class BrandProductComponent implements OnInit {

  id: number;
  brand: any = null;
  allProducts: any;

  constructor(private route: ActivatedRoute,
              private productService: ProductService,
              private brandService: BrandService) { }

  ngOnInit() {
    this.route.params.subscribe(params => {
      this.id = +params['id'];
    });
    console.log('brand id is: ', this.id);

    this.brandService.getById(this.id)
        .subscribe(brand => {
            this.brand  = brand;
        }, error => {
            console.log('Error while getting the brand by ID', error);
        });

    this.productService.getAllByBrandId(this.id)
        .subscribe((products) => {
          this.allProducts = products;
          console.log('Ansss', this.allProducts);
        }, error => {
          console.log('Error while getting all products by Brand Id', error);
        });
  }
}
