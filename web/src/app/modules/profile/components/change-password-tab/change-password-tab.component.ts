import {Component, OnInit} from '@angular/core';
import {FormBuilder, FormControl, FormGroup, Validators} from "@angular/forms";
import {FormValidatorService} from "../../../../services/validator/form-validator.service";
import * as moment from "moment";
import {AuthService} from "../../../../services";
import {NotificationsService} from "angular2-notifications";
import {Router} from "@angular/router";
import {ToastrService} from "ngx-toastr";

@Component({
    selector: 'app-change-password-tab',
    templateUrl: "./change-password.component.html",
    styleUrls: ['./change-password.component.scss']
})
export class ChangePasswordTabComponent implements OnInit {
    changePasswordForm: FormGroup
    private user_id;

    constructor(
        private fb: FormBuilder,
        private authService: AuthService,
        private _notify: NotificationsService,
        private router: Router,
        private toastService: ToastrService,
    ) {
    }

    ngOnInit() {
        this.user_id = this.authService.getCurrentUserId();
        this.changePasswordForm = this.fb.group({
            oldPassword: ['', [Validators.required]],
            newPassword: ['', [Validators.required]],
            confirmPassword: ['', [Validators.required, this.confirmationValidator]]
        });
    }

    //Method called for all controls validated
    confirmationValidator = (control: FormControl): { [s: string]: boolean } => {
        if (!control.value) {
            return {required: true};
        } else if (
            control.value !== this.changePasswordForm.controls.newPassword.value
        ) {
            return {confirm: true, error: true};
        }
    };

    //Method called for confirm update validator
    updateConfirmValidator(): void {
        /** wait for refresh value */
        Promise.resolve().then(() =>
            this.changePasswordForm.controls.confirmPassword.updateValueAndValidity()
        );
    }


    //Method called for sign up form submit
    submitChangePasswordForm($event, value) {
        for (const key in this.changePasswordForm.controls) {
            this.changePasswordForm.controls[key].markAsDirty();
        }
        if (!this.changePasswordForm.valid) {
            return false;
        }
        let FormData1 = {
            user_id: this.user_id,
            confirmPassword: value.confirmPassword,
            newPassword: value.newPassword,
            oldPassword: value.oldPassword,
        };

        this.authService.passwordChange(FormData1)
            .subscribe(result => {
                    if (result && result.code && result.code === 'WRONG_PASSWORD') {
                        this.toastService.error('Wrong old password', 'wrong password');
                    } else if (result) {
                        this._notify.success("Password Update", 'Password updated successfully.');
                        this.router.navigate(['/profile/orders']);
                    } else {
                        this._notify.error("Password Update Failed.");
                        return ("Error occurred");
                    }
                },
                (err) => {
                    this._notify.error("Password Update Failed.");
                    console.log(err);
                }
            );
    }


}
