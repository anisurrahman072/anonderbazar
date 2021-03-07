import {Component, OnInit} from '@angular/core';
import {
    FormBuilder,
    FormGroup,
    Validators
} from '@angular/forms';
import {ActivatedRoute, Router} from '@angular/router';
import {NzNotificationService} from 'ng-zorro-antd';
import {PaymentService} from '../../../../services/payment.service';
import {AuthService} from '../../../../services/auth.service';
import {OrderService} from "../../../../services/order.service";
import {SuborderService} from "../../../../services/suborder.service";

@Component({
    selector: 'app-payment-create',
    templateUrl: './payment-create.component.html',
    styleUrls: ['./payment-create.component.css']
})
export class PaymentCreateComponent implements OnInit {
    validateForm: FormGroup;

    currentUser: any;

    userSearchOptions = [];
    orderSearchOptions: any;
    suborderSearchOptions: any;
    customer: any;
    statusOptions = [
        {label: 'Pending', value: 1},
        {label: 'Processing', value: 2},
        {label: 'Completed', value: 4},
        {label: 'Canceled', value: 0},
    ];
    paymentTypeOptions = [
        {label: 'Cash', value: 'cash'},
        {label: 'Card payment', value: 'card_payment'},
        {label: 'Direct bank transfer', value: 'direct_bank_transfer'},
    ];
    submitting: boolean = false;


    constructor(private router: Router,
                private route: ActivatedRoute,
                private _notification: NzNotificationService,
                private orderService: OrderService,
                private suborderService: SuborderService,
                private fb: FormBuilder,
                private authService: AuthService,
                private paymentService: PaymentService) {

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

        this.orderService.getAll().subscribe(result => {
            this.orderSearchOptions = result;
        });
    }

    //Event method for submitting the form
    submitForm = ($event, value) => {
        this.submitting = true;
        $event.preventDefault();
        for (const key in this.validateForm.controls) {
            this.validateForm.controls[key].markAsDirty();
        }

        value.user_id = this.customer.id;
        value.receiver_id = this.currentUser.id;
        let paymentInsertPayload = value;

        this.paymentService.insert(paymentInsertPayload)
            .subscribe(result => {
                    this.submitting = false;
                    if (result.id) {
                        this._notification.create('success', 'New payment Insert Succeeded', result.id);
                        this.router.navigate(['/dashboard/payment/details/', result.id]);
                    }
                },
                error => {
                    this.submitting = false;
                    this._notification.create('error', 'Error Occurred!',
                        "Transaction disn't created!");

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


    //Method for order status change

    orderChange($event) {
        const query = encodeURI($event);
        this.suborderService.getAllByOrderId(query).subscribe(result => {
            this.suborderSearchOptions = result;
        });

        this.orderService.getById(query).subscribe(result => {
            this.customer = result.user_id;
        });
    }

}
