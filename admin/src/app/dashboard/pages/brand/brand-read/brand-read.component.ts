import {Component, OnDestroy, OnInit} from '@angular/core';
import {Subscription} from 'rxjs';
import {ActivatedRoute} from '@angular/router';
import {BrandService} from '../../../../services/brand.service';
import {environment} from "../../../../../environments/environment";
import {NzNotificationService} from "ng-zorro-antd";

@Component({
    selector: 'app-brand-read',
    templateUrl: './brand-read.component.html',
    styleUrls: ['./brand-read.component.css']
})
export class BrandReadComponent implements OnInit, OnDestroy {
    sub: Subscription;
    id: number;
    data: any;
    IMAGE_ENDPOINT = environment.IMAGE_ENDPOINT;

    constructor(private route: ActivatedRoute,
                private _notification: NzNotificationService,
                private brandService: BrandService) {
    }

    // init the component
    ngOnInit() {
        this.sub = this.route.params.subscribe(params => {
            this.id = +params['id']; // (+) converts string 'id' to a number
            this.brandService.getById(this.id)
                .subscribe(result => {
                    this.data = result;
                });
        });
    }

    ngOnDestroy(): void {
        this.sub ? this.sub.unsubscribe() : '';

    }
}
