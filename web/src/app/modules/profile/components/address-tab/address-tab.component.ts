import {Component, OnInit} from '@angular/core';
import {AuthService, AreaService} from "../../../../services";
import {PaymentAddressService} from "../../../../services/payment-address.service";
import {Validators, FormGroup, FormBuilder} from '@angular/forms';
import {Router} from "@angular/router";
import {NotificationsService} from "angular2-notifications";
import {FormValidatorService} from "../../../../services/validator/form-validator.service";

@Component({
    selector: "Address-tab",
    templateUrl: "./address-tab.component.html",
    styleUrls: ["./address-tab.component.scss"]
})
export class AddressTabComponent implements OnInit {
    divisionSearchOptions: any;
    zilaSearchOptions: any;
    upazilaSearchOptions: any;
    addAddressForm: FormGroup;
    editAddressForm: FormGroup;
    showForm: any;
    showClear: any;
    user_id: any;
    addresses: any;
    editAddressId: number;
    showEdit: boolean = false;

    /*
    * constructor for AddressTabComponent
    */
    constructor(private areaService: AreaService,
                private fb: FormBuilder,
                private _notify: NotificationsService,
                private paymentAddressService: PaymentAddressService,
                private route: Router,
                private authService: AuthService
    ) {

        //adding form validation
        this.addAddressForm = this.fb.group({
            first_name: ['', Validators.required],
            last_name: ['', Validators.required],
            address: ['', Validators.required],
            postal_code: ['', Validators.required],
            phone: ['', [Validators.required, FormValidatorService.phoneNumberValidator]],
            division_id: ['', Validators.required],
            upazila_id: ['', Validators.required],
            zila_id: ['', Validators.required]
        });

        //adding edit form validation
        this.editAddressForm = this.fb.group({
            first_name: ['', Validators.required],
            last_name: ['', Validators.required],
            address: ['', Validators.required],
            postal_code: ['', Validators.required],
            phone: ['', [Validators.required, FormValidatorService.phoneNumberValidator]],
            division_id: ['', Validators.required],
            upazila_id: ['', Validators.required],
            zila_id: ['', Validators.required]
        });
        this.showForm = false;
        this.showClear = false;
    }

    //init the component
    ngOnInit() {
        this.user_id = this.authService.getCurrentUserId();

        //for getting the address data
        this.getAddressList();

        this.areaService.getAllDivision().subscribe(result => {
            this.divisionSearchOptions = result;
        });
    }

    //Event method for getting address data
    getAddressList() {
        this.paymentAddressService.getpaymentaddress(this.user_id).subscribe(result => {
            this.addresses = result;
        });
    }

    //Event method for deleting address
    deleteAddress(id) {
        console.log('id', id);

        this.paymentAddressService.delete(id).subscribe(result => {
            this.getAddressList();
            this._notify.success('Address delete successful');
        });
    }

    //Event method for creating address
    public formCreateAddress = ($event, value) => {
        value.user_id = this.user_id;
        if (this.addAddressForm.valid) {
            this.paymentAddressService.insert(value).subscribe(result => {
                this.getAddressList();
                this._notify.success('New Address added successfully.');
                this.showForm = false;
                this.showClear = false;
            });
        }
    }

    //Event called for division change
    divisionChange($event) {
        var divisionId = $event.value;
        this.areaService.getAllZilaByDivisionId(divisionId).subscribe(result => {
            this.zilaSearchOptions = result;
        });
    }

    //Event called for zila change
    zilaChange($event) {
        var zilaId = $event.value;
        this.areaService.getAllUpazilaByZilaId(zilaId).subscribe(result => {
            this.upazilaSearchOptions = result;
        });
    }

    //Event called for reseting form
    reset(e) {
        e.preventDefault();
        this.addAddressForm.reset();
    }

    //Event called for showing the form
    setShow() {
        this.showForm = true;
        this.showClear = true;
    }

    //Event called for hiding the form
    removeShow() {
        this.showForm = false;
        this.showClear = false;
    }

    //Event called for fillup the edit form data
    addressEdit(address) {
        this.areaService.getAllZilaByDivisionId(address.division_id.id).subscribe(result => {
            this.zilaSearchOptions = result;
            this.areaService.getAllUpazilaByZilaId(address.zila_id.id).subscribe(result => {
                this.upazilaSearchOptions = result;
                this.editAddressForm.patchValue({
                    first_name: address.first_name,
                    last_name: address.last_name,
                    phone: address.phone,
                    address: address.address,
                    postal_code: address.postal_code,
                    division_id: address.division_id.id,
                    zila_id: '' + address.zila_id.id,
                    upazila_id: '' + address.upazila_id.id,
                });
                this.editAddressId = address.id;
                this.showEdit = true;
            });
        });
    }

    //Event called for submitting address edit
    public formEditAddress = ($event, value) => {
        if (this.editAddressForm.valid) {
            value.user_id = this.user_id;
            this.paymentAddressService.update(this.editAddressId, value).subscribe(result => {
                this.getAddressList();
                this.showEdit = false;
                this._notify.success('Address edit successful');
            });
        }
    }

    //Event called for getting data for new address create form
    getAddAddressFormControl(type) {
        return this.addAddressForm.controls[type];
    }

    //Event called for getting data for edit address form
    getEditAddressFormControl(type) {
        return this.editAddressForm.controls[type];
    }
}
