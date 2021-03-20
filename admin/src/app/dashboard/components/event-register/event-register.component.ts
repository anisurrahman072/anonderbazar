import { Component, OnInit } from '@angular/core';
import { EventService } from '../../../services/event.service';
import { AuthService } from '../../../services/auth.service';
import { FormBuilder, FormGroup, Validators, FormControl } from "@angular/forms";
import { AreaService } from '../../../services/area.service';
import { ValidationService } from '../../../services/validation.service';
import { NzNotificationService } from 'ng-zorro-antd';
import { EventPriceService } from '../../../services/event-price.service';
import { EventRegistrationService } from '../../../services/event-registration.service';
import { Router } from '@angular/router';
import {environment} from "../../../../environments/environment";

@Component({
  selector: 'app-event-register',
  templateUrl: './event-register.component.html',
  styleUrls: ['./event-register.component.css']
})
export class EventRegisterComponent implements OnInit {
  status: any;
  limit: number = 10;
  page: number = 1;
  data = [];
  IMAGE_ENDPOINT = environment.IMAGE_ENDPOINT;
  currentUser: any;
  isVisibleResitrationForm: boolean = false;
  eventTitle: string;
  listOfOption = [];
  validateForm: FormGroup;
  zilaSearchOptions: any;
  upazilaSearchOptions: any;
  permanent_zilaSearchOptions: any;
  permanent_upazilaSearchOptions: any;
  divisionSearchOptions: any;
  permanent_divisionSearchOptions: any;
  isConfirmLoading = false;
  current = 0;

  index = 'first';
  addedPrices: any;
  dataModel: any = [];
  totalOfValue: number = 0;
  _isSpinning: boolean;
  result: any;
  total: number = 0;
  totalofPrice: any;
  constructor(private router: Router,
    private eventService: EventService,
    private authService: AuthService,
    private validationService: ValidationService,
    private areaService: AreaService,
    private _notification: NzNotificationService,
    private eventPriceService: EventPriceService,
    private eventRegistrationService: EventRegistrationService,
    private fb: FormBuilder
  ) {

  }

  //Event method for getting all the data for the page
  ngOnInit() {
    this.validateForm = this.fb.group({
      name: ["", [Validators.required]],
      father_name: ["", [Validators.required]],
      mother_name: ["", [Validators.required]],
      email: ['', [this.validationService.emailValidator], [this.validationService.emailTakenValidator.bind(this)]],
      phone: ['', [this.validationService.phoneValidator], [this.validationService.phoneTakenValidator.bind(this)]],
      workplace: [""],
      designation: [""],
      national_id: ['', [Validators.required]],
      admin_email: ['', [Validators.required]],
      admin_phone: ['', [Validators.required]],
      entry_number: ['', [Validators.required]],
      exhibition_products: ['', [Validators.required]],
      address: ['', [Validators.required]],
      upazila_id: ['', [Validators.required]],
      zila_id: ['', [Validators.required]],
      division_id: ['', [Validators.required]],
      permanent_address: ['', [Validators.required]],
      permanent_upazila_id: ['', [Validators.required]],
      permanent_zila_id: ['', [Validators.required]],
      permanent_division_id: ['', [Validators.required]],
      value: ['', [Validators.required]]
    });
    this.currentUser = this.authService.getCurrentUser();

    this.loadEventListData(this.currentUser.userInfo.id, this.status, this.page, this.limit);

    this.areaService.getAllDivision().subscribe(result => {
      this.divisionSearchOptions = result;
      this.permanent_divisionSearchOptions = result;
    });
  }
  //Event method for getting all the data for the page

  loadEventListData(id: number, status: number, page: number, limit: number) {
    this.eventService.getAllEventsByStatus(id, status, page, limit)
      .subscribe(result => {
        // this.result = result;
        this.data = result.data;
      });
  }
  handleCancel($event) {
    this.isVisibleResitrationForm = false;
  }

  handleOk($event) {

  }

//Event method for submitting the form

  submitForm = ($event, value) => {
    $event.preventDefault();
    for (const key in this.validateForm.controls) {
      this.validateForm.controls[key].markAsDirty();
    }
    let personorstall_combination = [];
    this.addedPrices.forEach(element => {
      let value = element.id + ':' + element.value;
      personorstall_combination.push(value);
    });

    const formData: FormData = new FormData();
    formData.append('user_id', this.currentUser.userInfo.id);
    formData.append('event_id', this.dataModel.id);
    formData.append('entry_number', value.entry_number);
    formData.append('person_or_stallamount', personorstall_combination.toString());
    formData.append('total', this.totalOfValue.toString());
    formData.append('reg_fee', this.totalofPrice.toString());
    formData.append('exhibition_products', value.exhibition_products);

    this.eventRegistrationService.insert(formData).subscribe(result => {
      if (result.id) {
        this._notification.create(
          "success",
          "Event registration has been done successfully",
          result.name
        );
        setTimeout(() => {
          this._isSpinning = false;

          this.router.navigate(["/dashboard"]);
          this.isVisibleResitrationForm = false;
          this.loadEventListData(this.currentUser.userInfo.id, this.status, this.page, this.limit);
        }, 1000);
      }
    });
  };
      //Method for showing the modal

