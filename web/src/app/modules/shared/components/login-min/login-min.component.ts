import {Component, OnDestroy, OnInit, ViewChild} from '@angular/core';
import {FormBuilder, FormControl, FormGroup, Validators} from '@angular/forms';
import {Router} from "@angular/router";
import {AuthService} from "../../../../services";
import {Store} from "@ngrx/store";
import * as fromStore from '../../../../state-management/index';
import {LoginModalService} from "../../../../services/ui/loginModal.service";
import {Observable} from "rxjs/Observable";
import {ModalDirective} from "ngx-bootstrap";
import {NotificationsService} from "angular2-notifications";
import {UserService} from '../../../../services';
import {Subscription} from 'rxjs/Subscription';
import {CartService} from '../../../../services';
import {FormValidatorService} from "../../../../services/validator/form-validator.service";
import * as moment from 'moment';

@Component({
    selector: 'app-front-login-min',
    templateUrl: './login.component.html',
    styleUrls: ['./login.component.scss']
})
export class LoginMinComponent implements OnInit, OnDestroy {
    @ViewChild('autoShownModal') autoShownModal: ModalDirective;
    private currentCart: any;
    private isUnique = true;
    currentYear: number;
    gender: any;
    genderSearchOptions = [
        {label: 'Male', value: 'male'},
        {label: 'Female', value: 'female'},
        {label: 'Other', value: 'third-gender'}
    ];
    /*    foods = [
            {value: 'steak-0', viewValue: 'Steak'},
            {value: 'pizza-1', viewValue: 'Pizza'},
            {value: 'tacos-2', viewValue: 'Tacos'}
        ];
        birthMonthOption = [
            {label: 'January', value: '01'},
            {label: 'February', value: '02'},
            {label: 'March', value: '03'},
            {label: 'April', value: '04'},
            {label: 'May', value: '05'},
            {label: 'June', value: '06'},
            {label: 'July', value: '07'},
            {label: 'August', value: '08'},
            {label: 'September', value: '09'},
            {label: 'October', value: '10'},
            {label: 'November', value: '11'},
            {label: 'December', value: '12'},
        ];
        birthMonth: number;*/

    isModalShown$: Observable<boolean>;

    validateForm: FormGroup;

    validateSignUpForm: FormGroup;
    validateForgotForm: FormGroup;

    register: Boolean = false;
    isForgot: Boolean = false;

    private d: Subscription;
    loginErrorMessage;

    forgetPaswordSubmitting: boolean = false;
    loginSubmitting: boolean = false;
    signupSubmitting: boolean = false;

    minBirthDate: string = '';
    maxBirthDate: string = '';

    constructor(
        private fb: FormBuilder,
        private router: Router,
        // public loaderService: LoaderService,
        private loginInfoService: LoginModalService,
        private authService: AuthService,
        private store: Store<fromStore.HomeState>,
        private _notify: NotificationsService,
        private loginModalService: LoginModalService,
        private cartService: CartService,
        private userService: UserService,
        private formValidatorService: FormValidatorService
    ) {
        this.minBirthDate = moment().subtract(120, 'year').format('YYYY-MM-DD');
        this.maxBirthDate = moment().subtract(5, 'year').format('YYYY-MM-DD');
    }

    //init the component
    ngOnInit(): void {
        this.currentYear = new Date().getFullYear();
        this.validateForm = this.fb.group({
            username: ['', [Validators.required]],
            password: ['', [Validators.required]],
            remember: [false, []]
        });

        this.validateForgotForm = this.fb.group({
            email: ['', []],
            phone: ['', [Validators.required]],
        });

        this.validateSignUpForm = this.fb.group({
            first_name: ['', [Validators.required]],
            last_name: ['', []],
            phone: ['', [Validators.required, FormValidatorService.phoneNumberValidator], [this.formValidatorService.phoneNumberUniqueValidator.bind(this)]],
            gender: ['', []],
            full_birth_date: ['', []],
            password: ['', [Validators.required]],
            confirmPassword: ['', [Validators.required, this.confirmationValidator]]
        });

        this.getLoginModalInfo();
        this.store.select<any>(fromStore.getCart).subscribe(result => {
            this.currentCart = result;
        });
    }

