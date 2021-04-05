import {Component, OnInit, ViewChild} from '@angular/core';
import {FormBuilder, FormControl, FormGroup, Validators} from '@angular/forms';
import {ActivatedRoute, Router} from '@angular/router';
import {NzNotificationService} from 'ng-zorro-antd';
import {UploadMetadata, FileHolder} from 'angular2-image-upload';
import {WarehouseService} from '../../../../services/warehouse.service';
import {AreaService} from '../../../../services/area.service';
import {ValidationService} from "../../../../services/validation.service";
import {UserService} from "../../../../services/user.service";
import {UniqueEmailValidator} from "../../../../services/validator/UniqueEmailValidator";
import {UniqueUsernameValidator} from "../../../../services/validator/UniqueUsernameValidator";
import {UniquePhoneValidator} from "../../../../services/validator/UniquePhoneValidator";

@Component({
    selector: 'app-warehouse-create',
    templateUrl: './warehouse-create.component.html',
    styleUrls: ['./warehouse-create.component.css']
})
export class WarehouseCreateComponent implements OnInit {
    @ViewChild('Image') Image;
    validateForm: FormGroup;
    AvatarImageFile: File;
    logoFile: File;
    pass: any;
    _spinning: boolean = false;
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
                private userService: UserService,
                private uniquEmailValidator: UniqueEmailValidator,
                private uniqueUsernameValidator: UniqueUsernameValidator,
                private uniquePhoneValidator: UniquePhoneValidator) {
    }

    // init the component
    ngOnInit() {
        this.validateForm = this.fb.group({
            name: ['', [Validators.required]],
            username: ['', [Validators.required], [this.uniqueUsernameValidator]],
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
            phone: ['', [Validators.required],   [this.uniquePhoneValidator]],
            email: ['', [Validators.required],   [this.uniquEmailValidator]],
            invoice_footer: ['', []],
            logo: ['']
        });

        this.areaService.getAllDivision().subscribe(result => {
            this.divisionSearchOptions = result;
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

        const formData: FormData = new FormData();

        formData.set('userdata', JSON.stringify({
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
            hasImage: !!this.AvatarImageFile,
        }));

        if (this.logoFile) {
            formData.append('image', this.logoFile, this.logoFile.name);
            formData.set('hasLogo', 'true');
        }

        if (this.AvatarImageFile) {
            formData.append('image', this.AvatarImageFile, this.AvatarImageFile.name);
            formData.set('hasAvatar', 'true');
        }

        formData.set('name', value.name);
        formData.set('phone', value.phone);
        formData.set('email', value.email);
        formData.set('code', '');
        formData.set('buffer_time', '0');
        formData.set('license_no', value.license_no);
        formData.set('tin_no', value.tin_no);
        formData.set('country', "Bangladesh");
        formData.set('division_id', value.division_id);
        formData.set('zila_id', value.zila_id);
        formData.set('upazila_id', value.upazila_id);
        formData.set('address', value.address);
        formData.set('postal_code', value.postal_code);
        formData.set('status', "1");

        formData.set('invoice_footer', value.invoice_footer);

        this._spinning = true;
        this.warehouseService.insert(formData).subscribe(result => {

            this.submitting = false;
            this._spinning = false;
            if(result.warehouse && result.warehouse.id){
                this._notification.create(
                    'success',
                    'New Shop has been successfully created!',
                    result.name
                );
                this.router.navigate(['/dashboard/warehouse/details/', result.warehouse.id]);
            } else {
                this._notification.error('Problem!', "Problem in creating Shop");
            }

        }, (err) => {
            this._notification.error('Problem!', "Problem in creating Shop");
            console.log(err);
            this.submitting = false;
            this._spinning = false;
        });

    };

    //Event method for removing picture
    onRemovedAvatar(file: FileHolder) {
        this.AvatarImageFile = null;
    }

    // Event method for storing imgae in variable
    onBeforeUploadAvatar = (metadata: UploadMetadata) => {
        this.AvatarImageFile = metadata.file;

        return metadata;
    }

    // Event method for removing logo
    onLogoRemoved(file: FileHolder) {
        this.logoFile = null;
    }

    // Event method for storing logo in variable
    onBeforeLogoUpload = (metadata: UploadMetadata) => {
        this.logoFile = metadata.file;

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

}
