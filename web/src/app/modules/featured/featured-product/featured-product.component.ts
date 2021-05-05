import { Component, OnInit } from '@angular/core';
import {ProductService} from "../../../services";
import {Title} from "@angular/platform-browser";

@Component({
  selector: 'app-featured-product',
  templateUrl: './featured-product.component.html',
  styleUrls: ['./featured-product.component.scss'],
})
export class FeaturedProductComponent implements OnInit {

  productList: any;

  constructor(
      private productService: ProductService,
      private title: Title
  ) { }

  ngOnInit() {
    this.getFeatureProducts();
    this.addPageTitle();
  }

  private getFeatureProducts() {
    this.productList = this.productService.fetchFlashDealsProducts();
  }

  private addPageTitle() {
    this.title.setTitle('Featured Products - Anonderbazar');
  }

}
