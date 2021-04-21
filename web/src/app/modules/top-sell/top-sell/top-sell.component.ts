import { Component, OnInit } from '@angular/core';
import {ProductService} from "../../../services";

@Component({
  selector: 'app-top-sell',
  templateUrl: './top-sell.component.html',
  styleUrls: ['./top-sell.component.scss']
})
export class TopSellComponent implements OnInit {

  topSellProducts: any;
  p: any;

  constructor(private productService: ProductService) { }

  ngOnInit() {
    this.productService.getTopSellProducts().subscribe(arg => this.topSellProducts = arg.data);
  }

}
