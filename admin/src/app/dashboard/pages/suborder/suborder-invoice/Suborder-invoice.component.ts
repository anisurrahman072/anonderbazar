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
    @ViewChild('pdfTable') pdfTable: ElementRef;

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
                        this.paymentService.getByOrderId(order.id).subscribe(payment => {
                            this.payment = payment[0];
                        });
                        this.paymentAddressService.getById(order.billing_address.id).subscribe(paymentAddress => {
                            this.paymentAddress = paymentAddress;
                        });
                        this.paymentAddressService.getById(order.shipping_address.id).subscribe(shippingAddress => {
                            this.shippingAddress = shippingAddress;
                        });

                        console.log('suborder', this.data);
                        console.log('suborderItems', this.suborderItems);
                        console.log('order', this.order);
                    });
                });
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

/*@media print
{
table.table1 a:link
{
    color: #666;
    font-weight: bold;
    text-decoration: none;
}
.table1 a:visited
{
    color: #999999;
    font-weight: bold;
    text-decoration: none;
}
.table1 a:active, .table1 a:hover
{
    color: #bd5a35;
    text-decoration: underline;
}
.table1
{
    font-family: Calibri;
    color: Black;
    font-size: 12px;
    text-shadow: 1px 1px 0px #fff;
    background: #eaebec; !*margin:20px;*!
    border: #ccc 1px solid;
    -moz-border-radius: 3px;
    -webkit-border-radius: 3px;
    border-radius: 3px;
    -moz-box-shadow: 0 1px 2px #d1d1d1;
    -webkit-box-shadow: 0 1px 2px #d1d1d1;
    box-shadow: 0 1px 2px #d1d1d1;
}
.table1 th
{
    !*padding:21px 25px 22px 25px;*!
    border-top: 1px solid #fafafa;
    border-bottom: 1px solid #e0e0e0;
    height: 15px;
    font-weight: bold;
    background: #ededed;
    background: -webkit-gradient(linear, left top, left bottom, from(#ededed), to(#ebebeb));
    background: -moz-linear-gradient(top,  #ededed,  #ebebeb);
}
.table1 th:first-child
{
    text-align: left; !*padding-left:20px;*!
}
.table1tr:first-child th:first-child
{
    -moz-border-radius-topleft: 3px;
    -webkit-border-top-left-radius: 3px;
    border-top-left-radius: 3px;
}
.table1 tr:first-child th:last-child
{
    -moz-border-radius-topright: 3px;
    -webkit-border-top-right-radius: 3px;
    border-top-right-radius: 3px;
}
.table1 tr
{
    text-align: left;
    padding-left: 10px;
}
.table1 tr td:first-child
{
    text-align: left;
    padding-left: 10px;
    border-left: 0;
}
.table1 tr td
{
    height: 10px;
    padding: 1px;
    border-top: 1px solid #ffffff;
    border-bottom: 1px solid #e0e0e0;
    border-left: 1px solid #e0e0e0;
    background: #fafafa;
    background: -webkit-gradient(linear, left top, left bottom, from(#fbfbfb), to(#fafafa));
    background: -moz-linear-gradient(top,  #fbfbfb,  #fafafa);
}
.table1 tr.even td
{
    background: #f6f6f6;
    background: -webkit-gradient(linear, left top, left bottom, from(#f8f8f8), to(#f6f6f6));
    background: -moz-linear-gradient(top,  #f8f8f8,  #f6f6f6);
}
.table1 tr:last-child td
{
    border-bottom: 0;
}
.table1 tr:last-child td:first-child
{
    -moz-border-radius-bottomleft: 3px;
    -webkit-border-bottom-left-radius: 3px;
    border-bottom-left-radius: 3px;
}
.table1 tr:last-child td:last-child
{
    -moz-border-radius-bottomright: 3px;
    -webkit-border-bottom-right-radius: 3px;
    border-bottom-right-radius: 3px;
}
.table1 tr:hover td
{
    background: #f2f2f2;
    background: -webkit-gradient(linear, left top, left bottom, from(#f2f2f2), to(#f0f0f0));
    background: -moz-linear-gradient(top,  #f2f2f2,  #f0f0f0);
}

.list
{
    margin-left: 80px;
}

#nonPrintable{display:none;}

}*/

/* //////////////  old  //////////////// */

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
