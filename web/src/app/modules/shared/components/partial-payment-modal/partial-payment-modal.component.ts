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
import {OrderService} from "../../../../services";
import * as _ from "lodash";
import {NotificationsService} from "angular2-notifications";

@Component({
  selector: 'app-partial-payment-modal',
  templateUrl: './partial-payment-modal.component.html',
  styleUrls: ['./partial-payment-modal.component.scss']
})
export class PartialPaymentModalComponent implements OnInit {

  @ViewChild('autoShownModal') autoShownModal: ModalDirective;
  @Input('app-shopping-cart') cartItem;
  isModalShown$: Observable<boolean>;
  currentOrderId$: any;
  partialPaymentForm: FormGroup;
  enabledPaymentMethods = GLOBAL_CONFIGS.activePaymentMethods;

  CASH_PAYMENT_TYPE = PAYMENT_METHODS.CASHBACK_PAYMENT_TYPE;
  CASHBACK_PAYMENT_TYPE = PAYMENT_METHODS.CASHBACK_PAYMENT_TYPE;
  SSL_COMMERZ_PAYMENT_TYPE = PAYMENT_METHODS.SSL_COMMERZ_PAYMENT_TYPE;
  BKASH_PAYMENT_TYPE = PAYMENT_METHODS.BKASH_PAYMENT_TYPE;
  NAGAD_PAYMENT_TYPE = PAYMENT_METHODS.NAGAD_PAYMENT_TYPE;

  couponCashbackAmount: number = 0;
  private currentUserSub: Subscription;
  currentUser$: Observable<User>;
  private currentUser: User;
  user_id: any;
  showBkashPayment: boolean = true;
  grantTotal: number = 0;
  private currentOrderId: number;
  paymentAmount: any = null;


  constructor(
      private partialPaymentModalService: PartialPaymentModalService,
      private fb: FormBuilder,
      private store: Store<fromStore.HomeState>,
      private orderService: OrderService,
      private _notify: NotificationsService,
  ) { }

  ngOnInit() {
    this.getPartialPaymentModalInfo();
    this.partialPaymentForm = this.fb.group({
      paymentType: ['SSLCommerce', []],
      paymentAmount: ['',[Validators.required]]
    });

    this.partialPaymentModalService.getPartialModalInfo()
        .subscribe(data => {
          this.currentOrderId = data;
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
    if(!_.isUndefined(value.paymentAmount) && !_.isNull(value.paymentAmount) && value.paymentAmount <= 0){

    }
    this.orderService.makePartialPayment(this.currentOrderId, value)
        .subscribe(data => {
          console.log('Successfully paid');
        }, error => {
          console.log('Error occurred while making partial payment');
        })
  }

  getFormControl(name) {
    return this.partialPaymentForm.controls[name];
  }
}
