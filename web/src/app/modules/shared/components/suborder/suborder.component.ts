import {Component, Input, OnInit,} from '@angular/core';
import {AppSettings} from "../../../../config/app.config";
import {OrderService, SuborderItemService, SuborderService} from "../../../../services";
import {ActivatedRoute} from "@angular/router";
import {Subscription} from "rxjs/Subscription";
import {PaymentService} from "../../../../services/payment.service";
import {PaymentAddressService} from "../../../../services/payment-address.service";
import {ShippingAddressService} from "../../../../services/shipping-address.service";

@Component({
    selector: 'Suborder-tab',
    templateUrl: './suborder.component.html',
    styleUrls: ['./suborder.component.scss']
})
export class SuborderComponent implements OnInit {
    
    sub: Subscription;
    id: number;
    data: any;
    IMAGE_ENDPOINT = AppSettings.IMAGE_ENDPOINT;
    currentDate: any;
    order: any;
    payment: any;
    paymentAddress: any;
    shippingAddress: any;
    suborderItems: any;
    
    
    constructor(private route: ActivatedRoute,
                private suborderService: SuborderService,
                private orderService: OrderService,
                private suborderItemService: SuborderItemService,
                private paymentService: PaymentService,
                private paymentAddressService: PaymentAddressService,
                private shippingAddressService: ShippingAddressService) {
    }
      //Event method for getting all the data for the page
    ngOnInit() {
        this.currentDate = Date();
        this.sub = this.route.params.subscribe(params => {
            this.id = +params['id']; // (+) converts string 'id' to a number
            this.suborderService.getById(this.id)
                .subscribe(suborder => {
                    this.data = suborder;
                    this.suborderItems = suborder.suborderItems;
                    this.orderService.getById(suborder.product_order_id.id).subscribe(order => {
                        this.order = order;
                        this.paymentService.getByOrderId(order.id).subscribe(payment => {
                            this.payment = payment[0];
                        });
                        this.paymentAddressService.getByOrderId(order.id).subscribe(paymentAddress => {
                            this.paymentAddress = paymentAddress[0];
                        });
                        this.paymentAddressService.getByOrderId(order.id).subscribe(shippingAddress => {
                            this.shippingAddress = shippingAddress[0];
                        });
                    });
                });
        });
    }

    
    ngOnDestroy(): void {
        this.sub ? this.sub.unsubscribe() : '';
    
    }
}

