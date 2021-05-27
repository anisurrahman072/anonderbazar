import {Component, Input, OnInit, ViewChild} from '@angular/core';
import {Observable} from "rxjs/Rx";
import {PartialPaymentModalService} from "../../../../services/ui/partial-payment-modal.service";
import {ModalDirective} from "ngx-bootstrap";
import {FormBuilder, FormGroup, Validators} from "@angular/forms";
import {GLOBAL_CONFIGS, PAYMENT_METHODS} from "../../../../../environments/global_config";
import {Subscription} from "rxjs/Subscription";
import {User} from "../../../../models";
import * as fromStore from "../../../../state-management";
import {Store} from "@ngrx/store";
import {OrderService, PartialOrderService} from "../../../../services";
import * as _ from "lodash";
import {NotificationsService} from "angular2-notifications";
import {forkJoin} from "rxjs/observable/forkJoin";
import {LoaderService} from "../../../../services/ui/loader.service";

@Component({
  selector: 'app-partial-payment-modal',
  templateUrl: './partial-payment-modal.component.html',
  styleUrls: ['./partial-payment-modal.component.scss']
})
export class PartialPaymentModalComponent implements OnInit {

  @ViewChild('autoShownModal') autoShownModal: ModalDirective;
  @Input('app-shopping-cart') cartItem;
  isModalShown$: Observable<boolean>;
  partialPaymentForm: FormGroup;
  enabledPaymentMethods = GLOBAL_CONFIGS.activePaymentMethods;

  CASHBACK_PAYMENT_TYPE = PAYMENT_METHODS.CASHBACK_PAYMENT_TYPE;
  SSL_COMMERZ_PAYMENT_TYPE = PAYMENT_METHODS.SSL_COMMERZ_PAYMENT_TYPE;
  BKASH_PAYMENT_TYPE = PAYMENT_METHODS.BKASH_PAYMENT_TYPE;
  NAGAD_PAYMENT_TYPE = PAYMENT_METHODS.NAGAD_PAYMENT_TYPE;

  couponCashbackAmount: number = 0;
  currentUser$: Observable<User>;
  user_id: any;
  showBkashPayment: boolean = true;
  paymentAmount: any = null;
  amountToPay: number;

  private currentUser: User;
  private currentOrderId: number;

  constructor(
      private partialPaymentModalService: PartialPaymentModalService,
      private fb: FormBuilder,
      private store: Store<fromStore.HomeState>,
      private orderService: OrderService,
      private _notify: NotificationsService,
      private loaderService: LoaderService,
      private partialOrderService: PartialOrderService
  ) { }

  ngOnInit() {
    this.partialPaymentForm = this.fb.group({
      paymentType: ['SSLCommerce', [Validators.required]],
      paymentAmount: ['',[Validators.required]]
    });

    this.partialPaymentModalService.getPartialModalInfo()
        .subscribe(data => {
          this.currentOrderId = data;

          if(!_.isUndefined(this.currentOrderId) && !_.isNull(this.currentOrderId)){
            this.orderService.getById(this.currentOrderId)
                .subscribe(data => {
                  this.amountToPay = data.total_price - data.paid_amount;
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

        if (this.user_id == 130) {
          this.showBkashPayment = true;
        }
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
    this.partialPaymentModalService.showPartialModal(false, null);
  }

  hideModal(): void {
    this.autoShownModal.hide();
  }

  makePartialPayment(value){
    this.onHidden();
    this.loaderService.showLoader();
    if(_.isUndefined(value.paymentAmount) || _.isNull(value.paymentAmount) || value.paymentAmount <= 0){
      this._notify.error('Please insert a correct amount to pay');
      return false;
    }
    if(_.isUndefined(value.paymentType) || _.isNull(value.paymentType)){
      this._notify.error('Please choose a payment method to complete partial payment');
      return false;
    }
    if(_.isUndefined(this.currentOrderId) || _.isNull(value.currentOrderId)){
      this._notify.error('Order not found!');
      return false;
    }
    this.partialOrderService.makePartialPayment(this.currentOrderId, value)
        .subscribe(data => {
          console.log('Aaaaa', data);
          this.loaderService.hideLoader();
        }, error => {
          this.loaderService.hideLoader();
          this._notify.error('Error occurred while making partial payment!', error);
        })
  }
}
