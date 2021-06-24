import {Component, OnDestroy, OnInit, NgZone} from '@angular/core';
import {forkJoin, Subscription} from 'rxjs';
import {NzNotificationService} from 'ng-zorro-antd';
import {ActivatedRoute} from '@angular/router';
import * as html2canvas from "html2canvas";
import * as jsPDF from 'jspdf';
import * as ___ from 'lodash';
import {OrderService} from '../../../../services/order.service';
import {environment} from "../../../../../environments/environment";
import {SuborderService} from '../../../../services/suborder.service';
import {GLOBAL_CONFIGS, PAYMENT_METHODS} from "../../../../../environments/global_config";
import {PaymentAddressService} from "../../../../services/payment-address.service";
import * as _moment from 'moment';
// import en from "@angular/common/locales/en";
import {PaymentService} from "../../../../services/payment.service";

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
    otherImageExtension = environment.otherImageExtension;
    currentDate: any;
    order: any;
    payment: any;
    paymentDetails: any;
    paymentAddress: any;
    shippingAddress: any;
    suborderItems: any;
    suborders: any[] = [];
    options: any;
    _isSpinning = true;

    userPhone: string = "";
    PAYMENT_METHODS = PAYMENT_METHODS;
    isAddModalVisible: boolean = false;

    allPaymentsLog: any;

    constructor(private route: ActivatedRoute,
                private _notification: NzNotificationService,
                private orderService: OrderService,
                private suborderService: SuborderService,
                private paymentAddressService: PaymentAddressService,
                private paymentService: PaymentService,
                private _ngZone: NgZone) {
    }

    // init the component
    ngOnInit() {
        this.options = GLOBAL_CONFIGS.ORDER_STATUSES_KEY_VALUE;
        this.currentDate = Date();
        this.sub = this.route.params.subscribe(params => {
            this.id = +params['id']; // (+) converts string 'id' to a number
            console.log(' this.id', this.id);

            forkJoin([this.orderService.getById(this.id), this.paymentService.getByOrderId(this.id)])
                .subscribe(data => {

                    this.data = data[0];
                    this.data.createdAt = _moment(this.data.createdAt).format('MM-DD-YYYY');

                    console.log('this.orderService.getById(this.id)', this.data);

                    if (this.data.user_id && this.data.user_id) {
                        this.userPhone = this.data.user_id.phone;
                    }
                    for (let i = 0; i < data[0].suborders.length; i++) {
                        this.suborderService.getById(data[0].suborders[i].id).subscribe(suborder => {
                            this.suborders.push(suborder);
                        });
                    }

                    if (data[0] && typeof data[0].payment !== 'undefined' && data[0].payment.length > 0) {
                        this.payment = data[0].payment[0];
                        this.paymentDetails = JSON.parse(data[0].payment[0].details);
                        if (this.payment.payment_type === 'SSLCommerce') {
                            this.payment.details = JSON.parse(this.payment.details);
                        }
                    }
                    if (data[0] && typeof data[0].billing_address !== 'undefined' && data[0].billing_address.id !== 75) {
                        this.paymentAddressService.getById(this.data.billing_address.id).subscribe(paymentAddress => {
                            this.paymentAddress = paymentAddress;
                        });
                    }
                    if (data[0] && typeof data[0].shipping_address !== 'undefined' && data[0].shipping_address.id !== 75) {
                        this.paymentAddressService.getById(this.data.shipping_address.id).subscribe(shippingAddress => {
                            this.shippingAddress = shippingAddress;
                        });
                    }

                    this.allPaymentsLog = data[1];

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

    // getPDF() {
    //     let printContents = document.getElementById('print-section').innerHTML;
    //     console.log(printContents);
    //
    //     let cop = `
    //       <html>
    //         <head>
    //           <title>Order Details</title>
    //           <style>
    //           //........Customized style.......
    //           </style>
    //         </head>
    //             <body onload="window.print();window.close()">${printContents}</body>
    //       </html>`;
    //
    //     let specialElementHandlers = {
    //         '#editor': function (element, renderer) {
    //             return true;
    //         },
    //         '.controls': function (element, renderer) {
    //             return true;
    //         }
    //     };
    //     let doc = new jsPDF();
    //     doc.fromHTML(cop, 15, 15, {
    //         'width': 170,
    //         'elementHandlers': specialElementHandlers
    //     })
    //     doc.save('Test.pdf');
    // }

    public SavePDF() {
        let data = document.getElementById('printSection');
        this._ngZone.runOutsideAngular(() => {
            html2canvas(data)
                .then(canvas => {
                    let imgWidth = 178;
                    let pageHeight = 295;
                    let imgHeight = canvas.height * imgWidth / canvas.width;
                    let heightLeft = imgHeight;
                    let y = 0;

                    const contentDataURL = canvas.toDataURL('image/png')
                    let pdf = new jsPDF('p', 'mm', 'a4'); // A4 size page of PDF
                    heightLeft -= pageHeight;
                    pdf.addImage(contentDataURL, 'PNG', 15, 15, imgWidth, imgHeight);
                    while (heightLeft >= 0) {
                        y = heightLeft - imgHeight;
                        pdf.addPage();
                        pdf.addImage(contentDataURL, 'PNG', 15, y, imgWidth, imgHeight);
                        heightLeft -= pageHeight;
                    }
                    pdf.save('invoice.pdf'); // Generated PDF
                })
                .catch(error => {
                    console.log("Error occurred!", error);
                });
        });


    }

    couponCodeGenerator(couponProductCodes, suborderItemId) {
        return couponProductCodes.filter(code => {
            return code.suborder_item_id == suborderItemId;
        }).map((code) => {
            return '1' + ___.padStart(code.id, 6, '0')
        }).join(',');
    }

    handleModalCancel = e => {
        this.isAddModalVisible = false;
    };

    handleModalOk = e => {
        this.isAddModalVisible = false;
    };

    showAddModalVisible(flag) {
        this.isAddModalVisible = flag;
    }
}
