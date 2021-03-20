import {ToastrService} from "ngx-toastr";
import {concatMap} from 'rxjs/operators';
import {of} from "rxjs/observable/of";
import {AfterViewInit, ChangeDetectorRef, Component, OnDestroy, OnInit} from "@angular/core";
import {UserService} from "../../../../services";
import {ActivatedRoute, Router} from "@angular/router";
import {NotificationsService} from "angular2-notifications";
import {BkashService} from "../../../../services/bkash.service";
import {LoaderService} from "../../../../services/ui/loader.service";


@Component({
    selector: "my-bkash-accounts",
    templateUrl: "./bKash-account.component.html",
    styleUrls: ["./bKash-account.component.scss"]
})
export class BKashAccountComponent implements OnInit, OnDestroy, AfterViewInit {

    bKashWalletNoToAdd: string = '';

    _spinning: boolean = false;
    isSubmitting: boolean = false;

    canAddAgreement: boolean = false;
    authUserWallets: any;

    bKashGrandToken: string = '';

    constructor(
        private cdr: ChangeDetectorRef,
        private route: ActivatedRoute,
        private bkashService: BkashService,
        private router: Router,
        private userService: UserService,
        private bKashService: BkashService,
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

    ngAfterViewInit() {
        setTimeout(() => {
            let queryParams = this.route.snapshot.queryParams;
            if (queryParams['bKashError']) {
                this.toastService.error(queryParams['bKashError'], 'Oppss!');
            } else if (queryParams['bKashSuccess']) {
                this.toastService.success(queryParams['bKashSuccess'], 'Success');
            }
            this.cdr.detectChanges();
        }, 500);
    }

    ngOnDestroy() {
    }

    deleteAgreement(authUserWallet) {
        if (this.bKashGrandToken) {
            if (window.confirm("Are you sure you want to delete this wallet")) {
                this.loaderService.showLoader();
                this.bkashService.cancelAgreement(this.bKashGrandToken, authUserWallet.agreement_id)
                    .subscribe((res: any) => {
                        this.loaderService.hideLoader();
                        this.fetchbKashWallets();
                        this.toastService.success('bKash Wallet has been successfully deleted.', 'Success');
                    }, (err) => {
                        console.log(err);
                        this.loaderService.hideLoader();
                        this.toastService.error('Problem in generating bKash Payment Agreement.', 'Oppss!');
                    })
            }
        }
    }

    createBKashAgreement() {
        if (!this.bKashWalletNoToAdd) {
            return false;
        }

        console.log(this.bKashWalletNoToAdd);
        this.isSubmitting = true;
        this._spinning = true;

        this.bkashService.generateGrandToken()
            .concatMap((res: any) => {
                console.log('generateGrandToken', res);
                if (res.id_token) {
                    this.bKashGrandToken = res.id_token;
                    return this.bkashService.createAgreementRequest(res.id_token, this.bKashWalletNoToAdd);
                }
                return of(false);
            })
            .subscribe((res: any) => {
                console.log('createBKashAgreement', res);
                this._spinning = false;
                this.isSubmitting = false;

                if (res && res.tokenRes && res.tokenRes.bkashURL) {
                    window.location.href = res.tokenRes.bkashURL;
                } else {
                    throw new Error('Problem');
                }
            }, (err) => {
                console.log(err);
                this._spinning = false;
                this.isSubmitting = false;
                this.toastService.error('Problem in generating bKash Payment Agreement', 'Oppss!');
            })
    }
}
