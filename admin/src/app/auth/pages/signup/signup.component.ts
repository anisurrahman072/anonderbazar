import {Component, OnInit, ViewChild} from '@angular/core';
import {AreaService} from '../../../services/area.service';
import {NzNotificationService} from 'ng-zorro-antd';
import {FileHolder, UploadMetadata} from 'angular2-image-upload';
import {FormBuilder, FormControl, FormGroup, Validators} from '@angular/forms';
import {ActivatedRoute, Router} from '@angular/router';
import {WarehouseService} from '../../../services/warehouse.service';
import {AuthService} from '../../../services/auth.service';
import {UserService} from '../../../services/user.service';
import {Subscription} from 'rxjs';
import {ValidationService} from "../../../services/validation.service";
import "rxjs/add/operator/delay";
import "rxjs/add/observable/timer";
import "rxjs/add/operator/switchMap";
import {UniqueEmailValidator} from "../../../services/validator/UniqueEmailValidator";
import {UniquePhoneValidator} from "../../../services/validator/UniquePhoneValidator";
import {UniqueUsernameValidator} from "../../../services/validator/UniqueUsernameValidator";

@Component({
    selector: 'app-signup',
    templateUrl: './signup.component.html',
    styleUrls: ['./signup.component.css']
})

export class SignupComponent implements OnInit {
    @ViewChild('Image') Image;
    id: number;
    data: any;
    sub: Subscription;
    userID: any;
    currentUser: any;
    current = 0;
    index = 'first';
    loginServerError: any;

    genderSearchOptions = [
        {label: 'Male', value: 'male'},
        {label: 'Female', value: 'female'},
        {label: 'Others', value: 'not-specified'}
    ];
    zilaSearchOptions: any;
    upazilaSearchOptions: any;
    divisionSearchOptions: any;
    division_id: any;
    zila_id: any;
    upazila_id: any;
    permanent_divisionSearchOptions: any;
    permanent_zilaSearchOptions: any;
    divisionSelect: any;
    oldImages = [];
    validateForm: FormGroup;
    ImageFile: File;
    logoFile: File;

    //Event method for submitting the form

    constructor(private router: Router, private route: ActivatedRoute,
                private _notification: NzNotificationService,
                private fb: FormBuilder,
                private userService: UserService,
                private authService: AuthService,
                private validationService: ValidationService,
                private areaService: AreaService,
                private warehouseService: WarehouseService,
                private uniquEmailValidator: UniqueEmailValidator,
                private uniqueUsernameValidator: UniqueUsernameValidator,
                private uniquePhoneValidator: UniquePhoneValidator,
    ) {

    }

    ngOnInit() {

        this.validateForm = this.fb.group({
            shop_name: ['', [Validators.required]],
            username: ['', [Validators.required], [this.uniqueUsernameValidator]],
            password: ['', [Validators.required]],
            confirmPassword: ['', [this.passwordConfirmationValidator]],
            email: ['', [this.validationService.emailValidator], [this.uniquEmailValidator]],
            first_name: ['', [Validators.required]],
            last_name: ['', [Validators.required]],
            phone: ['', [this.validationService.phoneValidator], [this.uniquePhoneValidator]],
            national_id: ['', [Validators.required]],
            gender: ['', [Validators.required]],
            address: ['', [Validators.required]],
            upazila_id: ['', [Validators.required]],
            zila_id: ['', [Validators.required]],
            division_id: ['', [Validators.required]],
            postal_code: ['', [Validators.required]],
            avatar: ['', []],
            logo: ['', []],
        });

        this.areaService.getAllDivision().subscribe(result => {
            this.divisionSearchOptions = result;
            this.permanent_divisionSearchOptions = result;
        });
    }