  showModalOnline(event_type: number, event_id: number) {
    this.totalOfValue = 0;
    this.isVisibleResitrationForm = true;
    if (event_type === 1) {
      this.eventTitle = "মেলার রেজিস্ট্রেশন";
    } else if (event_type === 2) {
      this.eventTitle = "প্রশিক্ষণের রেজিস্ট্রেশন";
    } else {
      this.eventTitle = "ইভেন্টের রেজিস্ট্রেশন";
    }

    this.eventService.getById(event_id).subscribe(result => {
      this.dataModel = result;
      this.eventPriceService.getSelectedPrices(result.event_price_ids).subscribe(result => {
        this.addedPrices = result.data;
      });
      this.validateForm.patchValue({
        name: this.currentUser.userInfo.first_name + " " + this.currentUser.userInfo.last_name,
        father_name: this.currentUser.userInfo.father_name,
        mother_name: this.currentUser.userInfo.mother_name,
        email: this.currentUser.userInfo.email,
        phone: this.currentUser.userInfo.phone,
        workplace: this.currentUser.warehouse.address,
        designation: this.currentUser.userInfo.designation,
        national_id: this.currentUser.userInfo.national_id,
        admin_email: result.admin_email,
        admin_phone: result.admin_phone,
        entry_number: this.currentUser.userInfo.entry_number,
        exhibition_products: this.currentUser.userInfo.exhibition_products,
        address: this.currentUser.userInfo.address,
        permanent_address: this.currentUser.userInfo.permanent_address,
        permanent_upazila_id: this.currentUser.userInfo.permanent_upazila_id,
        permanent_zila_id: this.currentUser.userInfo.permanent_zila_id,
        permanent_division_id: this.currentUser.userInfo.permanent_division_id,
        value: 0
      });
      this.validateForm.controls.division_id.patchValue(
        this.currentUser.userInfo.division_id
      );
      this.validateForm.controls.zila_id.patchValue(this.currentUser.userInfo.zila_id);
      this.validateForm.controls.upazila_id.patchValue(
        this.currentUser.userInfo.upazila_id
      );

      this.validateForm.controls.permanent_division_id.patchValue(
        this.currentUser.userInfo.permanent_division_id
      );
      this.validateForm.controls.permanent_zila_id.patchValue(this.currentUser.userInfo.permanent_zila_id);
      this.validateForm.controls.permanent_upazila_id.patchValue(
        this.currentUser.userInfo.permanent_upazila_id
      );
    });
  }
//Event method for setting up form in validation

  getFormControl(name) {
    return this.validateForm.controls[name];
  }

  //Method for division change
  divisionChange($event) {
    this.validateForm.controls.zila_id.patchValue(null);
    this.validateForm.controls.upazila_id.patchValue(null);

    const query = encodeURI($event);
    if (query == 'null') {
      return;
    }
    this.areaService.getAllZilaByDivisionId(query).subscribe(
      result => {
        this.zilaSearchOptions = result;
      },
      error => { }
    );
  }
  //Method for zila change
  zilaChange($event) {
    this.validateForm.controls.upazila_id.patchValue(null);

    const query = encodeURI($event);

    if (query == 'null') {
      return;
    }
    this.areaService.getAllUpazilaByZilaId(query).subscribe(
      result => {
        this.upazilaSearchOptions = result;
      },
      error => { }
    );
  }

  //Method for get permanent division address

  permanent_divisionChange($event) {
    const query = encodeURI($event);
    this.validateForm.controls.permanent_zila_id.patchValue(null);
    this.areaService.getAllZilaByDivisionId(query).subscribe(result => {
      this.permanent_zilaSearchOptions = result;
    });
  }
  //Method for zila change

  permanent_zilaChange($event) {
    const query = encodeURI($event);
    this.validateForm.controls.permanent_upazila_id.patchValue(null);

    this.areaService.getAllUpazilaByZilaId(query).subscribe(result => {
      this.permanent_upazilaSearchOptions = result;
      // this.validateForm.controls.upazila_id.patchValue(query);
    });
  }

  //Method for delete registration
  deleteConfirm(index, id) {
    this.eventService.delete(id).subscribe(result => {
      this.eventService.getAllEventsByStatus(this.currentUser.userInfo.id, this.status, this.page, this.limit)
        .subscribe(result => {
          this.data = result.data;
        });
      this._notification.create(
        'Success',
        'Event has been removed successfully',
        ''
      );
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
  pre() {
    this.current -= 1;
    this.changeContent();
  }

  next() {
    this.current += 1;
    this.changeContent();
  }

  done() {

  }

  changeContent(): void {
    switch (this.current) {
      case 0: {
        this.index = 'first';
        break;
      }
      case 1: {
        this.index = 'second';
        break;
      }
      case 2: {
        this.index = 'third';
        break;
      }
      default: {
        this.index = 'error';
      }
    }
  }

  setValue(value: number, id: number, price:number) {
    this.totalOfValue = 0;
    this.totalofPrice = 0;
    this.addedPrices.forEach(element => {
      if (element.id === id) {
        element.value = +value;
        this.total = value * price;
        element.totalprice = this.total;
      }
    });
    this.addedPrices.forEach(element => {
      if (!element.value) {
        element.value = 0;
        element.totalprice = 0;
      }

      this.totalOfValue += +element.value;
      this.totalofPrice += element.totalprice;
    });
  }

}
