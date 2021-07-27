import {ChangeDetectorRef, Component, OnInit, AfterViewInit, NgZone} from '@angular/core';
import {ActivatedRoute, Router} from "@angular/router";
import {Subscription} from "rxjs/Subscription";
import * as ___ from 'lodash';
import * as jspdf from 'jspdf';
import * as html2canvas from "html2canvas";
import {AppSettings} from "../../../../config/app.config";
import {
    AreaService, AuthService,
    GlobalConfigService,
    OrderService,
    SuborderItemService,
    SuborderService
} from "../../../../services";
import {PaymentService} from "../../../../services/payment.service";
import {PaymentAddressService} from "../../../../services/payment-address.service";
import {ShippingAddressService} from "../../../../services/shipping-address.service";
import * as _moment from 'moment';
import {BsModalRef} from "ngx-bootstrap/modal/bs-modal-ref.service";
import {BsModalService} from "ngx-bootstrap/modal";
import {PartialPaymentModalService} from "../../../../services/ui/partial-payment-modal.service";
import {ORDER_STATUSES, ORDER_TYPE, PAYMENT_METHODS, PAYMENT_STATUS, PAYMENT_APPROVAL_STATUS, OFFLINE_PAYMENT_METHODS} from '../../../../../environments/global_config';
import {forkJoin} from "rxjs/observable/forkJoin";
import {QueryMessageModalComponent} from "../query-message-modal/query-message-modal.component";
import {LoaderService} from "../../../../services/ui/loader.service";
import {NotificationsService} from "angular2-notifications";

@Component({
    selector: 'order-invoice',
    templateUrl: './order-invoice.component.html',
    styleUrls: ['./order-invoice.component.scss']
})
export class OrderInvoiceComponent implements OnInit, AfterViewInit {

    sub: Subscription;
    id: number;
    data: any;
    IMAGE_ENDPOINT = AppSettings.IMAGE_ENDPOINT;
    currentDate: any;
    order: any;
    payment: any;
    paymentDetails: any;
    paymentAddress: any;
    shippingAddress: any;
    // suborderItems: any;
    suborders: any[] = [];
    suborderItems: any[] = [];

    ORDER_TYPE: any = ORDER_TYPE;
    PAYMENT_STATUS: any = PAYMENT_STATUS;
    PAYMENT_APPROVAL_STATUS = PAYMENT_APPROVAL_STATUS;
    OFFLINE_PAYMENT_METHODS = OFFLINE_PAYMENT_METHODS;

    allRemainingTime: any[] = [];
    globalPartialPaymentDuration: number;
    isAllowedForPay: boolean = true;

    allPaymentsLog: any;
    paymentGatewayErrorModalRef: BsModalRef;
    successOrderId: any = false;

    PAYMENT_METHODS = PAYMENT_METHODS;
    moneyReceiptModalRef: BsModalRef;

    currentMoneyReceiptToShow: any = '';

    constructor(private route: ActivatedRoute,
                private suborderService: SuborderService,
                private orderService: OrderService,
                private areaService: AreaService,
                private suborderItemService: SuborderItemService,
                private paymentService: PaymentService,
                private paymentAddressService: PaymentAddressService,
                private shippingAddressService: ShippingAddressService,
                private partialPaymentModalService: PartialPaymentModalService,
                private globalCongigService: GlobalConfigService,
                private modalService: BsModalService,
                public loaderService: LoaderService,
                private cdr: ChangeDetectorRef,
                private _ngZone: NgZone,
                private _notify: NotificationsService,
                private router: Router,) {
    }

