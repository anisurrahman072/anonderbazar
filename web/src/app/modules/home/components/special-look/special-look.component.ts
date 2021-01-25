import {Component, OnInit} from '@angular/core';
import {ProductService} from "../../../../services/product.service";
import {AppSettings} from "../../../../config/app.config";
import {CmsService} from '../../../../services';

@Component({
    selector: 'app-special-look',
    templateUrl: './special-look.component.html',
    styleUrls: ['./special-look.component.scss']
})
export class SpecialLookComponent implements OnInit {
    IMAGE_ENDPOINT = AppSettings.IMAGE_ENDPOINT;
    dataWarehouseList;
    middleblogList: any;

    constructor(private productService: ProductService,
                private cmsService: CmsService) {
    }

    //Event method for getting all the data for the page
    ngOnInit() {
        this.productService.getByMostSellingWarehouse().subscribe(result => {
            this.dataWarehouseList = result.data;
        });
        this.cmsService.getBySubSectionName('POST', 'HOME', "MIDDLE").subscribe(result => {
            this.middleblogList = result;
            for (let i = 0; i < this.middleblogList.length; i++) {
                let inputWords = this.middleblogList[i].data_value[0].description.replace(/<[^>]*>/g, '').replace(/&nbsp;/g, ' ').split(' ');
                if (inputWords.length > 50) {
                    this.middleblogList[i].data_value[0].description = inputWords.slice(0, 50).join(' ') + ' ...';
                } else {
                    this.middleblogList[i].data_value[0].description = inputWords.join(' ');
                }
            }
        });
    }

}
