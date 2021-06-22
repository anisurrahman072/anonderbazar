import {ToastrService} from "ngx-toastr";
import {AfterViewInit, ChangeDetectorRef, Component, OnDestroy, OnInit} from "@angular/core";
import {UserService} from "../../../../services";
import {ActivatedRoute, Router} from "@angular/router";
import {NotificationsService} from "angular2-notifications";
import {BkashService} from "../../../../services/bkash.service";
import {LoaderService} from "../../../../services/ui/loader.service";
import {Observable} from "rxjs";
import {BsModalRef, BsModalService} from "ngx-bootstrap/modal";
import {QueryMessageModalComponent} from "../../../shared/components/query-message-modal/query-message-modal.component";


@Component({
    selector: "my-bkash-accounts",
    templateUrl: "./bKash-account.component.html",
    styleUrls: ["./bKash-account.component.scss"]
})
export class BKashAccountComponent implements OnInit, OnDestroy, AfterViewInit {
    paymentGatewayErrorModalRef: BsModalRef;
    bKashWalletNoToAdd: string = '';

    _spinning: boolean = false;
    isSubmitting: boolean = false;

    canAddAgreement: boolean = false;
    authUserWallets: any;

    bKashGrandToken: string = '';
    agreedToBKashTermsConditions: boolean = false;
    showBKashAgreementTerm: boolean = false;

    isNotAcceptTerms: boolean = false;
    isInvalidWallet: boolean = false;

    constructor(
        private cdr: ChangeDetectorRef,
        private route: ActivatedRoute,
        private bkashService: BkashService,
        private router: Router,
        private userService: UserService,
        private bKashService: BkashService,
        private modalService: BsModalService,
        private _notify: NotificationsService,
        private toastService: ToastrService,
        public loaderService: LoaderService
    ) {
    }

    ngOnInit(): void {
        this.fetchbKashWallets();
    }

    fetchbKashWallets() {
        this.loaderService.showLoader();
        this.bKashService.getAuthUserWallets()
            .subscribe((res) => {
                console.log(res);
                this.authUserWallets = res;
                this.loaderService.hideLoader();
            }, (err) => {
                console.log(err);
                this.loaderService.hideLoader();
            });
    }

    private openPaymentGatewayModal(message, className = 'alert-danger') {
        this.paymentGatewayErrorModalRef = this.modalService.show(QueryMessageModalComponent, {});
        this.paymentGatewayErrorModalRef.content.title = 'Message from Payment Gateway';
        this.paymentGatewayErrorModalRef.content.message = message;
        this.paymentGatewayErrorModalRef.content.alertClass = className;
    }

    ngAfterViewInit() {
        setTimeout(() => {
            let queryParams = this.route.snapshot.queryParams;
            if (queryParams['bKashError']) {
                setTimeout(() => {
                    this.openPaymentGatewayModal(queryParams['bKashError']);
                    this.cdr.detectChanges();
                }, 500);

            } else if (queryParams['bKashSuccess']) {
                setTimeout(() => {
                    this.openPaymentGatewayModal(queryParams['bKashSuccess'], 'alert-success');
                    this.cdr.detectChanges();
                }, 500);
            }

        }, 500);
    }

    ngOnDestroy() {
    }

    onAgreedToBKashTerms(event: any) {
        console.log('onAgreedToBKashTerms', event);
        this.agreedToBKashTermsConditions = event;

    }

    deleteAgreement(event: any, authUserWallet) {
        event.preventDefault();
        event.stopPropagation();

        if (this.bKashGrandToken) {
            if (window.confirm("Are you sure you want to delete this wallet")) {
                this.loaderService.showLoader();
                this.bkashService.cancelAgreement(this.bKashGrandToken, authUserWallet.agreement_id)
                    .subscribe((res: any) => {
                        this.loaderService.hideLoader();
                        this.fetchbKashWallets();
                        this.toastService.success('bKash payment agreement has been successfully cancelled.', 'Success');
                    }, (err) => {
                        console.log(err);
                        this.loaderService.hideLoader();
                        this.toastService.error('Problem in cancelling bKash Payment Agreement.', 'Oppss!');
                    })
            }
        } else {
            if (window.confirm("Are you sure you want to delete this wallet")) {
                this.loaderService.showLoader();
                this.bkashService.generateGrandToken()
                    .concatMap((res: any) => {
                        console.log('generateGrandToken', res);
                        if (res.id_token) {
                            this.bKashGrandToken = res.id_token;
                            return this.bkashService.cancelAgreement(res.id_token, authUserWallet.agreement_id)
                        }
                        return Observable.throw(new Error('Problem in generating token.'));
                    })
                    .subscribe((res: any) => {
                        this.loaderService.hideLoader();
                        this.fetchbKashWallets();
                        this.toastService.success('bKash payment agreement has been successfully cancelled.', 'Success');
                    }, (err) => {
                        console.log(err);
                        this.loaderService.hideLoader();
                        if (err && err.error && err.error.statusMessage) {
                            this.toastService.error(err.error.statusMessage, err.error.statusCode);
                        } else {
                            this.toastService.error('Problem in cancelling bKash Payment Agreement.', 'Oppss!');
                        }
                    })
            }
        }
    }

    createBKashAgreement() {
        let number = this.bKashWalletNoToAdd.replace(/[^0-9]/g,'');
        if(!number || (number && number.length != 11)){
            this.isInvalidWallet = true;
            this.bKashWalletNoToAdd = '';
            return false;
        }
        if (!this.showBKashAgreementTerm) {
            this.showBKashAgreementTerm = true;
            return;
        }
        if (!(this.bKashWalletNoToAdd && this.agreedToBKashTermsConditions)) {
            this.isNotAcceptTerms = true;
            return false;
        }

        console.log(this.bKashWalletNoToAdd);
        this.isSubmitting = true;
        this.loaderService.showLoader();

        this.bkashService.generateGrandToken()
            .concatMap((res: any) => {
                console.log('generateGrandToken', res);
                if (res.id_token) {
                    this.bKashGrandToken = res.id_token;
                    return this.bkashService.createAgreementRequest(res.id_token, this.bKashWalletNoToAdd);
                }
                return Observable.throw(new Error('Problem in generating token.'));
            })
            .subscribe((res: any) => {
                console.log('createBKashAgreement', res);
                this.loaderService.hideLoader();
                this.isSubmitting = false;

                if (res && res.tokenRes && res.tokenRes.bkashURL) {
                    window.location.href = res.tokenRes.bkashURL;
                } else {
                    throw new Error('Problem in generating bKash Payment Agreement');
                }
            }, (err) => {
                console.log(err);
                this.loaderService.hideLoader();
                this.isSubmitting = false;
                if (err && err.error && err.error.statusMessage) {
                    this.toastService.error(err.error.statusMessage, err.error.statusCode);
                } else {
                    this.toastService.error('Problem in generating bKash Payment Agreement', 'Oppss!');
                }

            });
    }
}
