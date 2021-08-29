import {Component, Input, OnInit, ViewChild} from '@angular/core';
import {Observable} from "rxjs/Rx";
import {PartialPaymentModalService} from "../../../../services/ui/partial-payment-modal.service";
import {ModalDirective} from "ngx-bootstrap";
import {FormBuilder, FormGroup, Validators} from "@angular/forms";
import {GLOBAL_CONFIGS, PAYMENT_METHODS} from "../../../../../environments/global_config";
import {Subscription} from "rxjs/Subscription";
import {Offer, User} from "../../../../models";
import * as fromStore from "../../../../state-management";
import {Store} from "@ngrx/store";
import {OrderService, ProductService} from "../../../../services";
import * as _ from "lodash";
import {NotificationsService} from "angular2-notifications";
import {forkJoin} from "rxjs/observable/forkJoin";
import {LoaderService} from "../../../../services/ui/loader.service";
import {BkashService} from "../../../../services/bkash.service";
import {BsModalRef} from "ngx-bootstrap/modal/bs-modal-ref.service";
import {BsModalService} from "ngx-bootstrap/modal";
import {AppSettings} from "../../../../config/app.config";
import {ToastrService} from "ngx-toastr";
import {Router} from "@angular/router";
import {FileHolder, UploadMetadata} from "angular2-image-upload";
import {DesignimageService} from "../../../../services/designimage.service";

@Component({
    selector: 'app-partial-payment-modal',
    templateUrl: './partial-payment-modal.component.html',
    styleUrls: ['./partial-payment-modal.component.scss']
})
export class PartialPaymentModalComponent implements OnInit {

    @ViewChild('autoShownModal') autoShownModal: ModalDirective;
    isModalShown$: Observable<boolean>;
    partialPaymentForm: FormGroup;
    enabledPaymentMethods = GLOBAL_CONFIGS.activePaymentMethods;

    IMAGE_ENDPOINT = AppSettings.IMAGE_ENDPOINT;
    CASHBACK_PAYMENT_TYPE = PAYMENT_METHODS.CASHBACK_PAYMENT_TYPE;
    SSL_COMMERZ_PAYMENT_TYPE = PAYMENT_METHODS.SSL_COMMERZ_PAYMENT_TYPE;
    BKASH_PAYMENT_TYPE = PAYMENT_METHODS.BKASH_PAYMENT_TYPE;
    NAGAD_PAYMENT_TYPE = PAYMENT_METHODS.NAGAD_PAYMENT_TYPE;
    OFFLINE_PAYMENT_TYPE = PAYMENT_METHODS.OFFLINE_PAYMENT_TYPE;
    private bKashTestUsers: any = GLOBAL_CONFIGS.bkashTestUsers;
    private nagadTestUsers: any = GLOBAL_CONFIGS.nagadTestUsers;
    private partialMinimumFirstPaymentAmount :any = GLOBAL_CONFIGS.partialMinimumFirstPaymentAmount;

    couponCashbackAmount: number = 0;
    currentUser$: Observable<User>;
    user_id: any;

    showBkashPayment: boolean = false;
    showNagadPayment: boolean = false;

    paymentAmount: any = null;
    amountToPay: number;
    orderTotalPrice: number;
    paidAmount: number = 0;

    private currentUser: User;
    private currentOrderId: number;

    authUserWallets: any;
    bKashWalletModalRef: BsModalRef;

    isOfflinePayable: boolean = false;
    isShowOfflineForm: boolean = false;
    orderItems: any[] = [];

    isShowCashInAdvanceForm: boolean = false;
    isShowBankTransferForm: boolean = false;
    isBankDeposit: boolean = false;
    isMobileTransfer: boolean = false;

    ImageFile = [];
    storeImageFileName: File[] = [];
    showImageMissingValidation: boolean = false;

    isSubmittedOfflinePaymentForm: boolean = false;
    isSubmittedCashInAdvanceImage: boolean = false;
    isSubmittedBankTransferForm: boolean = false;
    isSubmittedBankDepositForm: boolean = false;
    isSubmittedMobileTransferForm: boolean = false;

    offer$: Observable<Offer>;
    offerData: any;

