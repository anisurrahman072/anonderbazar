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
    this.productService.getFlashDealsProducts()
        .subscribe(data => {
          this.productList = data.filter(product => {
            return product.warehouse_id.status == 2;
          })
        }, error => {
          console.log("Error occurred!", error);
        })
  }

  private addPageTitle() {
    this.title.setTitle('Featured Products - Anonderbazar');
  }

}
