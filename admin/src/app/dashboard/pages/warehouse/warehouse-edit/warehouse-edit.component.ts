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

@Component({
    selector: 'app-warehouse-edit',
    templateUrl: './warehouse-edit.component.html',
    styleUrls: ['./warehouse-edit.component.css']
})
export class WarehouseEditComponent implements OnInit, OnDestroy {
    @ViewChild('Image') Image;
    id: number;
    data: any = [];
    sub: Subscription;
    zilaSearchOptions: any;
    upazilaSearchOptions: any;
    divisionSearchOptions: any;
    division_id: number;
    zila_id: number;
    upazila_id: number;
    current = 0;

    divisionSelect: any;
    ImageFileEdit: any[] = [];
    ImageLogoFileEdit: any[] = [];
    IMAGE_ENDPOINT = environment.IMAGE_ENDPOINT;
    validateForm: FormGroup;
    ImageFile: File;
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
                private userService: UserService,) {

    }

    // init the component
    ngOnInit() {
        this.validateForm = this.fb.group({
            name: ['', [Validators.required]],
            username: ['', [Validators.required], [this.validationService.userNameTakenValidator.bind(this)]],
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
            phone: ['', [Validators.required]],
            email: ['', [Validators.required]],
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
            this.warehouseService.getById(this.id).subscribe(result => {
                console.log('this.warehouseService.getById(this.id)', result);
                this.data = result;
                this.ImageFileEdit = [];
                this.ImageLogoFileEdit = [];
                this.validateForm.patchValue(this.data);
                let user = this.data.user[0];
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
        const formData: FormData = new FormData();
        formData.append('name', value.name);
        formData.append('code', '');
        formData.append('phone', value.phone);
        formData.append('email', value.email);
        formData.append('license_no', value.license_no);
        formData.append('tin_no', value.tin_no);
        formData.append('country', 'Bangladesh');
        formData.append('division_id', value.division_id);
        formData.append('zila_id', value.zila_id);
        formData.append('upazila_id', value.upazila_id);
        formData.append('address', value.address);
        formData.append('postal_code', value.postal_code);
        formData.append('invoice_footer', value.invoice_footer);
        if (this.logoFile) {
            formData.append('logo', this.logoFile, this.logoFile.name);
            formData.append('haslogo', 'true');
        } else {
            formData.append('haslogo', 'false');
        }
        this.warehouseService.update(this.id, formData).subscribe(result => {
            this.updateUser(value, result[0]);
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
        if (this.ImageFile) {
            formData.append('avatar', this.ImageFile, this.ImageFile.name);
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
    onRemoved(file: FileHolder) {
        this.ImageFile = null;
    }

//Event method for storing imgae in variable
    onBeforeUpload = (metadata: UploadMetadata) => {
        this.ImageFile = metadata.file;

        return metadata;
    }

    //Event method for removing logo
    onLogoRemoved(file: FileHolder) {
        this.logoFile = null;
    }

    //Event method for storing logo in variable
    onBeforeLogoUpload = (metadata: UploadMetadata) => {
        this.logoFile = metadata.file;
        console.log(this.logoFile);

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