    /** Offer payment gateway variables */
    isAllowedSslCommerzInOfferedProductPurchase = true;
    isAllowedBkashInOfferedProductPurchase = true;
    isAllowedOfflineInOfferedProductPurchase = true;
    isAllowedNagadInOfferedProductPurchase = true;

    isAllowedOfferPaymentGateway = false;

    constructor(
        private partialPaymentModalService: PartialPaymentModalService,
        private fb: FormBuilder,
        private store: Store<fromStore.HomeState>,
        private orderService: OrderService,
        private _notify: NotificationsService,
        private loaderService: LoaderService,
        private bKashService: BkashService,
        private modalService: BsModalService,
        private toastr: ToastrService,
        private router: Router,
        private productService: ProductService,
        private designImagesService: DesignimageService
    ) {
    }

    ngOnInit() {
        this.partialPaymentForm = this.fb.group({
            offlinePaymentMethods: ['', []],
            transactionIdForBank: ['', []],
            bankName: ['', []],
            branchName: ['', []],
            accountNumberForBank: ['', []],

            payment_method: ['SSLCommerce', [Validators.required]],
            amount_to_pay: ['', [Validators.required]]
        });

        this.partialPaymentModalService.getPartialModalInfo()
            .subscribe(data => {
                this.currentOrderId = data;

                if (!_.isUndefined(this.currentOrderId) && !_.isNull(this.currentOrderId)) {

                    forkJoin([this.orderService.getById(this.currentOrderId), this.orderService.getAllProductsByOrderId(this.currentOrderId)])

                        .subscribe(data => {
                            this.isOfflinePayable = false;
                            this.orderTotalPrice = data[0].total_price;
                            this.amountToPay = data[0].total_price - data[0].paid_amount;
                            this.paidAmount = data[0].paid_amount;
                            this.orderItems = data[1];
                            console.log("this.orderItems: ", this.orderItems);
                            this.orderItems.forEach(item => {
                                if (item.offline_payment) {
                                    this.isOfflinePayable = true;
                                }

                                if(item.offered_product && item.offered_product == true){
                                    if(item.pay_by_sslcommerz || item.pay_by_bKash || item.pay_by_offline || item.pay_by_nagad){
                                        this.isAllowedOfferPaymentGateway = true;
                                    }
                                    if(!item.pay_by_sslcommerz){
                                        this.isAllowedSslCommerzInOfferedProductPurchase = false;
                                    }
                                    if(!item.pay_by_bKash){
                                        this.isAllowedBkashInOfferedProductPurchase = false;
                                    }
                                    if(!item.pay_by_offline){
                                        this.isAllowedOfflineInOfferedProductPurchase = false;
                                    }
                                    if(!item.pay_by_nagad){
                                        this.isAllowedNagadInOfferedProductPurchase = false;
                                    }
                                }
                            })
                            this.getPartialPaymentModalInfo();
                        });
                }
            })

        this.currentUser$ = this.store.select<any>(fromStore.getCurrentUser);

        this.currentUser$.subscribe((user) => {
            this.currentUser = user;
            if (this.currentUser) {
                this.user_id = this.currentUser.id;
                if (this.currentUser.couponLotteryCashback && this.currentUser.couponLotteryCashback.length > 0) {
                    this.couponCashbackAmount = parseFloat(this.currentUser.couponLotteryCashback[0].amount);
                }
                this.showBkashPayment = this.bKashTestUsers.find((userId) => this.user_id == userId);
                this.showNagadPayment = this.nagadTestUsers.find((userId) => this.user_id == userId);
            } else {
                this.user_id = null;
            }
        }, () => {
            this.user_id = null;
        });
    }

    getPartialPaymentModalInfo(): void {
        this.isModalShown$ = this.partialPaymentModalService.currentPartialPaymentInfo;
    }

    onHidden(): void {
        this.partialPaymentModalService.showPartialModal(false, this.currentOrderId);
    }

    hideModal(): void {
        this.autoShownModal.hide();
    }

