import {Component, OnDestroy, OnInit, ViewChild} from '@angular/core';
import {
    FormBuilder,
    FormGroup,
    Validators
} from '@angular/forms';
import {ActivatedRoute, Router} from '@angular/router';
import {Subscription} from 'rxjs';
import {NzNotificationService} from 'ng-zorro-antd';
import {FileHolder, UploadMetadata} from 'angular2-image-upload';
import {WarehouseService} from '../../../../services/warehouse.service';
import {AreaService} from '../../../../services/area.service';
import {environment} from "../../../../../environments/environment";
import {ValidationService} from "../../../../services/validation.service";
import {UserService} from "../../../../services/user.service";
import {UniqueEmailValidator} from "../../../../services/validator/UniqueEmailValidator";
import {UniqueUsernameValidator} from "../../../../services/validator/UniqueUsernameValidator";
import {UniquePhoneValidator} from "../../../../services/validator/UniquePhoneValidator";
import * as ClassicEditor from '@ckeditor/ckeditor5-build-classic';

@Component({
    selector: 'app-warehouse-edit',
    templateUrl: './warehouse-edit.component.html',
    styleUrls: ['./warehouse-edit.component.css']
})
export class WarehouseEditComponent implements OnInit, OnDestroy {
    Editor = ClassicEditor;

    @ViewChild('Image') Image;
    id: number;
    userId: number;
    data: any = [];
    sub: Subscription;
    zilaSearchOptions: any;
    upazilaSearchOptions: any;
    divisionSearchOptions: any;
    division_id: number;
    zila_id: number;
    upazila_id: number;
    current = 0;
    _spinning: boolean = false;
    submitting: boolean = false;
    divisionSelect: any;
    ImageFileEdit: any[] = [];
    ImageLogoFileEdit: any[] = [];
    IMAGE_ENDPOINT = environment.IMAGE_ENDPOINT;
    validateForm: FormGroup;
    avatarImageFile: File;
    logoFile: File;

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
    genderSearchOptions = [
        {label: 'Male', value: 'male'},
        {label: 'Female', value: 'female'},
        {label: 'Others', value: 'not-specified'}
    ];

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
            id: ['', [Validators.required]],
            name: ['', [Validators.required]],
            username: ['', [Validators.required], [this.uniqueUsernameValidator]],
            first_name: ['', [Validators.required]],
            last_name: ['', [Validators.required]],
            gender: ['', [Validators.required]],
            license_no: ['', [Validators.required]],
            tin_no: ['', []],

            code: [''],
            address: ['', [Validators.required]],
            upazila_id: ['', [Validators.required]],
            zila_id: ['', [Validators.required]],
            division_id: ['', [Validators.required]],
            postal_code: ['', [Validators.required]],
            phone: ['', [Validators.required], [this.uniquePhoneValidator]],
            email: ['', [Validators.required], [this.uniquEmailValidator]],
            invoice_footer: ['', []],
            logo: [''],
            award_points: ['']
        });

        this.areaService.getAllDivision().subscribe(result => {
            console.log('getAllDivision', result);
            this.divisionSearchOptions = result;
        }, (err) => {
            console.log(err)
        });

        this.sub = this.route.params.subscribe(params => {
            this.id = +params['id']; // (+) converts string 'id' to a number
            this._spinning = true;
            this.warehouseService.getById(this.id).subscribe(result => {

                this.data = result;
                this.ImageFileEdit = [];
                this.ImageLogoFileEdit = [];
                this.validateForm.patchValue(this.data);
                let user = this.data.user[0];
                this.userId = user.id;

                this.uniqueUsernameValidator.setExcludeId(this.userId);
                this.uniquEmailValidator.setExcludeId(this.userId);
                this.uniquePhoneValidator.setExcludeId(this.userId);

                this.validateForm.patchValue({
                    first_name: user.first_name,
                    last_name: user.last_name,
                    gender: user.gender,
                    username: user.username,
                    division_id: this.data.division_id.id,
                    zila_id: this.data.zila_id.id,
                    upazila_id: this.data.upazila_id.id
                });

                this.division_id = this.data.division_id.id;
                this.zila_id = this.data.zila_id.id;
                this.upazila_id = this.data.upazila_id.id;

                if (this.data && this.data.user[0].avatar) {
                    this.ImageFileEdit.push(this.IMAGE_ENDPOINT + this.data.user[0].avatar);
                }
                if (this.data && this.data.logo) {
                    this.ImageLogoFileEdit.push(this.IMAGE_ENDPOINT + this.data.logo);
                }
                this._spinning = false;
            }, (error) => {
                this._spinning = false;
            });
        });
    }

    ngOnDestroy(): void {
        this.sub ? this.sub.unsubscribe() : '';
    }

