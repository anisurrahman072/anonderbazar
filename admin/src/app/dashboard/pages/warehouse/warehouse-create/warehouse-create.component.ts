import {Component, ElementRef, OnInit, ViewChild} from '@angular/core';
import {FormBuilder, FormControl, FormGroup, Validators} from '@angular/forms';
import {ActivatedRoute, Router} from '@angular/router';
import {NzNotificationService} from 'ng-zorro-antd';
import {UploadMetadata, FileHolder} from 'angular2-image-upload';
import {WarehouseService} from '../../../../services/warehouse.service';
import {AreaService} from '../../../../services/area.service';
import {FormValidatorService} from "../../../../services/validator/form-validator.service";
import {ValidationService} from "../../../../services/validation.service";
import {UserService} from "../../../../services/user.service";

@Component({
    selector: 'app-warehouse-create',
    templateUrl: './warehouse-create.component.html',
    styleUrls: ['./warehouse-create.component.css']
})
export class WarehouseCreateComponent implements OnInit {
    validateForm: FormGroup;
    ImageFile: File;
    logoFile: File;
    @ViewChild('Image') Image;

    current = 0;
    genderSearchOptions = [
        {label: 'Male', value: 'male'},
        {label: 'Female', value: 'female'},
        {label: 'Others', value: 'not-specified'}
    ];
    divisionSearchOptions = [];
    zilaSearchOptions: any;
    upazilaSearchOptions: any;
    submitting: boolean = false;
    ckConfig = {
        uiColor: '#662d91',
        toolbarGroups: [
            {
                name: 'basicstyles',
                group: [
                    'Bold',
                    'Italic',
                    'Underline',
                    'Strike',
                    'Subscript',
                    'Superscript',
                    '-',
                    'JustifyLeft',
                    'JustifyCenter',
                    'JustifyRight',
                    'JustifyBlock',
                    '-',
                    'BidiLtr',
                    'BidiRtl',
                    'Language'
                ]
            },
            {
                name: 'paragraph',
                groups: ['JustifyLeft', 'JustifyCenter', 'JustifyRight', 'JustifyBlock']
            },
            {name: 'styles', groups: ['Styles', 'Format', 'Font', 'FontSize']}
        ],
        removeButtons: 'Source,Save,Templates,Find,Replace,Scayt,SelectAll'
    };

    constructor(private router: Router,
                private route: ActivatedRoute,
                private _notification: NzNotificationService,
                private fb: FormBuilder,
                private areaService: AreaService,
                private warehouseService: WarehouseService,
                private validationService: ValidationService,
                private userService: UserService,) {
        this.validateForm = this.fb.group({
            name: ['', [Validators.required]],
            username: ['', [Validators.required], [this.validationService.userNameTakenValidator.bind(this)]],
            password: ['', [Validators.required]],
            confirmPassword: ['', [this.passwordConfirmationValidator]],
            first_name: ['', [Validators.required]],
            last_name: ['', [Validators.required]],
            gender: ['', [Validators.required]],
            national_id: ['', [Validators.required]],
            license_no: ['', [Validators.required]],
            tin_no: ['', []],

            buffer_time: ['', []],
            code: [''],
            address: ['', [Validators.required]],
            division_id: [null, [Validators.required]],
            zila_id: [null, [Validators.required]],
            upazila_id: [null, [Validators.required]],
            postal_code: ['', [Validators.required]],
            phone: ['', [Validators.required, FormValidatorService.phoneNumberValidator]],
            email: ['', [Validators.required, FormValidatorService.emailValidator]],
            invoice_footer: ['', []],
            logo: ['']
        });
    }

    //Method for password form control validation
    passwordConfirmationValidator = (control: FormControl): { [s: string]: boolean } => {
        if (!control.value) {
            return {required: true};
        } else if (control.value !== this.validateForm.controls['password'].value) {
            return {confirm: true, error: true};
        }
    };

