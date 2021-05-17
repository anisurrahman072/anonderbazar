import { Component, OnInit } from '@angular/core';
import {ActivatedRoute} from "@angular/router";
import {CmsService} from "../../../services";
import {AppSettings} from "../../../../app/config/app.config";

@Component({
  selector: 'app-cms-post-details',
  templateUrl: './cms-post-details.component.html',
  styleUrls: ['./cms-post-details.component.scss']
})
export class CmsPostDetailsComponent implements OnInit {

  id: number;
  post: any;
  IMAGE_ENDPOINT = AppSettings.IMAGE_ENDPOINT;
  constructor(private route: ActivatedRoute,
              private cmsService: CmsService
              ) { }

  ngOnInit() {
    this.route.params.subscribe(params => {
      this.id = +params['id']; // (+) converts string 'id' to a number
      this.getPageData();
    }, (error)=>{
      console.log(error);
    });
  }

  getPageData(){
    this.cmsService.getById(this.id)
        .subscribe(post => {
          this.post = post;
        })
  }

}