    makePartialPayment(value, modalTemplate) {
        if (_.isUndefined(value.amount_to_pay) || _.isNull(value.amount_to_pay) || value.amount_to_pay <= 0) {
            this._notify.error('Please insert a correct amount to pay');
            return false;
        }
        if (_.isUndefined(value.payment_method) || _.isNull(value.payment_method)) {
            this._notify.error('Please choose a payment method to complete partial payment');
            return false;
        }
        if (_.isUndefined(this.currentOrderId) || _.isNull(value.currentOrderId)) {
            this._notify.error('Order not found!');
            return false;
        }
        if (value.amount_to_pay > this.amountToPay) {
            this._notify.error('Payment amount is larger than due amount!');
            return false;
        }

        /** Partial First minimum payment at least 2000 Tk. */
        if(!_.isUndefined(value.amount_to_pay) && !_.isNull(value.amount_to_pay) && this.paidAmount == 0 && this.orderTotalPrice >= this.partialMinimumFirstPaymentAmount){
            if(value.amount_to_pay < this.partialMinimumFirstPaymentAmount){
                this._notify.error(`You have to pay at least ${this.partialMinimumFirstPaymentAmount} BDT for first partial payment!`);
                return false;
            }
        }
        if(!_.isUndefined(value.amount_to_pay) && !_.isNull(value.amount_to_pay) && this.paidAmount == 0 && this.orderTotalPrice < this.partialMinimumFirstPaymentAmount){
            if(value.amount_to_pay < this.orderTotalPrice){
                this._notify.error(`You have to pay full amount as order total amount is less than ${this.partialMinimumFirstPaymentAmount} BDT!`);
                return false;
            }
        }
        /** Partial First payment at least 1000 Tk. END. */

        this.loaderService.showLoader();
        if (value.payment_method === this.BKASH_PAYMENT_TYPE) {
            this.bKashService.getAuthUserWallets()
                .subscribe((res) => {
                    console.log(res);
                    this.authUserWallets = res;
                    this.loaderService.hideLoader();
                    this.bKashWalletModalRef = this.modalService.show(modalTemplate);
                }, (err) => {
                    console.log(err);
                    this.loaderService.hideLoader();
                });
            this.onHidden();

        } else if (value.payment_method === this.SSL_COMMERZ_PAYMENT_TYPE) {
            this.orderService.makePartialPayment(this.currentOrderId, value)
                .subscribe(result => {
                    this.onHidden();
                    this.loaderService.hideLoader();
                    if (result && result.GatewayPageURL) {
                        console.log('ssl response', result);
                        window.location.href = result.GatewayPageURL;
                    } else {
                        console.log('No gateway page to redirect');
                    }
                }, error => {
                    this.onHidden();
                    this.loaderService.hideLoader();
                    console.log('ssl response with error', error);
                    this._notify.error('Error occurred while making partial payment!', error);
                })
        }  else if (value.payment_method === this.NAGAD_PAYMENT_TYPE) {
            this.orderService.makePartialPayment(this.currentOrderId, value)
                .subscribe(result => {
                    this.onHidden();
                    this.loaderService.hideLoader();
                    if (result && result.status === 'Success' && result.callBackUrl) {
                        console.log('ssl response', result);
                        window.location.href = result.callBackUrl;
                    } else {
                        console.log('No gateway page to redirect');
                        this._notify.error('Error occurred while Nagad payment gateway initialization!');
                    }
                }, error => {
                    this.onHidden();
                    this.loaderService.hideLoader();
                    console.log('ssl response with error', error);
                    this._notify.error('Error occurred while making partial payment!', error);
                })
        } else if (value.payment_method === this.CASHBACK_PAYMENT_TYPE) {

            this.orderService.makePartialPayment(this.currentOrderId, value)
                .subscribe(data => {
                    console.log("Successfully paid", data);
                    this.onHidden();
                    this.loaderService.hideLoader();
                    this._notify.success('You have successfully paid.');
                    this.router.navigate(['/profile/orders/invoice/', this.currentOrderId]);
                }, error => {
                    console.log("Error occurred", error);
                    this.onHidden();
                    this.loaderService.hideLoader();
                })
        }
        else if (value.payment_method === this.OFFLINE_PAYMENT_TYPE) {
            this.isSubmittedOfflinePaymentForm = true;

            /** Add validation for offline-payment */
            if(this.ImageFile.length <= 0){
                this._notify.error('No money receipt uploaded!');
                this.loaderService.hideLoader();
                this.showImageMissingValidation = true;
                return false;
            }
            /** END Validation */

            const formData: FormData = new FormData();
            formData.append('amount_to_pay', value.amount_to_pay);
            formData.append('payment_method', this.OFFLINE_PAYMENT_TYPE);

            this.ImageFile = this.ImageFile.map(image => image.split(this.IMAGE_ENDPOINT)[1]);
            formData.append('image', JSON.stringify(this.ImageFile));

            this.orderService.makePartialPayment(this.currentOrderId, formData)
                .subscribe(data => {
                    console.log("Successfully paid", data);
                    this.onHidden();
                    this.loaderService.hideLoader();
                    this._notify.success('You have successfully paid.');
                    this.router.navigate(['/profile/orders/invoice/', this.currentOrderId]);
                }, error => {
                    console.log("Error occurred", error);
                    this.onHidden();
                    this.loaderService.hideLoader();
                })
        }
    }