    submitForm = ($event, value) => {
        $event.preventDefault();
        for (const key in this.validateForm.controls) {
            this.validateForm.controls[key].markAsDirty();
        }

        console.log('value', value);

        const wareHouseFormData: FormData = new FormData();
        wareHouseFormData.append('name', value.shop_name);
        wareHouseFormData.append('email', value.email);
        wareHouseFormData.append('phone', value.phone);
        wareHouseFormData.append('address', value.address);
        wareHouseFormData.append('upazila_id', value.upazila_id);
        wareHouseFormData.append('zila_id', value.zila_id);
        wareHouseFormData.append('division_id', value.division_id);
        wareHouseFormData.append('postal_code', value.postal_code);
        wareHouseFormData.append('country', 'Bangladesh');

        if (this.logoFile) {
            wareHouseFormData.append('logo', this.logoFile, this.logoFile.name);
            wareHouseFormData.append('hasLogo', 'true');
        } else {
            wareHouseFormData.append('hasLogo', 'false');
        }

        wareHouseFormData.append('userdata', JSON.stringify({
            username: value.username,
            password: value.password,
            email: value.email,
            first_name: value.first_name,
            last_name: value.last_name,
            father_name: '',
            mother_name: '',
            phone: value.phone,
            national_id: value.national_id,
            gender: value.gender,
            address: value.address,
            upazila_id: value.upazila_id,
            zila_id: value.zila_id,
            division_id: value.division_id,
            hasImage: !!this.ImageFile,
        }));

        if (this.ImageFile) {
            wareHouseFormData.append('user_avatar', this.ImageFile, this.ImageFile.name);
        }
        /*        wareHouseFormData.append('user[password]', value.password);
                wareHouseFormData.append('user.confirmPassword', value.password);
                wareHouseFormData.append('user.email', value.email);
                wareHouseFormData.append('user.first_name', value.first_name);
                wareHouseFormData.append('user.last_name', value.last_name);
                wareHouseFormData.append('user.father_name', '');
                wareHouseFormData.append('user.mother_name', 'mother_name');

                wareHouseFormData.append('user.phone', value.phone);
                wareHouseFormData.append('user.national_id', value.national_id);
                wareHouseFormData.append('user.gender', value.gender);
                wareHouseFormData.append('user.group_id', '4');
                wareHouseFormData.append('user.address', value.address);
                wareHouseFormData.append('user.upazila_id', value.upazila_id);
                wareHouseFormData.append('user.zila_id', value.zila_id);
                wareHouseFormData.append('user.division_id', value.division_id);
                wareHouseFormData.append('user.active', '1');*/
        // formData.append('warehouse_id', warehouse.id);


        this.warehouseService.signup(wareHouseFormData)
            .subscribe((result => {
                    console.log(result);
                    if (result) {
                        this._notification.create('success', 'Successfully Message', 'You have been registered successfully');
                        localStorage.clear();
                        this.router.navigate(['/']);
                    } else {
                        this._notification.create('error', 'Failure message', 'Your registration was not successful');
                    }
                }),
                (err => {
                    this._notification.create('error', 'Failure message', 'Your registration was not successful');
                    this.loginServerError.show = true;
                    this.loginServerError.message = 'Your registration was not successful';
                })
            );
    };

    //Event method for password confirmation validation
    passwordConfirmationValidator = (control: FormControl): { [s: string]: boolean } => {
        if (!control.value) {
            return {required: true};
        } else if (control.value !== this.validateForm.controls['password'].value) {
            return {confirm: true, error: true};
        }
    };

    //Event method for removing the image added in form
    onRemoved(file: FileHolder) {
        this.ImageFile = null;
    }

    //storing the image before upload
    onBeforeUpload = (metadata: UploadMetadata) => {
        this.ImageFile = metadata.file;

        return metadata;
    }
    //storing the logo before upload

    onBeforeLogoUpload = (metadata: UploadMetadata) => {
        this.logoFile = metadata.file;

        return metadata;
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

    //Event method for getting all the data for the page


    //Method for division search change

    divisionSearchChange($event: string) {
        const query = encodeURI($event);
    }

    //Method for division change

    divisionChange($event) {
        const query = encodeURI($event);
        this.validateForm.controls.zila_id.patchValue(null);
        this.areaService.getAllZilaByDivisionId(query).subscribe(result => {
            this.zilaSearchOptions = result;
        });
    }

    //Method for zila change

    zilaChange($event) {
        const query = encodeURI($event);
        this.validateForm.controls.upazila_id.patchValue(null);

        this.areaService.getAllUpazilaByZilaId(query).subscribe(result => {
            this.upazilaSearchOptions = result;
        });
    }

    //Method for zila search change

    zilaSearchChange($event: string) {

    }

    //Method for upazila search change

    upazilaSearchChange($event: string) {

    }

    //Method for get permanent address

    permanent_divisionSearchChange($event: string) {
        const query = encodeURI($event);
    }

    //Method for get permanent division address

    permanent_divisionChange($event) {
        const query = encodeURI($event);
        this.validateForm.controls.permanent_zila_id.patchValue(null);
        this.areaService.getAllZilaByDivisionId(query).subscribe(result => {
            this.permanent_zilaSearchOptions = result;
        });
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

    toggle(current) {
        this.current = current;
        this.changeContent();
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
            default: {
                this.index = 'error';
            }
        }
    }
}
