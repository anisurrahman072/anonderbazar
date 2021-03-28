import {Component, OnDestroy, OnInit} from '@angular/core';
import {
    FormBuilder,
} from '@angular/forms';
import {Subscription} from 'rxjs';
import {ActivatedRoute} from '@angular/router';
import {CategoryProductService} from '../../../../../services/category-product.service';
import {environment} from "../../../../../../environments/environment";
import {NzNotificationService} from "ng-zorro-antd";

@Component({
    selector: 'app-category-product-read',
    templateUrl: './category-product-read.component.html',
    styleUrls: ['./category-product-read.component.css']
})
export class CategoryProductReadComponent implements OnInit, OnDestroy {
    sub: Subscription;
    id: number;
    data: any;
    IMAGE_ENDPOINT = environment.IMAGE_ENDPOINT;
    isLoading: boolean = true;

    constructor(private route: ActivatedRoute,
                private _notification: NzNotificationService,
                private fb: FormBuilder,
                private categoryProductService: CategoryProductService) {
    }

    // init the component
    ngOnInit() {
        this.sub = this.route.params.subscribe(params => {
            this.isLoading = true;
            this.id = +params['id']; // (+) converts string 'id' to a number
            this.categoryProductService.getById(this.id)
                .subscribe(result => {
                    this.data = result;
                    this.isLoading = false;
                }, (err)=> {
                    this.isLoading = false;
                });
        });

    }

    //Method for destroying the component
    ngOnDestroy(): void {
        this.sub ? this.sub.unsubscribe() : '';

    }

}
