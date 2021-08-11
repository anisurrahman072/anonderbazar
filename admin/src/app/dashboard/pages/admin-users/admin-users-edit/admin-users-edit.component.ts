import {Component, OnInit, ViewChild} from '@angular/core';
import {
    FormBuilder,
    FormGroup,
    Validators
} from '@angular/forms';
import {ActivatedRoute, Router} from '@angular/router';
import {Subscription} from 'rxjs';
import {FileHolder, UploadMetadata} from 'angular2-image-upload';
import {CraftsmanService} from '../../../../services/craftsman.service';
import {AuthService} from '../../../../services/auth.service';
import {AreaService} from '../../../../services/area.service';
import {ValidationService} from '../../../../services/validation.service';
import {environment} from "../../../../../environments/environment";
import {NzNotificationService} from "ng-zorro-antd";
import {AdminUsersService} from "../../../../services/admin-users.service";

@Component({
    selector: 'app-admin-users-edit',
    templateUrl: './admin-users-edit.component.html',
    styleUrls: ['./admin-users-edit.component.css']
})
export class AdminUsersEditComponent implements OnInit {
    @ViewChild('Image') Image;
    id: number;
    data: any;
    sub: Subscription;
    ImageFileEdit: any[] = [];
    IMAGE_ENDPOINT = environment.IMAGE_ENDPOINT;
    userID: any;
    currentUser: any;
    genderSearchOptions = [
        {label: 'Male', value: 'male'},
        {label: 'Female', value: 'female'},
        {label: 'Not Specified', value: 'not-specified'}
    ];
    zilaSearchOptions: any;
    upazilaSearchOptions: any;
    divisionSearchOptions: any;
    division_id: number;
    zila_id: any;
    upazila_id: any;

    divisionSelect: any;
    oldImages = [];
    validateForm: FormGroup;
    ImageFile: File;
    _isSpinning: any = false;

    allGroups: any;
    group;
    gender;
    division;

    constructor(
        private router: Router,
        private route: ActivatedRoute,
        private _notification: NzNotificationService,
        private fb: FormBuilder,
        private validationService: ValidationService,
        private craftsmanService: CraftsmanService,
        private authService: AuthService,
        private areaService: AreaService,
        private adminUsersService: AdminUsersService,
    ) {
    }

    ngOnInit() {
        this._isSpinning = true;
        this.validateForm = this.fb.group({
            username: ['', [Validators.required]],
            email: ['', [this.validationService.emailValidator]],
            first_name: ['', [Validators.required]],
            last_name: ['', []],
            phone: ['', [Validators.required]],
            gender: ['', [Validators.required]],
            group_id: ['', [Validators.required]],
            upazila_id: ['', [Validators.required]],
            zila_id: ['', [Validators.required]],
            division_id: ['', [Validators.required]],
            avatar: ['', []]
        });

        this.areaService.getAllDivision().subscribe(result => {
            this.divisionSearchOptions = result;
        });

        this.adminUsersService.getAllGroups()
            .subscribe(result => {
                this.allGroups = result.data;
                this._isSpinning = false;
            })

        this.sub = this.route.params.subscribe(params => {
            this.id = +params['id']; // (+) converts string 'id' to a number
            this.adminUsersService.getById(this.id).subscribe(result => {
                this.ImageFileEdit = [];
                if (result) {
                    // @ts-ignore
                    this.data = result.data;
                    console.log('res da: ', this.data);
                    this.validateForm.patchValue(this.data);
                    this.validateForm.controls.division_id.patchValue(
                        this.data.division_id.id
                    );
                    this.validateForm.controls.zila_id.patchValue(this.data.zila_id.id);
                    this.validateForm.controls.upazila_id.patchValue(
                        this.data.upazila_id.id
                    );
                    this.validateForm.controls.group_id.patchValue(this.data.group_id.id);
                    if (this.data && this.data.avatar) {
                        this.ImageFileEdit.push(this.IMAGE_ENDPOINT + this.data.avatar);
                    }
                }
            });
        });
    }


    /** Event method for submitting the adminn user update form */
    submitForm = ($event, value) => {
        this._isSpinning = true;
        $event.preventDefault();
        for (const key in this.validateForm.controls) {
            this.validateForm.controls[key].markAsDirty();
        }
        const formData: FormData = new FormData();
        formData.set('username', value.username);
        formData.set('email', value.email);
        formData.set('first_name', value.first_name);
        formData.set('last_name', value.last_name);
        formData.set('phone', value.phone);
        formData.set('gender', value.gender);
        formData.append('group_id', value.group_id);
        formData.set('upazila_id', value.upazila_id);
        formData.set('zila_id', value.zila_id);
        formData.set('division_id', value.division_id);
        formData.set('active', '1');
        formData.append('user_type', 'admin');
        formData.append('is_verified', '1');

        if (this.ImageFile) {
            formData.set('hasImage', 'true');
            formData.append('avatar', this.ImageFile, this.ImageFile.name);
        } else {
            formData.set('hasImage', 'false');
        }
        this.adminUsersService.updateAdminUser(this.id, formData).subscribe(
            result => {
                this._notification.create('success', 'Admin user updated successfully', this.data.name);
                this.router.navigate(['/dashboard/admin-users/details', this.id]);
                this._isSpinning = false;
            },
            error => {
                this._notification.error('Failed!', 'Failed to update admin user');
                console.log("admin user update error: ", error);
                this._isSpinning = false;
            }
        );
    };

    /** Event method for resetting the form */
    resetForm($event: MouseEvent) {
        $event.preventDefault();
        this.validateForm.reset();
        for (const key in this.validateForm.controls) {
            this.validateForm.controls[key].markAsPristine();
        }
    }

    /** Event method for setting up form in validation */
    getFormControl(name) {
        return this.validateForm.controls[name];
    }


    /** Event method for removing picture */
    onRemoved(file: FileHolder) {
        this.ImageFile = null;
    }

    /** Event method for storing image in variable */
    onBeforeUpload = (metadata: UploadMetadata) => {
        this.ImageFile = metadata.file;
        return metadata;
    };


    /** Method for division change */
    divisionChange($event) {
        this.validateForm.controls.zila_id.patchValue(null);
        this.validateForm.controls.upazila_id.patchValue(null);

        const query = encodeURI($event);
        if (query == 'null') {
            return;
        }
        this.areaService.getAllZilaByDivisionId(query).subscribe(result => {
            this.zilaSearchOptions = result;
        });
    }

    /** Method for zila change */
    zilaChange($event) {
        this.validateForm.controls.upazila_id.patchValue(null);

        const query = encodeURI($event);

        if (query == 'null') {
            return;
        }
        this.areaService.getAllUpazilaByZilaId(query).subscribe(result => {
            this.upazilaSearchOptions = result;
        });
    }


}
