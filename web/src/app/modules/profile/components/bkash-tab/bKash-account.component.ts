import {AfterViewInit, ChangeDetectorRef, Component, OnDestroy, OnInit} from "@angular/core";
import {UserService} from "../../../../services";
import {ActivatedRoute, Router} from "@angular/router";
import {NotificationsService} from "angular2-notifications";
import {ToastrService} from "ngx-toastr";
import {BkashService} from "../../../../services/bkash.service";
import {LocalStorageService} from "../../../../services/local-storage.service";

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

    constructor(
        private cdr: ChangeDetectorRef,
        private route: ActivatedRoute,
        private bkashService: BkashService,
        private router: Router,
        private userService: UserService,
        private localStorageService: LocalStorageService,
        private _notify: NotificationsService,
        private toastService: ToastrService
    ) {
    }

    ngOnInit(): void {

        this._spinning = true;
        this.bkashService.generateGrandToken().subscribe((res: any) => {
            console.log('generateGrandToken', res);
            if (res.id_token) {
                this.localStorageService.setBkashTokens(res.id_token, res.refresh_token);
                this.canAddAgreement = true;
            }
            this._spinning = false;
        }, (err) => {
            console.log(err);
            this.toastService.error('Problem in generating bKash Grand Token', 'Oppss!');
            this._spinning = false;
        })
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

    createBKashAgreement() {
        console.log(this.bKashWalletNoToAdd);
        this.isSubmitting = true;
        this._spinning = true;
        const bkashToken = this.localStorageService.getBkashToken();
        this.bkashService.createAgreementRequest(bkashToken, this.bKashWalletNoToAdd)
            .subscribe((res: any) => {
                console.log('createBKashAgreement', res);
                this._spinning = false;
                this.isSubmitting = false;
                if (res.tokenRes && res.tokenRes.bkashURL) {
                    window.location.href = res.tokenRes.bkashURL;
                }
            }, (err) => {
                console.log(err);
                this._spinning = false;
                this.isSubmitting = false;
                this.toastService.error('Problem in generating bKash Payment Agreement', 'Oppss!');
            })
    }
}
