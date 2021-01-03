import { Component, OnInit, ViewChild } from '@angular/core';
import { CmsService, ProductService } from '../../../../services';
import {Observable} from "rxjs/Observable";
import { Title } from '@angular/platform-browser';
import { AppSettings } from '../../../../config/app.config';
import { ActivatedRoute, Router } from '@angular/router';
@Component({
  selector: 'app-page-cms',
  templateUrl: './cms-page.component.html',
  styleUrls: ['./cms-page.component.scss']
})

export class CmsPageComponent implements OnInit {
  array=[];
  all_cms_post: any;
  all_cms_post_by_scroll :Array<any>;
  IMAGE_ENDPOINT = AppSettings.IMAGE_ENDPOINT;
  Titles: any;
  start:number;
  end:number;
  cms_length:number;
  homeOfferData: any = [];
  offerpage = false;
  cmspage = false;
  constructor(
    private CmsService: CmsService,
    private productservice: ProductService,
    private router: Router,
    private route: ActivatedRoute,

  ) { 
this.start=0;

this.end=9;
if( this.cms_length<1)
this.end= this.cms_length;
   
  }
// init the component
  ngOnInit() {
    if (this.route.snapshot.data["title"] == "OFFERS") {
      this.get_all_offer_cms();
      this.offerpage = true;
      this.cmspage = false;

    }
    if (this.route.snapshot.data["title"]=="CMS") {
      this.get_all_cms();
      this.cmspage = true;
      this.offerpage = false;
      
    } 
  }
  //Method for add cms items

  addItems(startIndex, endIndex, _method) {
    for ( ;this.start < this.end; ++this.start) { 
      
      this.array.concat(this.all_cms_post[this.start])
     
    } 
  }
    //Method for append cms items

  appendItems(startIndex, endIndex) {
    this.addItems(startIndex, endIndex, 'push');
  }
  onScroll(event) {
    
    this.end+=3; 
  }

    //Event method for getting all the cms data for the page
  private get_all_cms() { 
    this.CmsService.getRecentPost("POST",this.end,"id","desc").subscribe(result => {
      this.CmsService.getBySubSectionName("POST","NONE","NONE").subscribe(result => {
        this.all_cms_post = result;
        for(let i=0;i<this.all_cms_post.length;i++){
            let inputWords = this.all_cms_post[i].data_value[0].description.replace(/<[^>]*>/g, '');
            inputWords = inputWords.replace("&nbsp;", "").split(' ');
            if (inputWords.length > 20)
                this.all_cms_post[i].data_value[0].description= inputWords.slice(0, 20).join(' ')+' ...';
            else
                this.all_cms_post[i].data_value[0].description= inputWords.join(' ');
        }
        this.cms_length=this.all_cms_post.length;
        
    });
  });
    
  
  }
    //Event method for getting all the offer cms data for the page
  private get_all_offer_cms() { 
    this.CmsService
        .getBySubSectionName('POST', 'HOME', 'PARENTOFFER')
        .subscribe(result => {
            this.homeOfferData = result; 
            this.homeOfferData.forEach(element => {
              if (element.data_value[0].offers.length>0) {
                
                let newOffers = [];
                element.data_value[0].offers.forEach(element => {
                  this.CmsService.getById(element)
                    .subscribe(result => {  
                      newOffers.push(result.data_value[0]);
                  }); 
                });
                element.data_value['alloffers'] = newOffers;
              }
              if (element.data_value[0].products.length>0) {
                let newProducts = [];
                element.data_value[0].products.forEach(element => {
                  this.productservice.getById(element)
                    .subscribe(result => { 
                      newProducts.push(result);
                  }); 
                });
              element.data_value['allproducts'] = newProducts;
              }
            });  
        });
    
  
  }


}