    //Event method for getting all the data for the page
    ngOnInit() {
        this.currentDate = Date();
        this.sub = this.route.params.subscribe(params => {
            this.id = +params['id']; // (+) converts string 'id' to a number

            this.orderService.getOrderInvoiceData(this.id)
                .subscribe(data => {
                    let order = data.orders;
                    let configData = data.configData;
                    let payments = data.payments;

                    let now = _moment(new Date());
                    let createdAt = _moment(order.createdAt);
                    let duration = _moment.duration(now.diff(createdAt));
                    let expendedHour = Math.floor(duration.asHours());

                    this.data = order;
                    this.data.createdAt = _moment(this.data.createdAt).format('MM-DD-YYYY');
                    this.payment = this.data.payment[0];
                    if (this.data.payment[0] && this.data.payment[0].details) {
                        this.paymentDetails = JSON.parse(this.data.payment[0].details);
                    }
                    // this.suborders = order[0].suborders;
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
                        /*console.log('this.shippingAddress', this.shippingAddress)*/
                        this.shippingAddress = shippingAddress;
                    });

                    /*console.log('order', this.data);
                    console.log('payment', this.payment);*/

                    this.globalPartialPaymentDuration = configData.partial_payment_duration;

                    this.isAllowedForPay = this.globalPartialPaymentDuration >= expendedHour && order.status != ORDER_STATUSES.CANCELED_ORDER
                        && order.payment_status != PAYMENT_STATUS.PAID && order.payment_status != PAYMENT_STATUS.NOT_APPLICABLE
                        && order.paid_amount < order.total_price && this.data.order_type == ORDER_TYPE.PARTIAL_PAYMENT_ORDER;

                    this.allPaymentsLog = payments;
                    this.allPaymentsLog.forEach(data => {
                        data.details = JSON.parse(data.details);
                        data.createdAt = _moment(this.data.createdAt).format('MM-DD-YYYY');
                        return data;
                    });
                }, error => {
                    console.log("annnndd: ", error.error);
                    if(error.error && error.error.code && error.error.code === "userIdMissMatched"){
                        this._notify.info("User Id not matched.", error.error.message);
                        this.router.navigate(['profile/orders']);
                    } else {
                        this._notify.error("Error occurred", error.error.message);
                    }
                })
        });
    }

    private openPaymentGatewayModal(message) {
        this.paymentGatewayErrorModalRef = this.modalService.show(QueryMessageModalComponent, {});
        this.paymentGatewayErrorModalRef.content.title = 'Payment has been failed';
        this.paymentGatewayErrorModalRef.content.message = message;
    }

    ngAfterViewInit() {
        this.loaderService.hideLoader();

        let queryParams = this.route.snapshot.queryParams;

        if (queryParams['order']) {
            this.successOrderId = queryParams['order'];
        } else if (queryParams['bKashError']) {
            setTimeout(() => {
                this.openPaymentGatewayModal(queryParams['bKashError']);
                this.cdr.detectChanges();
            }, 500);
        } else if (queryParams['sslCommerzError']) {
            setTimeout(() => {
                this.openPaymentGatewayModal(queryParams['sslCommerzError']);
                this.cdr.detectChanges();
            }, 500);
        } else if (queryParams['bkashURL']) {
            window.location.href = queryParams['bkashURL'];
        }
    }

    //Method for save and download pdf

    public SavePDF(data: HTMLElement) {
        this.loaderService.showLoader();
        // let data = document.getElementById('content');

        this._ngZone.runOutsideAngular(() => {
            html2canvas(data)
                .then(canvas => {
                    let imgWidth = 178;
                    let pageHeight = 295;
                    let imgHeight = canvas.height * imgWidth / canvas.width;
                    let heightLeft = imgHeight;
                    let y = 0;

                    const contentDataURL = canvas.toDataURL('image/png')
                    let pdf = new jspdf('p', 'mm', 'a4'); // A4 size page of PDF
                    heightLeft -= pageHeight;
                    pdf.addImage(contentDataURL, 'PNG', 15, 15, imgWidth, imgHeight);
                    while (heightLeft >= 0) {
                        y = heightLeft - imgHeight;
                        pdf.addPage();
                        pdf.addImage(contentDataURL, 'PNG', 15, y, imgWidth, imgHeight);
                        heightLeft -= pageHeight;
                    }
                    pdf.save('invoice.pdf'); // Generated PDF
                    this.loaderService.hideLoader();
                })
                .catch(error => {
                    this.loaderService.hideLoader();
                    console.log("Error occurred!", error);
                });
        });


    }

    /** Make payment payment for the order */
    makePartialPayment() {
        this.partialPaymentModalService.showPartialModal(true, this.data.id);
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

    isAddModalVisible(modalContent, moneyReceipt) {
        this.currentMoneyReceiptToShow = moneyReceipt;
        this.moneyReceiptModalRef = this.modalService.show(modalContent);
    }
}

