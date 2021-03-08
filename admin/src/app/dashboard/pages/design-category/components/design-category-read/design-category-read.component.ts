import {Component, OnDestroy, OnInit} from '@angular/core';
import {Subscription} from 'rxjs';
import {ActivatedRoute} from '@angular/router';
import {DesignCategoryService} from "../../../../../services/design-category.service";
import {environment} from "../../../../../../environments/environment";
import {NzNotificationService} from "ng-zorro-antd";

@Component({
    selector: 'app-design-category-read',
    templateUrl: './design-category-read.component.html',
    styleUrls: ['./design-category-read.component.css']
})
export class DesignCategoryReadComponent implements OnInit, OnDestroy {
    sub: Subscription;
    id: number;
    data: any;
    IMAGE_ENDPOINT = environment.IMAGE_ENDPOINT;


    constructor(private route: ActivatedRoute,
                private _notification: NzNotificationService,
                private designCategoryService: DesignCategoryService) {
    }

    // init the component
    ngOnInit() {
        this.sub = this.route.params.subscribe(params => {
            this.id = +params['id']; // (+) converts string 'id' to a number
            this.designCategoryService.getById(this.id)
                .subscribe(result => {
                    this.data = result;
                });
        });

    }

    ngOnDestroy(): void {
        this.sub ? this.sub.unsubscribe() : '';

    }

}
