import {Component, OnDestroy, OnInit} from '@angular/core';
import {Subscription} from 'rxjs';
import {NzNotificationService} from 'ng-zorro-antd';
import {ActivatedRoute} from '@angular/router';
import {ProductService} from '../../../../services/product.service';
import {DesignImagesService} from "../../../../services/design-images.service";
import {environment} from "../../../../../environments/environment";
import {AuthService} from '../../../../services/auth.service';

@Component({
    selector: 'app-product-read',
    templateUrl: './product-read.component.html',
    styleUrls: ['./product-read.component.css']
})
export class ProductReadComponent implements OnInit, OnDestroy {
    sub: Subscription;
    id: number;
    data: {};
    IMAGE_ENDPOINT = environment.IMAGE_ENDPOINT;
    tags = [];
    status: any;
    currentUser: any;

    constructor(private route: ActivatedRoute,
                private designImagesService: DesignImagesService,
                private authService: AuthService,
                private _notification: NzNotificationService,
                private productService: ProductService) {
    }

    // For initiating the section element with data
    ngOnInit() {
        this.currentUser = this.authService.getCurrentUser();

        this.route.queryParams.filter(params => params.status).subscribe(params => {
            this.status = params.status;
        });
        this.sub = this.route.params.subscribe(params => {
            this.id = +params['id']; // (+) converts string 'id' to a number
            this.getPageData();
        }, (error)=>{
            this._notification.create(
                'error',
                'Problem in retrieving the product',
                'Problem in retrieving the product'
            );
        });

    }

    // Event method for getting all the data for the page
    getPageData() {
        this.productService.getByIdWithPopulate(this.id)
            .subscribe(result => {
                if (result) {
                    this.data = result;
                    if (result.tag != "undefined")
                        this.tags = JSON.parse(result.tag);
                }

            });
    }

    // Method for deleting image
    deleteImageConfirm(index, id) {
        this.productService.deleteProductImage(id).subscribe(result => {
            this._notification.create(
                'success',
                'success',
                'product Image delete succeeded'
            );
            this.getPageData();
        });

    }

    ngOnDestroy(): void {
        this.sub ? this.sub.unsubscribe() : '';

    }

}
