import { Component, OnInit } from '@angular/core';
import {ProductService} from "../../../services";

@Component({
  selector: 'app-featured-product',
  templateUrl: './featured-product.component.html',
  styleUrls: ['./featured-product.component.scss'],
})
export class FeaturedProductComponent implements OnInit {

  productList: any;

  constructor(
      private productService: ProductService
  ) { }

  ngOnInit() {
    this.getFeatureProducts();
  }

  private getFeatureProducts() {
    this.productList = this.productService.fetchFlashDealsProducts();
  }

}
