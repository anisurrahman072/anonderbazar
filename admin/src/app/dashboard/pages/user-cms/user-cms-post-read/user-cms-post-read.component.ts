import { Component, OnInit } from '@angular/core';
import {Subscription} from "rxjs";
import {environment} from "../../../../../environments/environment";
import {ActivatedRoute} from "@angular/router";
import {CmsService} from "../../../../services/cms.service";
import {NzNotificationService} from "ng-zorro-antd";

@Component({
  selector: 'app-user-cms-post-read',
  templateUrl: './user-cms-post-read.component.html',
  styleUrls: ['./user-cms-post-read.component.css']
})
export class UserCmsPostReadComponent implements OnInit {

  sub: Subscription;
  id: number;
  cmsPostData: any;
  IMAGE_ENDPOINT = environment.IMAGE_ENDPOINT;

  constructor(private route: ActivatedRoute,
              private cmsService: CmsService,
              private _notification: NzNotificationService,
  ) { }

  ngOnInit() {
    this.sub = this.route.params.subscribe(params => {
      this.id = +params['id']; // (+) converts string 'id' to a number
      this.getPageData();
    }, (error)=>{
      this._notification.create(
          'error',
          'Problem in retrieving the post',
          'Problem in retrieving the post'
      );
    });
  }

  getPageData(){
    this.cmsService.getById(this.id)
        .subscribe(data => {
          this.cmsPostData = data;
        })
  }

}
