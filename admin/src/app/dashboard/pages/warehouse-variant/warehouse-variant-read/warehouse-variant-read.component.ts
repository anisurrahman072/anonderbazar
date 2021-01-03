
import { Component, OnDestroy, OnInit } from '@angular/core';
import { FormBuilder } from '@angular/forms';
import { Subscription } from 'rxjs';
import { NzNotificationService } from 'ng-zorro-antd';
import { ActivatedRoute } from '@angular/router';
import { WarehouseVariantService } from '../../../../services/warehouse-variant.service';
import {environment} from "../../../../../environments/environment";

@Component({
  selector: 'app-warehouse-variant-read',
  templateUrl: './warehouse-variant-read.component.html',
  styleUrls: ['./warehouse-variant-read.component.css']
})
export class WarehouseVariantReadComponent implements OnInit, OnDestroy {
  sub: Subscription;
  id: number;
  data: any;
  IMAGE_ENDPOINT = environment.IMAGE_ENDPOINT;

  constructor(
    private route: ActivatedRoute,
    private _notification: NzNotificationService,
    private warehousevariantService: WarehouseVariantService
  ) {}

  ngOnInit() {
    this.sub = this.route.params.subscribe(params => {
      this.id = +params['id']; // (+) converts string 'id' to a number

      this.warehousevariantService.getById(this.id).subscribe(result => {
        this.data = result;
        
      });
    });
  }

  ngOnDestroy(): void {
    this.sub ? this.sub.unsubscribe() : '';
  }
}