//Event method for submitting the form
    submitForm = ($event, value) => {
        $event.preventDefault();
        for (const key in this.validateForm.controls) {
            this.validateForm.controls[key].markAsDirty();
        }
        if(this.validateForm.invalid){
            return false;
        }
        const formData: FormData = new FormData();

        formData.set('userdata', JSON.stringify({
            id: this.userId,
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
        }));

        if (this.logoFile) {
            formData.append('image', this.logoFile, this.logoFile.name);
            formData.set('hasLogo', 'true');
        }

        if (this.avatarImageFile) {
            formData.append('image', this.avatarImageFile, this.avatarImageFile.name);
            formData.set('hasAvatar', 'true');
        }

        formData.set('name', value.name);
        formData.set('code', '');
        formData.set('phone', value.phone);
        formData.set('email', value.email);
        formData.set('license_no', value.license_no);
        formData.set('tin_no', value.tin_no);
        formData.set('country', 'Bangladesh');
        formData.set('division_id', value.division_id);
        formData.set('zila_id', value.zila_id);
        formData.set('upazila_id', value.upazila_id);
        formData.set('address', value.address);
        formData.set('postal_code', value.postal_code);
        formData.set('invoice_footer', value.invoice_footer);

        this.submitting = true;  this._spinning = true;
        this.warehouseService.update(this.id, formData).subscribe((result: any) => {
            this._spinning = false;
            if(result && result.warehouse && result.warehouse.id){
                this._notification.create('success', 'Shop has been updated successfully', result.warehouse.name);
                this.router.navigate(['/dashboard/warehouse/details', this.id]);
            } else {
                this._notification.create('error', 'Failure message', 'Shop has not been updated successfully');
            }
        }, (err) => {
            this._notification.error('Problem!', "Problem in creating Shop");
            console.log(err);
            this.submitting = false;
            this._spinning = false;
        });
    };

    //Event method for submitting the form
    updateUser(value, warehouse) {
        const formData: FormData = new FormData();
        formData.append('username', value.username);
        formData.append('email', value.email);
        formData.append('first_name', value.first_name);
        formData.append('last_name', value.last_name);

        formData.append('phone', value.phone);
        formData.append('national_id', value.national_id);
        formData.append('gender', value.gender);
        formData.append('group_id', this.data.user[0].group_id);
        formData.append('address', value.address);
        formData.append('upazila_id', value.upazila_id);
        formData.append('zila_id', value.zila_id);
        formData.append('division_id', value.division_id);
        formData.append('active', this.data.user[0].active);
        formData.append('warehouse_id', warehouse.id);
        if (this.avatarImageFile) {
            formData.append('avatar', this.avatarImageFile, this.avatarImageFile.name);
            formData.append('hasImage', 'true');

        } else {
            formData.append('hasImage', 'false');

        }
        this.userService.update(this.data.user[0].id, formData)
            .subscribe((result => {
                    if (result) {
                        this._notification.create('success', 'দোকানের তথ্য সফলভাবে আপডেট হয়েছে।', warehouse.name);
                        this.router.navigate(['/dashboard/warehouse/details', this.id]);

                    } else {
                        this._notification.create('error', 'Failure message', 'দোকানের তথ্য সফলভাবে আপডেট হয়নি।');

                    }
                }),
                (err => {
                    this._notification.create('error', 'Failure message', 'দোকানের তথ্য সফলভাবে আপডেট হয়নি।');
                })
            );
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

    //Event method for removing picture
    onRemovedAvatar(file: FileHolder) {
        this.avatarImageFile = null;
    }

//Event method for storing imgae in variable
    onBeforeUploadAvatar = (metadata: UploadMetadata) => {
        this.avatarImageFile = metadata.file;

        return metadata;
    }

    //Event method for removing logo
    onLogoRemoved(file: FileHolder) {
        this.logoFile = null;
    }

    //Event method for storing logo in variable
    onBeforeLogoUpload = (metadata: UploadMetadata) => {
        this.logoFile = metadata.file;
        return metadata;
    }


    //Method for division change

    divisionChange($event) {
        const query = encodeURI($event);
        this.zila_id = null;
        this.areaService.getAllZilaByDivisionId(query).subscribe(result => {
            console.log('getAllZilaByDivisionId', result);
            this.zilaSearchOptions = result;
            const d = this.zilaSearchOptions.filter(
                c => c.id === this.data.zila_id.id
            );
            if (d[0]) {
                this.zila_id = d[0].id;
            } else {
                this.zila_id = null;
            }
        }, (err) => {
            console.log(err);
        });
    }

    //Method for zila change

    zilaChange($event) {
        const query = encodeURI($event);
        this.upazila_id = null;
        this.areaService.getAllUpazilaByZilaId(query).subscribe(result => {
            this.upazilaSearchOptions = result;
            const d = this.upazilaSearchOptions.filter(
                c => c.id === this.data.upazila_id.id
            );
            if (d[0]) {
                this.upazila_id = d[0].id;
            } else {
                this.upazila_id = null;
            }
        });
    }

}
