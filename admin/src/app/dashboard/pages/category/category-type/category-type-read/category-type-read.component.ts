import {Component, OnDestroy, OnInit} from '@angular/core';
import {
    FormBuilder,
} from '@angular/forms';
import {CategoryTypeService} from '../../../../../services/category-type.service';
import {Subscription} from 'rxjs';
import {NzNotificationService} from 'ng-zorro-antd';
import {ActivatedRoute} from '@angular/router';

import {environment} from "../../../../../../environments/environment";

@Component({
    selector: 'app-category-type-read',
    templateUrl: './category-type-read.component.html',
    styleUrls: ['./category-type-read.component.css']
})
export class CategoryTypeReadComponent implements OnInit, OnDestroy {
    sub: Subscription;
    id: number;
    data: any;
    IMAGE_ENDPOINT = environment.IMAGE_ENDPOINT;


    constructor(private route: ActivatedRoute,
                private _notification: NzNotificationService,
                private fb: FormBuilder, private categoryTypeService: CategoryTypeService) {
    }

    ngOnInit() {
        this.sub = this.route.params.subscribe(params => {
            this.id = +params['id']; // (+) converts string 'id' to a number
            this.categoryTypeService.getById(this.id)
                .subscribe(result => {
                    this.data = result;
                });
        });
    }

    ngOnDestroy(): void {
        this.sub ? this.sub.unsubscribe() : '';
    
    }

}