    ngOnDestroy(): void {
        this.d ? this.d.unsubscribe() : null;
    }

    TestForm(event: any) {
        console.log('this.validateForgotForm', this.validateForgotForm);
    }

    //Method called for confirm update validator
    updateConfirmValidator(): void {
        /** wait for refresh value */
        Promise.resolve().then(() =>
            this.validateSignUpForm.controls.confirmPassword.updateValueAndValidity()
        );
    }

    //Method called for confirm phone number exist validation
    updatePhoneValidator(): void {
        /** wait for refresh value */
        Promise.resolve().then(() =>
            this.validateSignUpForm.controls.phone.updateValueAndValidity()
        );
    }

    //Method to show forgot section in popup modal
    showForgot() {
        this.isForgot = true;
    }

    //Method to show login section in popup modal
    showLogin() {
        this.isForgot = false;
        this.register = false;
    }

    //Method called for all controls validated
    confirmationValidator = (control: FormControl): { [s: string]: boolean } => {
        if (!control.value) {
            return {required: true};
        } else if (
            control.value !== this.validateSignUpForm.controls.password.value
        ) {
            return {confirm: true, error: true};
        }
    };

    //Method for adding validation to controls to login section
    getFormControl(type) {
        return this.validateForm.controls[type];
    }

    //Method for adding validation to controls to forgot section
    getForgotFormControl(type) {
        return this.validateForgotForm.controls[type];
    }

    //Method for adding validation to controls to sign up section
    getSignUpFormControl(type) {
        return this.validateSignUpForm.controls[type];
    }


    //Method called for login form submit
    submitForm($event, value) {
        if (!this.validateForm.valid) {
            return false;
        }
        for (const key in this.validateForm.controls) {
            this.validateForm.controls[key].markAsDirty();
        }

        this.loginSubmitting = true;
        this.authService.login(value.username, value.password).subscribe(
            async result => {
                if (result && result.token) {
                    this.loginInfoService.showLoginModal(false);
                    localStorage.setItem(
                        'currentUser',
                        JSON.stringify({
                            username: result.username,
                            token: result.token
                        })
                    );

                    localStorage.setItem('token', result.token);

                    this.setUpUserData();
                    this.loginInfoService.userLoggedIn(true);
                    this._notify.success("Login Successful.");
                    this.loginSubmitting = false;
                } else {
                    this._notify.error("Login Failed.");
                }
            },
            err => {
                this.loginSubmitting = false;
                this.loginErrorMessage = err.error.message;
            }
        );
    }

    //Method called for forgot form submit
    submitForgotPasswordForm($event, value) {

        for (const key in this.validateForgotForm.controls) {
            this.validateForgotForm.controls[key].markAsDirty();
        }
        if (value.email || value.phone) {
            this.forgetPaswordSubmitting = true;
            this.userService.checkEmailPhone(value.email, value.phone).subscribe(result => {
                let user = result.data[0];
                console.log('submitForgotPasswordForm-user', user);
                if (user) {
                    let resetpassword = this.generatePassword();
                    this.userService.updatepassword(user.id, {password: resetpassword})
                        .subscribe(arg => {
                            console.log('submitForgotPasswordForm-user-arg', arg);
                            this.forgetPaswordSubmitting = false;
                            this._notify.success('Success', 'Your password has been updated. Please check your email or sms.');
                            this.validateForgotForm.reset();

                            if (arg) {
                                this.showLogin();
                            }
                        }, (err) => {
                            this.forgetPaswordSubmitting = false;
                            console.log('submitForgotPasswordForm', err);
                        });
                } else {
                    this.forgetPaswordSubmitting = false;
                    this._notify.error('User was not found!', 'User with your provided information was not found!');
                }
            }, (err) => {
                this.forgetPaswordSubmitting = false;
                console.log('submitForgotPasswordForm', err);

            });
        }
    }

