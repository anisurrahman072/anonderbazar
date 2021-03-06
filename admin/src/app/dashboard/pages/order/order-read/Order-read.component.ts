import {Component, OnDestroy, OnInit, NgZone} from '@angular/core';
import {forkJoin, Subscription} from 'rxjs';
import {NzNotificationService} from 'ng-zorro-antd';
import {ActivatedRoute, Router} from '@angular/router';
import * as jsPDF from 'jspdf';
import * as ___ from 'lodash';
import {OrderService} from '../../../../services/order.service';
import {environment} from "../../../../../environments/environment";
import {SuborderService} from '../../../../services/suborder.service';
import {
    GLOBAL_CONFIGS,
    PAYMENT_METHODS,
    ORDER_TYPE,
    OFFLINE_PAYMENT_METHODS
} from "../../../../../environments/global_config";
import {PaymentAddressService} from "../../../../services/payment-address.service";
import * as _moment from 'moment';
import {PaymentService} from "../../../../services/payment.service";
import domtoimage from 'dom-to-image';

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
    ORDER_TYPE = ORDER_TYPE;
    OFFLINE_PAYMENT_METHODS = OFFLINE_PAYMENT_METHODS;
    currentMoneReceipt: any = '';

    ordersGridPageNumber = null;
    ordersGridDate = null;
    ordersGridStatus = null;
    ordersGridPaymentStatus = null;
    ordersGridPaymentType = null;
    ordersGridOrderType = null;
    ordersGridCustomerName = null;
    ordersGridOrderNumber = null;


    constructor(private route: ActivatedRoute,
                private router: Router,
                private _notification: NzNotificationService,
                private orderService: OrderService,
                private suborderService: SuborderService,
                private paymentAddressService: PaymentAddressService,
                private paymentService: PaymentService,
                private _ngZone: NgZone) {
    }

    // init the component
    ngOnInit() {
        this.ordersGridPageNumber = +this.route.snapshot.queryParamMap.get("page");
        this.ordersGridDate = this.route.snapshot.queryParamMap.get("date");
        this.ordersGridStatus = +this.route.snapshot.queryParamMap.get("status");
        this.ordersGridPaymentStatus = +this.route.snapshot.queryParamMap.get("payment_status");
        this.ordersGridPaymentType = this.route.snapshot.queryParamMap.get("payment_type");
        this.ordersGridOrderType = +this.route.snapshot.queryParamMap.get("order_type");
        this.ordersGridCustomerName = this.route.snapshot.queryParamMap.get("customerName");
        this.ordersGridOrderNumber = +this.route.snapshot.queryParamMap.get("orderNumber");

        this.options = GLOBAL_CONFIGS.ORDER_STATUSES_KEY_VALUE;
        this.currentDate = Date();
        this.sub = this.route.params.subscribe(params => {
            this.id = +params['id']; // (+) converts string 'id' to a number
            /*console.log(' this.id', this.id);*/

            this.orderService.getOrderInvoiceData(this.id)
                .subscribe(data => {
                    let order = data.orders;
                    let payments = data.payments;

                    this.data = order;
                    this.data.createdAt = _moment(this.data.createdAt).format('MM-DD-YYYY');

                    /*console.log('this.orderService.getById(this.id)', this.data);*/

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
                        this.paymentDetails = JSON.parse(order.payment[0].details);
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

                    this.allPaymentsLog = payments.map(payment => {
                        payment.details = JSON.parse(payment.details);
                        if(payment.details && payment.details.money_receipt && payment.details.money_receipt.split('[').length > 1){
                            payment.details.moneyReceipts = JSON.parse(payment.details.money_receipt);
                        }
                        return payment;
                    });

                    /*console.log('this.data', this.allPaymentsLog);*/
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



    /*public SavePDF() {
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


    }*/

    public savePDF() {
        let data = document.getElementById('printSection');
        this._ngZone.runOutsideAngular(() => {
            domtoimage.toPng(data)
                .then(dataUrl => {
                    return new Promise(function (resolved, rejected) {
                        const i = new Image()
                        i.onload = function () {
                            resolved({w: i.width, h: i.height, dataUrl: dataUrl})
                        };
                        i.src = dataUrl
                    });
                })
                .then(({w, h, dataUrl}) => {

                    let imgWidth = 178;
                    let pageHeight = 295;
                    let imgHeight = h * imgWidth / w;
                    let heightLeft = imgHeight;
                    let y = 0;

                    let pdf = new jsPDF('p', 'mm', 'a4'); // A4 size page of PDF
                    heightLeft -= pageHeight;
                    pdf.addImage(dataUrl, 'png', 10, 10, imgWidth, imgHeight);
                    while (heightLeft >= 0) {
                        y = heightLeft - imgHeight;
                        pdf.addPage();
                        pdf.addImage(dataUrl, 'PNG', 10, y, imgWidth, imgHeight);
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

    showAddModalVisible(flag, currentMoneyReceipt) {
        this.currentMoneReceipt = currentMoneyReceipt[0] === '/' ? currentMoneyReceipt : ('/'+currentMoneyReceipt);
        this.isAddModalVisible = flag;
    }

    goToOrdersGridPage(){
        let query = {
            page: this.ordersGridPageNumber,
            date: this.ordersGridDate,
            status: this.ordersGridStatus,
            payment_status: this.ordersGridPaymentStatus,
            payment_type: this.ordersGridPaymentType,
            order_type: this.ordersGridOrderType,
            customerName: this.ordersGridCustomerName,
            orderNumber: this.ordersGridOrderNumber
        };
        this.router.navigate(['/dashboard/order'], {queryParams: query});
    }
}
