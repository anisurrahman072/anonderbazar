import { Component, OnInit } from '@angular/core';
import {FormBuilder, FormGroup, Validators} from "@angular/forms";
import {FormValidatorService} from "../../../services/validator/form-validator.service";
import {InvestorService} from "../../../services/investor.service";
import {NotificationsService} from "angular2-notifications";
import {Router} from "@angular/router";
import {NgProgress} from "@ngx-progressbar/core";
import {BsModalRef} from "ngx-bootstrap/modal/bs-modal-ref.service";
import {BsModalService} from "ngx-bootstrap/modal";
import {error} from "util";
import {timer} from "rxjs/observable/timer";
import * as _moment from 'moment';
import {scan, takeWhile} from "rxjs/operators";
import {Observable} from "rxjs/Observable";

@Component({
  selector: 'app-investor-registration',
  templateUrl: './investor-registration.component.html',
  styleUrls: ['./investor-registration.component.scss'],
})
export class InvestorRegistrationComponent implements OnInit {

  investorForm: FormGroup;
  mobileNumberModalRef: BsModalRef;
  moneyReceiptModalRef: BsModalRef;
  investorMobileForm: FormGroup;
  investorOtpForm: FormGroup;
  isShowMobileNumberGiven: boolean = true;
  currentMobileNumber: any;
  currentOtpCreatedAt = null;
  timer$: Observable<any>;
  isShowInvestorForm = true;
  agreeTerms: any = null;

  constructor(private fb: FormBuilder,
              private investorService: InvestorService,
              private _notify: NotificationsService,
              private router: Router,
              public progress: NgProgress,
              private modalService: BsModalService,) {
    this.investorForm = this.fb.group({
      first_name: ["", Validators.required],
      last_name: ["", Validators.required],
      email: ["", [Validators.required, FormValidatorService.emailValidator]],
      agree: ["",Validators.required]
    });

    this.investorMobileForm = this.fb.group({
      phone: ["", [Validators.required, FormValidatorService.phoneNumberValidator]]
    });

    this.investorOtpForm = this.fb.group({
      otp: ["", [Validators.required]]
    });
  }

  ngOnInit() {
  }

  onInvestorFormSubmit($event, value){

    const formData: FormData = new FormData();
    formData.append('first_name', value.first_name);
    formData.append('last_name', value.last_name);
    formData.append('email', value.email);
    formData.append('phone', this.currentMobileNumber);

    this.progress.start('mainLoader');
    this.investorService.registerInvestor(formData)
        .subscribe(data => {
          this.isShowInvestorForm = false;
          this.progress.complete('mainLoader');
          this._notify.success('Successfully submitted the Investor form');
        }, error => {
          this.progress.complete('mainLoader');
          this._notify.warn('Error occurred while submitting the form');
        })
  }

  getInvestorFormControl(type) {
    return this.investorForm.controls[type];
  }

  isAddModalVisible(modalContent) {
    this.mobileNumberModalRef = this.modalService.show(modalContent);
  }

  getInvestorsControl(type) {
    return this.investorForm.controls[type];
  }

  getInvestorMobileFormControl(type) {
    return this.investorMobileForm.controls[type];
  }

  getInvestorOTPControl(type) {
    return this.investorOtpForm.controls[type];
  }

  showOTPVerification(value){
    this.isShowMobileNumberGiven = false;
    this.investorService.generateOtp(value)
        .subscribe(data => {
          this._notify.success("Successfully send OTP to your mobile number.");
          this.currentMobileNumber = data.otpData.phone;

            this.timer$ = timer(0, 1000).pipe(
                scan(acc => --acc, 300),
                takeWhile(x => x >= 0)
            );
        }, error => {
          this.mobileNumberModalRef.hide();
          this._notify.error("Error occurred while generate OTP");
        })
  }

  verifyOTP(value, modalContent){
    this.mobileNumberModalRef.hide();
    const formData: FormData = new FormData();
    formData.append('otp', value.otp);
    formData.append('phone', this.currentMobileNumber);
    this.investorService.verifyOTP(formData)
        .subscribe(data => {
          this.isShowInvestorForm = true;
          this._notify.success("Successfully verified your OTP");
          this.moneyReceiptModalRef = this.modalService.show(modalContent);
          this.isShowMobileNumberGiven = true;
        }, error => {
          if(error.error && error.error.code === 'wrong'){
            this._notify.error(error.error.message);
          } else if(error.error && error.error.code === 'Expired'){
            this.isShowMobileNumberGiven = true;
            this._notify.error(error.error.message);
          } else {
            this._notify.error("Your OTP was wrong");
          }
        });
  }

}
