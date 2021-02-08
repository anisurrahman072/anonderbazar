import {Component, OnInit} from '@angular/core';
import {ActivatedRoute} from "@angular/router";
import {Subscription} from "rxjs/Subscription";
import * as ___ from 'lodash';
import * as jspdf from 'jspdf';
import * as html2canvas from "html2canvas";
import {AppSettings} from "../../../../config/app.config";
import {AreaService, OrderService, SuborderItemService, SuborderService} from "../../../../services";
import {PaymentService} from "../../../../services/payment.service";
import {PaymentAddressService} from "../../../../services/payment-address.service";
import {ShippingAddressService} from "../../../../services/shipping-address.service";

@Component({
    selector: 'order-invoice',
    templateUrl: './order-invoice.component.html',
    styleUrls: ['./order-invoice.component.scss']
})
export class OrderInvoiceComponent implements OnInit {

    sub: Subscription;
    id: number;
    data: any;
    IMAGE_ENDPOINT = AppSettings.IMAGE_ENDPOINT;
    currentDate: any;
    order: any;
    payment: any;
    paymentAddress: any;
    shippingAddress: any;
    // suborderItems: any;
    suborders: any[] = [];
    suborderItems: any[] = [];

    constructor(private route: ActivatedRoute,
                private suborderService: SuborderService,
                private orderService: OrderService,
                private areaService: AreaService,
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
            this.orderService.getById(this.id)
                .subscribe(order => {
                    this.data = order;
                    this.payment = this.data.payment[0];
                    // this.suborders = order.suborders;
                    for (let i = 0; i < order.suborders.length; i++) {
                        this.suborderService.getById(order.suborders[i].id).subscribe(suborder => {
                            this.suborders.push(suborder);
                            this.suborderItems.push(...suborder.suborderItems);
                        });
                    }
                    this.paymentAddressService.getById(this.data.billing_address.id).subscribe(paymentAddress => {
                        this.paymentAddress = paymentAddress;
                    });
                    this.paymentAddressService.getById(this.data.shipping_address.id).subscribe(shippingAddress => {
                        console.log('this.shippingAddress', this.shippingAddress)
                        this.shippingAddress = shippingAddress;
                    });

                    console.log('order', this.data);
                    console.log('payment', this.payment);
                });
        });
    }

    //Method for save and download pdf

    public SavePDF() {
        var data = document.getElementById('content');
        html2canvas(data).then(canvas => {
            var imgWidth = 178;
            var pageHeight = 295;
            var imgHeight = canvas.height * imgWidth / canvas.width;
            var heightLeft = imgHeight;

            const contentDataURL = canvas.toDataURL('image/png')
            let pdf = new jspdf('p', 'mm', 'a4'); // A4 size page of PDF
            pdf.addImage(contentDataURL, 'PNG', 15, 15, imgWidth, imgHeight)
            pdf.save('invoice.pdf'); // Generated PDF
        });
    }

    ngOnDestroy(): void {
        this.sub ? this.sub.unsubscribe() : '';

    }

    couponCodeGenerator(couponProductCodes, suborderItemId) {
        return couponProductCodes.filter(code => {
            return code.suborder_item_id == suborderItemId;
        }).map((code) => {
            return '1' + ___.padStart(code.id, 6, '0')
        }).join(',');
    }
}

