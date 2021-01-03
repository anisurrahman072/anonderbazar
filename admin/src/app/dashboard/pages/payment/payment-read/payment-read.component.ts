import {Component, OnDestroy, OnInit} from '@angular/core';
import {Subscription} from 'rxjs';
import {NzNotificationService} from 'ng-zorro-antd';
import {ActivatedRoute} from '@angular/router';
import {PaymentService} from "../../../../services/payment.service";

@Component({
    selector: 'app-payment-read',
    templateUrl: './payment-read.component.html',
    styleUrls: ['./payment-read.component.css']
})
export class PaymentReadComponent implements OnInit, OnDestroy {
    sub: Subscription;
    id: number;
    data: any;
    
    
    constructor(private route: ActivatedRoute,
                private _notification: NzNotificationService,
                private paymentService: PaymentService) {
    }
     // init the component
    ngOnInit() {
        this.sub = this.route.params.subscribe(params => {
            this.id = +params['id']; // (+) converts string 'id' to a number
            this.paymentService.getById(this.id)
                .subscribe(result => {
                    this.data = result;
                });
        });
    }
    
    ngOnDestroy(): void {
        this.sub ? this.sub.unsubscribe() : '';
    
    }
}
