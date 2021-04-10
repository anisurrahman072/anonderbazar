import { Component, OnInit } from '@angular/core';
import {BrandService, ProductService} from "../../../services";
import {AppSettings} from "../../../config/app.config";

@Component({
  selector: 'app-brand',
  templateUrl: './brand.component.html',
  styleUrls: ['./brand.component.scss'],
})
export class BrandComponent implements OnInit {

  dataBrandList: any = [];
  IMAGE_ENDPOINT = AppSettings.IMAGE_ENDPOINT;

  constructor(private brandService: BrandService,
              private productService: ProductService) {
  }

  ngOnInit() {
    let allBrands;
    this.brandService.getAll(true)
        .subscribe((brands) =>{
          allBrands = brands;

          let allBrandIds = allBrands.map(brand => {
            return brand.id;
          });

          this.productService.getCountByBrandIds(allBrandIds)
              .subscribe((counts) => {
                this.dataBrandList = counts.data.map((count, index) => {
                  if(count){
                    return allBrands[index];
                  }
                }).filter(data => data);
              }, error => {
                  console.log('Error occurred while fetching brands', error);
              });
        })
  }

}
