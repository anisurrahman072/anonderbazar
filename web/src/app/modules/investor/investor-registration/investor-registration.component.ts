import { Component, OnInit } from '@angular/core';
import {FormBuilder, FormGroup, Validators} from "@angular/forms";
import {FormValidatorService} from "../../../services/validator/form-validator.service";
import {InvestorService} from "../../../services/investor.service";
import {NotificationsService} from "angular2-notifications";
import {Router} from "@angular/router";
import {NgProgress} from "@ngx-progressbar/core";

@Component({
  selector: 'app-investor-registration',
  templateUrl: './investor-registration.component.html',
  styleUrls: ['./investor-registration.component.scss'],
})
export class InvestorRegistrationComponent implements OnInit {

  investorForm: FormGroup;

  constructor(private fb: FormBuilder,
              private investorService: InvestorService,
              private _notify: NotificationsService,
              private router: Router,
              public progress: NgProgress,) {
    this.investorForm = this.fb.group({
      first_name: ["", Validators.required],
      last_name: ["", Validators.required],
      email: ["", Validators.required],
      phone: ["", [Validators.required, FormValidatorService.phoneNumberValidator]]
    });
  }

  ngOnInit() {
  }

  onInvestorFormSubmit($event, value){
    this.progress.start('mainLoader');
    this.investorService.registerInvestor(value)
        .subscribe(data => {
          this.progress.complete('mainLoader');
          this._notify.success('Successfully submitted the Investor form');
          this.router.navigate([`/home`]);
        }, error => {
          this.progress.complete('mainLoader');
          this._notify.warn('Error occurred while submitting the form');
        })
  }

  getInvestorFormControl(type) {
    return this.investorForm.controls[type];
  }

}