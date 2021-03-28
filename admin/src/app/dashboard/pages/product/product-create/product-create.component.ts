import {Component, OnDestroy, OnInit} from '@angular/core';
import {ActivatedRoute} from '@angular/router';
import {Subscription} from "rxjs";


@Component({
    selector: 'app-product-create',
    templateUrl: './product-create.component.html',
    styleUrls: ['./product-create.component.css']
})
export class ProductCreateComponent implements OnInit, OnDestroy {
    status: any;
    queryStatus: any;
    queryParamSub: Subscription;

    constructor(private route: ActivatedRoute) {

    }

    ngOnInit(): void {
        this.queryParamSub = this.route.queryParams.filter(params => params.status).subscribe(params => {
            this.queryStatus = params.status;
            switch (params.status) {
                case '1':
                    this.status = 0;
                    break;
                case '2':
                    this.status = 1;
                    break;
                case '3':
                    this.status = 2;
                    break;
                default:
                    break;
            }
        });
    }

    ngOnDestroy() {
        this.queryParamSub ? this.queryParamSub.unsubscribe() : null;
    }
}
