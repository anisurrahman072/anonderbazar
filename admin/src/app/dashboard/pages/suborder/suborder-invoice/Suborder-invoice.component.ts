import {
    Component,
    ElementRef,
    OnInit,
    ViewChild
} from '@angular/core';
import {SuborderService} from '../../../../services/suborder.service';
import {NzNotificationService} from "ng-zorro-antd";
import {ActivatedRoute} from "@angular/router";
import {Subscription} from "rxjs";
import jsPDF from 'jspdf';
import * as ___ from 'lodash';
import {PaymentService} from "../../../../services/payment.service";
import {PaymentAddressService} from "../../../../services/payment-address.service";
import {OrderService} from "../../../../services/order.service";
import {ShippingAddressService} from "../../../../services/shipping-address.service";
import {SuborderItemService} from "../../../../services/suborder-item.service";
import {environment} from "../../../../../environments/environment";

@Component({
    selector: 'app-warehouse',
    templateUrl: './Suborder-invoice.component.html',
    styleUrls: ['./Suborder-invoice.component.css'],
})
export class SuborderInvoiceComponent implements OnInit {
    @ViewChild('pdfTable') pdfTable: ElementRef;
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

    _isSpinning = true;
    constructor(private route: ActivatedRoute,
                private _notification: NzNotificationService,
                private suborderService: SuborderService,
                private orderService: OrderService,
                private suborderItemService: SuborderItemService,
                private paymentService: PaymentService,
                private paymentAddressService: PaymentAddressService,
                private shippingAddressService: ShippingAddressService) {
    }

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

