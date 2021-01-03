import { Component, OnInit } from '@angular/core';
import { ActivatedRoute } from '@angular/router';
import { CmsService, ProductService } from '../../../../services';
import {Observable} from "rxjs/Observable";
import { Title } from '@angular/platform-browser';
import { AppSettings } from '../../../../config/app.config';
@Component({
  selector: 'app-page-cms_details',
  templateUrl: './cms-details-page.component.html',
  styleUrls: ['./cms-details-page.component.scss']
})
export class CmsDetailsPageComponent implements OnInit {
  IMAGE_ENDPOINT = AppSettings.IMAGE_ENDPOINT;
  id: any;
  cms_post_by_id: any;
  cms_recent_post: Observable<any>;
  cms_detail: any = [];

  products: any = [];
  offers: any = [];
  constructor(
    private route: ActivatedRoute,
    private CmsService: CmsService,
    private productservice: ProductService
  ) { }
// init the component
  ngOnInit() {
  
    
      this.route.params.subscribe(params => {
        this.id = +params['id'];
  
        this.get_cms_by_id(); 
      });
    
  }
  // Method for recenlty added post from cms
  private cms_recent_posts() {
   
    this.CmsService.getRecentPost("POST",3,'id',"desc").subscribe(result => {
     this.cms_recent_post = result; 
 });
  }

  //Method for cms data by ids
  private get_cms_by_id() {
    
    this.CmsService.getById(this.id).subscribe(result => {
    this.cms_post_by_id = result;
    this.cms_detail = this.cms_post_by_id.data_value[0]; 
    
    if (this.cms_detail.offers.length>0) {
        let newOffers = [];
        this.cms_detail.offers.forEach(element => {
          this.CmsService.getById(element)
            .subscribe(result => {  
              newOffers.push(result);
          }); 
        });
        this.cms_detail['alloffers'] = newOffers;
    }
    if (this.cms_detail.products.length>0) {
      let newOffers = [];
      this.cms_detail.products.forEach(element => {
        this.productservice.getById(element)
          .subscribe(result => {  
            newOffers.push(result);
        }); 
      });
      this.cms_detail['allproducts'] = newOffers;
    }  
  });
  }
}
