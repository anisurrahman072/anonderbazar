import {Component, OnInit} from '@angular/core';
import {AuthService} from '../../../services/auth.service';
import {UserService} from '../../../services/user.service';
import {Router} from '@angular/router';
import {
    FormBuilder,
    FormGroup,
    FormControl,
    Validators
} from '@angular/forms';
import {Observable} from 'rxjs';
import {UIService} from "../../../services/ui/ui.service";
import {NzNotificationService} from 'ng-zorro-antd';

@Component({
    selector: 'app-forgot-password',
    templateUrl: './forgot-password.component.html',
    styleUrls: ['./forgot-password.component.css']
})
export class ForgotPasswordComponent implements OnInit {
    validateForm: FormGroup;

    loginServerError = {
        show: false,
        message: ''
    };

    constructor(private fb: FormBuilder, private router: Router,
                private authService: AuthService,
                private _notification: NzNotificationService,
                private userService: UserService,
                private uiService: UIService) {
        this.validateForm = this.fb.group({
            email: ['', [Validators.required]],
            phone: ['', [Validators.required]],

        });
    }

//Event method for submitting the form
    submitForm = ($event, value) => {
        if (value.email && value.phone) {
            var email = '';
            this.userService.checkEmailPhone(value.email, value.phone).subscribe(result => {
                let user = result.data[0];
                if (user) {
                    let resetpassword = this.generatePassword();
                    this.userService.updatepassword(user.id, {password: resetpassword})
                        .subscribe(arg => {
                            if (arg) {
                                this._notification.create('success', 'Please check you email.', user.first_name);
                                this.router.navigate(['/auth', arg]);
                            }
                        });
                } else {
                    this.loginServerError.show = true;
                    this.loginServerError.message = "No user found.";
                    $event.preventDefault();
                    this.validateForm.reset();
                    for (const key in this.validateForm.controls) {
                        this.validateForm.controls[key].markAsPristine();
                    }
                }
            });
        }
    }

    generatePassword() {
        var length = 8,
            charset = "abcdefghijklmnopqrstuvwxyzABCDEFGHIJKLMNOPQRSTUVWXYZ0123456789",
            retVal = "";
        for (var i = 0, n = charset.length; i < length; ++i) {
            retVal += charset.charAt(Math.floor(Math.random() * n));
        }
        return retVal;
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

    //Event method for user search for validation of user existance

    userNameServerValidator = (control: FormControl) => {
        return Observable.create(function (observer) {
            setTimeout(() => {
                if (control.value === 'JasonWood') {
                    observer.next({error: true, duplicated: true});
                } else {
                    observer.next(null);
                }
                observer.complete();
            }, 1000);
        });
    }

    ngOnInit() {
    }
}