                        /*
                        this.paymentService.getByOrderId(order.id).subscribe(payment => {
                            this.payment = payment[0];
                             console.log('suborder', this.data);
                            console.log('suborderItems', this.suborderItems);

                            console.log('payment', this.payment);*!/
                        });

                         this.paymentAddressService.getById(order.billing_address.id).subscribe(paymentAddress => {
                            this.paymentAddress = paymentAddress;
                        });
                        this.paymentAddressService.getById(order.shipping_address.id).subscribe(shippingAddress => {
                            this.shippingAddress = shippingAddress;
                        });
                        */
                        if (order && typeof order.payment !== 'undefined' && order.payment.length > 0) {
                            this.payment = order.payment[0];
                            if (this.payment.payment_type === 'SSLCommerce') {
                                this.payment.details = JSON.parse(this.payment.details);
                            }
                        }
                        if (order && typeof order.billing_address !== 'undefined') {
                            this.paymentAddress = order.billing_address;
                        }
                        if (order && typeof order.shipping_address !== 'undefined') {
                            this.shippingAddress = order.shipping_address;
                        }
                        console.log('order', this.order);
                        this._isSpinning = false;
                    });
                }, (err)=> {
                    console.log('err', err);
                    this._isSpinning = false;
                });
        }, (err)=> {
            console.log('err', err);
            this._isSpinning = false;
        });
    }

    getPayment() {

    }

    getPaymentAddress() {

    }

    getShippingAddress() {

    }

    getPRINT() {

        let printContents, popupWin;
        printContents = document.getElementById('print-section').innerHTML;
        popupWin = window.open('', '_blank', 'top=0,left=0,height=100%,width=auto');
        popupWin.document.open();
        popupWin.document.write(`
      <html>
        <head>
          <title>Print tab</title>
          
<style>
 
 
.header-logo img {
    height: 40px;
    width: 100px;
    margin-bottom: 60px;
}

.header-text h4 {
    color: orangered;
    text-transform: capitalize;
    font-weight: 500;
    font-size: 25px;
    margin-top: 20px;
    margin-bottom: 50px;
}

.invoice-inner-left p {
    font-size: 16px;
    text-transform: capitalize;
}

.invoice-inner-right p {
    font-size: 14px;
    text-transform: capitalize;
}

.amount-text p {
    font-size: 14px;
    text-transform: capitalize;
    line-height: 24px;
}

.amount-text h5 {
    font-size: 20px;
    text-transform: capitalize;
    line-height: 24px;

}

.amount-text span {
    font-size: 14px;
    text-transform: capitalize;
    line-height: 24px;
}

.bill-info-left h5 {
     font-size: 18px;
     text-transform: capitalize;
     line-height: 24px;
 }

.bill-info-left p {
    font-size: 14px;
    text-transform: capitalize;
    line-height: 24px;
}

.bill-info-right h5 {
    font-size: 18px;
    text-transform: capitalize;
    line-height: 24px;
}
.bill-info-right p {
    font-size: 14px;
    text-transform: capitalize;
    line-height: 24px;
}

.shopping-info-left h5{
    font-size: 18px;
    text-transform: capitalize;
    line-height: 24px;
}
.shopping-info-left p {
    font-size: 14px;
    text-transform: capitalize;
    line-height: 24px;
}
.shopping-info-right h5{
    font-size: 18px;
    text-transform: capitalize;
    line-height: 24px;
}
.shopping-info-right p {
    font-size: 14px;
    text-transform: capitalize;
    line-height: 24px;
}
.footer{
    font-size: 14px;
    text-transform: capitalize;
    margin-left: 35px;
}
          </style>
        </head>
    <body onload="window.print();window.close()">${printContents}</body>
      </html>`
        );
        popupWin.document.close();

    }


    getPDF() {
        let printContents = document.getElementById('print-section').innerHTML;
        console.log(printContents);

        let cop = `
      <html>
        <head>
          <title>Print tab</title>
          <style>
          .header-logo img {
            width: 100px;
            margin-bottom: 60px;
        }
        
        .header-text h4 {
            color: orangered;
            text-transform: capitalize;
            font-weight: 500;
            font-size: 25px;
            margin-top: 20px;
            margin-bottom: 50px;
        }
        
        .invoice-inner-left p {
            font-size: 16px;
            text-transform: capitalize;
        }
        
        .invoice-inner-right p {
            font-size: 14px;
            text-transform: capitalize;
        }
        
        .amount-text p {
            font-size: 14px;
            text-transform: capitalize;
            line-height: 24px;
        }
        
        .amount-text h5 {
            font-size: 20px;
            text-transform: capitalize;
            line-height: 24px;
        
        }
        
        .amount-text span {
            font-size: 14px;
            text-transform: capitalize;
            line-height: 24px;
        }
        
        .bill-info-left h5 {
             font-size: 18px;
             text-transform: capitalize;
             line-height: 24px;
         }
        
        .bill-info-left p {
            font-size: 14px;
            text-transform: capitalize;
            line-height: 24px;
        }
        
        .bill-info-right h5 {
            font-size: 18px;
            text-transform: capitalize;
            line-height: 24px;
        }
        .bill-info-right p {
            font-size: 14px;
            text-transform: capitalize;
            line-height: 24px;
        }
        
        .shopping-info-left h5{
            font-size: 18px;
            text-transform: capitalize;
            line-height: 24px;
        }
        .shopping-info-left p {
            font-size: 14px;
            text-transform: capitalize;
            line-height: 24px;
        }
        .shopping-info-right h5{
            font-size: 18px;
            text-transform: capitalize;
            line-height: 24px;
        }
        .shopping-info-right p {
            font-size: 14px;
            text-transform: capitalize;
            line-height: 24px;
        }
        .footer{
            font-size: 14px;
            text-transform: capitalize;
            margin-left: 35px;
        }
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
        let doc = new jsPDF('p', 'mm', 'a4');
        doc.fromHTML(cop, 15, 15, {
            'width': 170,
            'elementHandlers': specialElementHandlers
        })
        doc.save('Test.pdf');


    }

    public downloadAsPDF() {
        const doc = new jsPDF();

        const specialElementHandlers = {
            '#editor': function (element, renderer) {
                return true;
            }
        };

        const pdfTable = this.pdfTable.nativeElement;
        let cop = `
        <html>
          <head>
            <title>Print tab</title>
            <style>
            //........Customized style.......
            </style>
          </head>
      <body>${pdfTable.innerHTML}</body>
        </html>`;
        doc.fromHTML(cop, 15, 15, {
            width: 190,
            'elementHandlers': specialElementHandlers
        });

        doc.save('tableToPdf.pdf');
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
