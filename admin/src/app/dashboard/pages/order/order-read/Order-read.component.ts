import {Component, OnDestroy, OnInit} from '@angular/core';
import {Subscription} from 'rxjs';
import {NzNotificationService} from 'ng-zorro-antd';
import {ActivatedRoute} from '@angular/router';
import jsPDF from 'jspdf';
import * as ___ from 'lodash';
import {OrderService} from '../../../../services/order.service';
import {environment} from "../../../../../environments/environment";
import {SuborderService} from '../../../../services/suborder.service';
import {GLOBAL_CONFIGS} from "../../../../../environments/global_config";
import {PaymentAddressService} from "../../../../services/payment-address.service";

@Component({
    selector: 'app-brand-read',
    templateUrl: './Order-read.component.html',
    styleUrls: ['./Order-read.component.css']
})
export class OrderReadComponent implements OnInit, OnDestroy {
    sub: Subscription;
    orderSub: Subscription;
    id: number;
    data: any;
    IMAGE_ENDPOINT = environment.IMAGE_ENDPOINT;
    currentDate: any;
    order: any;
    payment: any;
    paymentAddress: any;
    shippingAddress: any;
    suborderItems: any;
    suborders: any[] = [];
    options: any;
    _isSpinning = true;

    userPhone: string = "";

    constructor(private route: ActivatedRoute,
                private _notification: NzNotificationService,
                private orderService: OrderService,
                private suborderService: SuborderService,
                private paymentAddressService: PaymentAddressService) {
    }

    // init the component
    ngOnInit() {
        this.options = GLOBAL_CONFIGS.ORDER_STATUSES_KEY_VALUE;
        this.currentDate = Date();
        this.sub = this.route.params.subscribe(params => {
            this.id = +params['id']; // (+) converts string 'id' to a number
            console.log(' this.id',  this.id);

           this.orderSub = this.orderService.getById(this.id)
                .subscribe(order => {

                    this.data = order;

                    console.log('this.orderService.getById(this.id)',  this.data);

                    if (this.data.user_id && this.data.user_id) {
                        this.userPhone = this.data.user_id.phone;
                    }
                    for (let i = 0; i < order.suborders.length; i++) {
                        this.suborderService.getById(order.suborders[i].id).subscribe(suborder => {
                            this.suborders.push(suborder);
                        });
                    }

                    if (order && typeof order.payment !== 'undefined' && order.payment.length > 0) {
                        this.payment = order.payment[0];
                        if (this.payment.payment_type === 'SSLCommerce') {
                            this.payment.details = JSON.parse(this.payment.details);
                        }
                    }
                    if (order && typeof order.billing_address !== 'undefined' && order.billing_address.id !== 75) {
                        this.paymentAddressService.getById(this.data.billing_address.id).subscribe(paymentAddress => {
                            this.paymentAddress = paymentAddress;
                        });
                    }
                    if (order && typeof order.shipping_address !== 'undefined' && order.shipping_address.id !== 75) {
                        this.paymentAddressService.getById(this.data.shipping_address.id).subscribe(shippingAddress => {
                            this.shippingAddress = shippingAddress;
                        });
                    }

                    console.log('this.data', this.data, this.suborders);
                    this._isSpinning = false;
                }, (err) => {
                    console.log('err', err);
                    this._isSpinning = false;
                });
        }, (err) => {
            console.log('err', err);
            this._isSpinning = false;
        });
    }

    ngOnDestroy(): void {
        this.sub ? this.sub.unsubscribe() : '';
        this.orderSub ? this.orderSub.unsubscribe() : '';

    }

    //Method for get PDF

    getPDF() {
        let printContents = document.getElementById('print-section').innerHTML;
        console.log(printContents);

        let cop = `
      <html>
        <head>
          <title>Print tab</title>
          <style>
          //........Customized style.......
          </style>
        </head>
    <body onload="window.print();window.close()">${printContents}</body>
      </html>`;

        var specialElementHandlers = {
            '#editor': function (element, renderer) {
                return true;
            },
            '.controls': function (element, renderer) {
                return true;
            }
        };
        let doc = new jsPDF();
        doc.fromHTML(cop, 15, 15, {
            'width': 170,
            'elementHandlers': specialElementHandlers
        })
        doc.save('Test.pdf');
    }

    couponCodeGenerator(couponProductCodes, suborderItemId) {
        return couponProductCodes.filter(code => {
            return code.suborder_item_id == suborderItemId;
        }).map((code) => {
            return '1' + ___.padStart(code.id, 6, '0')
        }).join(',');
    }
}
