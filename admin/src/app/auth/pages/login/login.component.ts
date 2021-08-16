import {Component, OnInit} from '@angular/core';
import {AuthService} from '../../../services/auth.service';
import {Router} from '@angular/router';
import {
    FormBuilder,
    FormGroup,
    FormControl,
    Validators
} from '@angular/forms';
import {Observable} from 'rxjs';
import {UIService} from "../../../services/ui/ui.service";

@Component({
    selector: 'app-login',
    templateUrl: './login.component.html',
    styleUrls: ['./login.component.css']
})
export class LoginComponent implements OnInit {

    _isSpinning: boolean = false;
    loginServerError = {
        show: false,
        message: ''
    };

    constructor(private fb: FormBuilder,
                private router: Router,
                private authService: AuthService,
                private uiService: UIService) {

        this.validateForm = this.fb.group({
            userName: ['', [Validators.required]],
            password: ['', [Validators.required]],

        });
    }

    validateForm: FormGroup;

    //Event method for submitting the form
    submitForm = ($event, value) => {
        this._isSpinning = true;

        $event.preventDefault();
        for (const key in this.validateForm.controls) {
            this.validateForm.controls[key].markAsDirty();
        }

        this.authService.login(value.userName, value.password)
            .subscribe(result => {
                    if (result && result.token && ((result.user.group_id.name == "admin" && result.user.warehouse_id == undefined) || result.user.user_type === 'admin')) {
                        this.uiService.loginInfoUpdate(true);
                        this.authService.loginSuccess(result);
                        this.router.navigate(['/dashboard']);
                    } else if (result && result.token) {
                        if (result.user.warehouse_id.status == 0) {
                            this.loginServerError.show = true;
                            this.loginServerError.message = "Your shop is not approved";
                        } else if (result.user.warehouse_id.status == 1) {
                            this.loginServerError.show = true;
                            this.loginServerError.message = "Your shop is not approved";
                        } else if (result.user.warehouse_id.status == 3) {
                            this.loginServerError.show = true;
                            this.loginServerError.message = "Your shop has been inactivated";
                        } else {
                            this.uiService.loginInfoUpdate(true);
                            this.authService.loginSuccess(result);
                            this.router.navigate(['/dashboard']);
                        }
                    }
                    this._isSpinning = false;
                },
                (err) => {
                    this._isSpinning = false;
                    this.loginServerError.show = true;
                    this.loginServerError.message = err.error.message;
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
