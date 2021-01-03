import {Component, OnDestroy, OnInit} from '@angular/core';
import {Subscription} from 'rxjs';
import {NzNotificationService} from 'ng-zorro-antd';
import {ActivatedRoute} from '@angular/router';
import {OrderService} from '../../../../services/order.service';
import {environment} from "../../../../../environments/environment";
import {SuborderService} from '../../../../services/suborder.service';
import {PaymentService} from '../../../../services/payment.service';
import {PaymentAddressService} from '../../../../services/payment-address.service';
import {ShippingAddressService} from '../../../../services/shipping-address.service';
import jsPDF from 'jspdf';

@Component({
    selector: 'app-brand-read',
    templateUrl: './Order-read.component.html',
    styleUrls: ['./Order-read.component.css']
})
export class OrderReadComponent implements OnInit, OnDestroy {
    sub: Subscription;
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
    options: any[];
    constructor(private route: ActivatedRoute,
                private _notification: NzNotificationService,
                private orderService: OrderService,
                private suborderService: SuborderService,
                private suborderItemService: SuborderService,
                private paymentService: PaymentService,
                private paymentAddressService: PaymentAddressService,
                private shippingAddressService: ShippingAddressService) {
    }
 // init the component
    ngOnInit() {
        this.options = [
            { value: 1, label: 'Pending', icon: 'anticon-spin anticon-loading' },
            { value: 2, label: 'Processing', icon: 'anticon-spin anticon-loading' },
            { value: 3, label: 'Prepared', icon: 'anticon-spin anticon-loading' },
            { value: 4, label: 'Departure', icon: 'anticon-spin anticon-loading' },
            { value: 5, label: 'Pickup', icon: 'anticon-spin anticon-loading' },
            { value: 6, label: 'In the Air', icon: 'anticon-spin anticon-loading' },
            { value: 7, label: 'landed', icon: 'anticon-spin anticon-loading' },
            { value: 8, label: 'Arrived At Warehouse', icon: 'anticon-spin anticon-loading' },
            { value: 9, label: 'Shipped', icon: 'anticon-spin anticon-hourglass' },
            { value: 10, label: 'Out For Delivery', icon: 'anticon-check-circle' },
            { value: 11, label: 'Delivered', icon: 'anticon-check-circle' },
            { value: 12, label: 'Canceled', icon: 'anticon-close-circle' }
        ];
        this.currentDate = Date();
        this.sub = this.route.params.subscribe(params => {
            this.id = +params['id']; // (+) converts string 'id' to a number
            this.orderService.getById(this.id)
                .subscribe(order => {
                    this.data = order;
                    for (let i = 0; i < order.suborders.length; i++) {
                        this.suborderService.getById(order.suborders[i].id).subscribe(suborder => {
                            this.suborders.push(suborder);
                        });
                    }
                    this.paymentService.getByOrderId(order.id).subscribe(payment => {
                        this.payment = payment[0];
                    });
                    this.paymentAddressService.getById(this.data.billing_address.id).subscribe(paymentAddress => {
                        this.paymentAddress = paymentAddress;
                    });
                    this.paymentAddressService.getById(this.data.shipping_address.id).subscribe(shippingAddress => {
                        this.shippingAddress = shippingAddress;
                    });
                });
        });
    }

    ngOnDestroy(): void {
        this.sub ? this.sub.unsubscribe() : '';

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
}
