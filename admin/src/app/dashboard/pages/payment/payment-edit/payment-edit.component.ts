import {Component, OnDestroy, OnInit} from '@angular/core';
import {FormBuilder, FormGroup, Validators} from '@angular/forms';
import {ActivatedRoute, Router} from '@angular/router';
import {Subscription} from 'rxjs';
import {NzNotificationService} from 'ng-zorro-antd';
import {PaymentService} from "../../../../services/payment.service";
import {SuborderService} from "../../../../services/suborder.service";
import {OrderService} from "../../../../services/order.service";
import * as _moment from 'moment';
import {default as _rollupMoment} from 'moment';
import {GLOBAL_CONFIGS} from "../../../../../environments/global_config";
import {AuthService} from "../../../../services/auth.service";

const moment = _rollupMoment || _moment;


@Component({
    selector: 'app-payment-edit',
    templateUrl: './payment-edit.component.html',
    styleUrls: ['./payment-edit.component.css']
})
export class PaymentEditComponent implements OnInit, OnDestroy {
    validateForm: FormGroup;
    sub: Subscription;
    id: number;
    data: any;
    currentUser: any;
    orderSearchOptions: any;
    suborderSearchOptions: any;
    customer: any;
    statusOptions = [
        {label: 'Pending', value: 1},
        {label: 'Processing', value: 2},
        {label: 'Completed', value: 4},
        {label: 'Rejected', value: 0},
    ];
    paymentTypeOptions = [
        {label: 'Cash', value: 'cash'},
        {label: 'Card Payment', value: 'card_payment'},
        {label: 'SSL Commerz', value: 'SSLCommerce'},
        {label: 'BKash', value: 'BKash'},
        {label: 'Nagad', value: 'Nagad'},
    ];
    order_id: any;
    suborder_id: any;
    paymentApprovalStatus: any;
    PAYMENT_STATUS_CHANGE_ADMIN_USER = GLOBAL_CONFIGS.PAYMENT_STATUS_CHANGE_ADMIN_USER;
    isAllowedToUpdatePaymentStatus:boolean = false;

    constructor(private router: Router, private route: ActivatedRoute,
                private _notification: NzNotificationService,
                private fb: FormBuilder,
                private orderService: OrderService,
                private suborderService: SuborderService,
                private paymentService: PaymentService,
                private authService: AuthService) {

    }
    // init the component
    ngOnInit() {
        this.validateForm = this.fb.group({
            order_id: ['', [Validators.required]],
            suborder_id: ['', [Validators.required]],
            payment_type: ['', [Validators.required]],
            payment_amount: ['', [Validators.required]],
            status: ['', [Validators.required]],
            receiver_id: ['', []],
            user_id: ['', []],
            payment_date: ['', [Validators.required]],
        });

        this.currentUser = this.authService.getCurrentUser();
        if(this.currentUser.id == this.PAYMENT_STATUS_CHANGE_ADMIN_USER){
            this.isAllowedToUpdatePaymentStatus = true;
        }

        /*        this.orderService.getAll().subscribe(result => {
                    this.orderSearchOptions = result;
                });*/
        this.sub = this.route.params.subscribe(params => {
            this.id = +params['id']; // (+) converts string 'id' to a number
            this.paymentService.getByIdNoPop(this.id)
                .subscribe(result => {
                    this.data = result;
                    console.log('payment', this.data);
                    this.paymentApprovalStatus = this.data.status;

                    this.validateForm.patchValue({
                        order_id: this.data.suborder_id,
                        suborder_id: this.data.suborder_id,
                        payment_type: this.data.payment_type,
                        payment_amount: this.data.payment_amount,
                        status: this.data.status,
                        receiver_id: this.data.receiver_id ? this.data.receiver_id.id : '',
                        user_id: this.data.user_id.id,
                        payment_date: this.data.payment_date,
                    });

                    this.order_id = this.data.order_id;
                    console.log(' this.order_id' ,  this.order_id);
                    this.customer = this.data.user_id;
                    this.currentUser = this.data.receiver_id;
                });
        });
    }

    //Event method for submitting the form
    submitForm = ($event, value) => {
        $event.preventDefault();
        for (const key in this.validateForm.controls) {
            this.validateForm.controls[key].markAsDirty();
        }

        value.user_id = this.customer.id;
        value.receiver_id = this.currentUser.id;

        let paymentInsertPayload = value;
        paymentInsertPayload.payment_date = moment(paymentInsertPayload.payment_date ).format('YYYY-MM-DD HH:mm:ss');


        this.paymentService.update(this.id, paymentInsertPayload)
            .subscribe(result => {
                if (result) {
                    this._notification.create('success', 'Payment Update Succeeded for:', this.data.id);
                    this.router.navigate(['/dashboard/payment/details/', this.id]);
                }
            });
    }
    //Event method for resetting the form
    resetForm($event: MouseEvent) {
        $event.preventDefault();
        this.validateForm.reset();
        for (const key in this.validateForm.controls) {
            this.validateForm.controls[key].markAsPristine();
        }
    }
    //Event method for setting up form in validation
    getFormControl(name) {
        return this.validateForm.controls[name];
    }

    orderChange($event) {
        console.log('orderchange', $event);

        if($event){
            const query = encodeURI($event);
            this.suborder_id = null;
            this.suborderService.getAllByOrderId(query).subscribe(result => {
                this.suborderSearchOptions = result;
                const d = this.suborderSearchOptions.filter(c => c.id === this.data.suborder_id.id);

                if (d[0]) {
                    this.suborder_id = d[0].id;
                } else {
                    this.suborder_id = null;
                }
            });
        }

    }


    ngOnDestroy(): void {
        this.sub ? this.sub.unsubscribe() : '';

    }

}