    proceedWithBkash($event, value, authUserWallet = null) {
        $event.preventDefault();
        let requestPayload: any = Object.assign({}, value);
        console.log('selected auth wallet', authUserWallet);

        if (authUserWallet) {
            requestPayload.agreement_id = authUserWallet.agreement_id;
            requestPayload.payerReference = authUserWallet.wallet_no;

        } else {
            this.toastr.error("Please choose a bkash wallet to proceed.", "Error", {
                positionClass: 'toast-bottom-right'
            });
            return false;
        }

        console.log('partialPaymentForm', this.currentOrderId, requestPayload);

        this.orderService.makePartialPayment(this.currentOrderId, requestPayload)
            .subscribe(result => {
                this.loaderService.hideLoader();
                if (result && result.bkashURL) {
                    window.location.href = result.bkashURL;
                } else {
                    this.toastr.error("Problem in placing your order.", "Problem", {
                        positionClass: 'toast-bottom-right'
                    });
                }
            }, error => {
                this.loaderService.hideLoader();
                console.log('bKash place order ', error);
                if (error && error.error) {
                    this.toastr.error(error.error, "Problem", {
                        positionClass: 'toast-bottom-right'
                    });
                } else {
                    this.toastr.error("Problem in placing your order.", "Problem", {
                        positionClass: 'toast-bottom-right'
                    });
                }
            })
    }

    showOfflineForm(flag) {
        this.isShowOfflineForm = flag;
    }

    showOfflinePaymentMethods(isCashInAdvance, isBank, isbanlkDeposit, isMobileTransfer) {
        this.isShowCashInAdvanceForm = isCashInAdvance;
        this.isShowBankTransferForm = isBank;
        this.isBankDeposit = isbanlkDeposit;
        this.isMobileTransfer = isMobileTransfer
    }

    getPartialPaymentFormControl(type) {
        return this.partialPaymentForm.controls[type];
    }

    onRemoved(file: FileHolder) {
        if(this.ImageFile.length > 0){
            let imagePath = this.ImageFile[this.storeImageFileName.findIndex(e => e.name === file.file.name)];


            let formData = new FormData();
            formData.append('oldImagePath', `${imagePath.split(this.IMAGE_ENDPOINT)[1]}`);

            this.designImagesService.deleteImage(formData)
                .subscribe(data => {
                    this.ImageFile.splice(this.storeImageFileName.findIndex(e => e.name === file.file.name), 1);
                    this.storeImageFileName.splice(this.storeImageFileName.findIndex(e => e.name === file.file.name), 1);
                    if(this.ImageFile.length <= 0){
                        this.showImageMissingValidation = true;
                    }
                    this.toastr.success("Successfully deleted image", "Success!", {});

                }, error => {
                    console.log("Error occurred: ", error);
                    this.toastr.error("Error occurred while deleting image", "Error!", {});
                })
        }
    }

    onBeforeUpload = (metadata: UploadMetadata) => {
        let formData = new FormData();
        formData.append('image', metadata.file, metadata.file.name);

        this.designImagesService.insertImage(formData)
            .subscribe(data => {
                this.ImageFile.push(this.IMAGE_ENDPOINT + data.path);
                this.storeImageFileName.push(metadata.file);
                this.showImageMissingValidation = false;
                this.toastr.success("Successfully uploaded image", "Success!", {});
            }, error => {
                console.log("Error occurred: ", error);
                this.toastr.error("Unstable Internet connection while uploading image", "Error!", {});
            })
        return metadata;
    };
}