    //Method called for password generation
    generatePassword() {
        var length = 8,
            charset = "abcdefghijklmnopqrstuvwxyzABCDEFGHIJKLMNOPQRSTUVWXYZ0123456789",
            retVal = "";
        for (var i = 0, n = charset.length; i < length; ++i) {
            retVal += charset.charAt(Math.floor(Math.random() * n));
        }
        return retVal;
    }

    birthDateChangeHandler(event) {

        console.log('birthDateChangeHandler', event.value);
    }

    //Method called for sign up form submit
    submitSignupForm($event, value) {

        console.log('this.validateSignUpForm', this.validateSignUpForm);

        if (!this.validateSignUpForm.valid) {
            return false;
        }
        for (const key in this.validateSignUpForm.controls) {
            this.validateSignUpForm.controls[key].markAsDirty();
        }

        let signupBirthDate = '';
        if (value.full_birth_date) {
            signupBirthDate = moment(value.full_birth_date).format('YYYY-MM-DD');
        }
        let FormData1 = {
            username: value.phone ? value.phone : '',
            password: value.password ? value.password : '',
            confirmPassword: value.password ? value.password : '',
            email: value.email ? value.email : '',
            first_name: value.first_name ? value.first_name : '',
            last_name: value.last_name ? value.last_name : '',
            phone: value.phone ? value.phone : '',
            gender: value.gender ? value.gender : '',
            group_id: 2,
            address: "",
            permanent_address: "",
            national_id: "",
            father_name: "",
            mother_name: "",
            dob: signupBirthDate,
            active: 1
        };


        this.signupSubmitting = true;
        this.authService.signUp(FormData1)
            .subscribe(result => {
                    console.log('result', result);
                    if (result) {
                        if (result && result.token) {
                            this.loginInfoService.showLoginModal(false);
                            localStorage.setItem(
                                'currentUser',
                                JSON.stringify({
                                    username: result.user.username,
                                    token: result.token
                                })
                            );
                            localStorage.setItem('token', result.token);

                            this.setUpUserData();

                            this.loginInfoService.userLoggedIn(true);
                            this._notify.success("Signup Successful.");
                        } else {
                            this._notify.error("Login Failed.");
                        }
                        this.signupSubmitting = false;
                        return result;
                    } else {
                        this.signupSubmitting = false;
                        this._notify.error("Signup Failed.");
                        return ("Error happened")
                    }
                },
                (err) => {
                    this.signupSubmitting = false;
                    this._notify.error("Signup Failed.");
                    console.log(err);
                }
            );
    }

    //Method called for setting up user data
    setUpUserData() {
        this.store.dispatch(new fromStore.LoadCurrentUser());
        this.store.dispatch(new fromStore.LoadCart());
        this.store.dispatch(new fromStore.LoadFavouriteProduct());
        this.store.dispatch(new fromStore.LoadCompare());
    }

    //Method called for hide modal
    hideModal(): void {
        this.autoShownModal.hide();
        this.validateForm.reset();
        this.validateForgotForm.reset();
        this.validateSignUpForm.reset();
        this.register = false;
        this.isForgot = false;
    }

    //Method called for login modal info
    getLoginModalInfo(): void {
        this.isModalShown$ = this.loginInfoService.currentLoginModalinfo;
    }

    onHidden(): void {
        this.validateForm.reset();
        this.loginInfoService.showLoginModal(false);
        this.loginErrorMessage = '';
    }

    //Method called for getting year list
    yearList(i: number) {
        return new Array(i);
    }

    //Method called for confirm username exist validation
    usernameValidator = (control: FormControl): { [s: string]: boolean } => {
        if (!control.value) {
            return {required: true};
        } else {
            var FormData1 = {
                username: control.value
            };
            this.authService.usernameUnique(FormData1)
                .subscribe((result => {
                    this.isUnique = result.isunique;
                }));
            if (this.isUnique != true) {
                return {phoneNumberUnique: true, error: true};
            } else {
                this.isUnique = true;
            }
        }
    }


    //Method to show sign up section in popup modal

    showSignUp() {
        this.register = true;
        this.loginErrorMessage = '';
        this.validateForm.reset();
        this.validateForgotForm.reset();
        this.validateSignUpForm.reset();
    }

}