    //Event method for submitting the form
    submitForm = ($event, value) => {
        this.submitting = true;
        $event.preventDefault();
        for (const key in this.validateForm.controls) {
            this.validateForm.controls[key].markAsDirty();
        }

        if (value.username) {
            this.userService.checkUsername(value.username).subscribe(result => {
                if(result.total == 0){
                    console.log('checkUsername', result)

                    const formData: FormData = new FormData();

                    formData.append('name', value.name);
                    formData.append('phone', value.phone);
                    formData.append('email', value.email);
                    formData.append('code', '');
                    formData.append('buffer_time', '0');
                    formData.append('license_no', value.license_no);
                    formData.append('tin_no', value.tin_no);
                    formData.append('country', "Bangladesh");
                    formData.append('division_id', value.division_id);
                    formData.append('zila_id', value.zila_id);
                    formData.append('upazila_id', value.upazila_id);
                    formData.append('address', value.address);
                    formData.append('postal_code', value.postal_code);
                    formData.append('status', "1");

                    if (this.logoFile) {
                        console.log(this.logoFile);
                        formData.append('logo', this.logoFile, this.logoFile.name);
                        formData.append('hasLogo', 'true');
                    } else {
                        formData.append('hasLogo', 'false');
                    }

                    formData.append('invoice_footer', value.invoice_footer);
                    this.warehouseService.insert(formData).subscribe(result => {
                        console.log('Aniss 2nd');
                        if (result.id) {
                            this.userInsert(value, result);
                        }
                        this.submitting = false;
                    });
                } else {
                    this.submitting = false;
                    this._notification.create(
                        'error',
                        'User already exists',
                        'User already exists with this provided username'
                    );
                }

            })
        }
    };

    // Event method for submitting the form
    userInsert(value, warehouse) {

        const formData: FormData = new FormData();

        formData.append('username', value.username);
        formData.append('password', value.password);
        formData.append('confirmPassword', value.password);
        formData.append('email', value.email);
        formData.append('first_name', value.first_name);
        formData.append('last_name', value.last_name);
        formData.append('phone', value.phone);
        formData.append('national_id', value.national_id);
        formData.append('gender', value.gender);
        formData.append('group_id', '4');
        formData.append('address', value.address);
        formData.append('upazila_id', value.upazila_id);
        formData.append('zila_id', value.zila_id);
        formData.append('division_id', value.division_id);
        formData.append('active', '1');
        formData.append('warehouse_id', warehouse.id);

        if (this.ImageFile) {
            formData.append('avatar', this.ImageFile, this.ImageFile.name);
            formData.append('hasImage', 'true');

        } else {
            formData.append('hasImage', 'false');

        }
        this.userService.insert(formData)
            .subscribe((result => {
                    if (result) {
                        this.submitting = false;
                        this._notification.create(
                            'success',
                            'New Shop has been successfully created!',
                            result.name
                        );
                        this.router.navigate(['/dashboard/warehouse/details/', warehouse.id]);

                    } else {
                        this.submitting = false;
                        this._notification.create('error', 'Failure message', 'Operation has been failed. Please try again later.');

                    }
                }),
                (err => {
                    this.submitting = false;
                    this._notification.create('error', 'Failure message', 'Operation has been failed. Please try again later.');
                })
            );
    }

    //Event method for removing picture
    onRemoved(file: FileHolder) {
        this.ImageFile = null;
    }

    // Event method for storing imgae in variable
    onBeforeUpload = (metadata: UploadMetadata) => {
        this.ImageFile = metadata.file;

        return metadata;
    }

    // Event method for removing logo
    onLogoRemoved(file: FileHolder) {
        this.logoFile = null;
    }

    // Event method for storing logo in variable
    onBeforeLogoUpload = (metadata: UploadMetadata) => {
        this.logoFile = metadata.file;
        console.log(this.logoFile);

        return metadata;
    }

    // Event method for resetting the form
    resetForm($event: MouseEvent) {
        $event.preventDefault();
        this.validateForm.reset();
        for (const key in this.validateForm.controls) {
            this.validateForm.controls[key].markAsPristine();
        }
    }

    // Event method for setting up form in validation
    getFormControl(name) {
        return this.validateForm.controls[name];
    }

    // init the component
    ngOnInit() {
        this.areaService.getAllDivision().subscribe(result => {
            this.divisionSearchOptions = result;
        });
    }

    //Method for division search change

    divisionSearchChange($event: string) {
        const query = encodeURI($event);
    }

    //Method for division change

    divisionChange($event) {
        const query = encodeURI($event);

        this.areaService.getAllZilaByDivisionId(query).subscribe(result => {
            this.zilaSearchOptions = result;
        });
    }

    //Method for zila change

    zilaChange($event) {
        const query = encodeURI($event);
        this.areaService.getAllUpazilaByZilaId(query).subscribe(result => {
            this.upazilaSearchOptions = result;
        });
    }

    zilaSearchChange($event: string) {
    }

    upazilaSearchChange($event: string) {
    }
}
