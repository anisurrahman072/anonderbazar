import {Component, OnInit, ViewChild} from '@angular/core';
import {
    FormBuilder,
    FormControl,
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
import {NzNotificationService} from "ng-zorro-antd";
import {AdminUsersService} from "../../../../services/admin-users.service";

@Component({
    selector: 'app-admin-users-create',
    templateUrl: './admin-users-create.component.html',
    styleUrls: ['./admin-users-create.component.css']
})
export class AdminUsersCreateComponent implements OnInit {
    @ViewChild('Image') Image;
    id: number;
    data: any = [];
    sub: Subscription;
    userID: any;
    currentUser: any;
    genderSearchOptions = [
        {label: 'Male', value: 'male'},
        {label: 'Female', value: 'female'},
        {label: 'Not Specified', value: 'not-specified'}
    ];
    pass: any;
    zilaSearchOptions: any;
    upazilaSearchOptions: any;
    divisionSearchOptions: any;
    allGroups: any;
    division_id: number;
    zila_id: number;
    upazila_id: number;

    divisionSelect: any;
    oldImages = [];
    validateForm: FormGroup;
    ImageFile: File;

    group;
    gender;
    division;

    constructor(
        private router: Router,
        private route: ActivatedRoute,
        private _notification: NzNotificationService,
        private fb: FormBuilder,
        private craftsmanService: CraftsmanService,
        private adminUsersService: AdminUsersService,
        private authService: AuthService,
        private validationService: ValidationService,
        private areaService: AreaService
    ) {
    }

    ngOnInit() {
        this.validateForm = this.fb.group({
            username: [
                '',
                [Validators.required],
                [this.validationService.userNameTakenValidator.bind(this)]
            ],
            password: ['', [Validators.required]],
            confirmPassword: ['', [this.passwordConfirmationValidator]],
            email: [
                '',
                [this.validationService.emailValidator],
                [this.validationService.emailTakenValidator.bind(this)]
            ],
            first_name: ['', [Validators.required]],
            last_name: ['', [Validators.required]],
            phone: [
                '',
                [this.validationService.phoneValidator],
                [this.validationService.phoneTakenValidator.bind(this)]
            ],
            gender: ['', [Validators.required]],
            group_id: ['', [Validators.required]],
            upazila_id: ['', [Validators.required]],
            zila_id: ['', [Validators.required]],
            division_id: ['', [Validators.required]],
            avatar: ['', []]
        });

        this.currentUser = this.authService.getCurrentUser();

        this.areaService.getAllDivision().subscribe(result => {
            this.divisionSearchOptions = result;
        });

        this.adminUsersService.getAllGroups()
            .subscribe(result => {
                this.allGroups = result.data;
            })
    }

    /** Event method for submitting the admin user registration form */
    submitForm = ($event, value) => {
        $event.preventDefault();
        for (const key in this.validateForm.controls) {
            this.validateForm.controls[key].markAsDirty();
        }
        const formData: FormData = new FormData();
        formData.append('username', value.username);
        formData.append('password', value.password);
        formData.append('confirmPassword', value.password);
        formData.append('email', value.email);
        formData.append('first_name', value.first_name);
        formData.append('last_name', value.last_name);
        formData.append('phone', value.phone);
        formData.append('gender', value.gender);
        formData.append('group_id', value.group_id);
        formData.append('upazila_id', value.upazila_id);
        formData.append('zila_id', value.zila_id);
        formData.append('division_id', value.division_id);
        formData.append('address', " ");
        formData.append('permanent_address', " ");
        formData.append('national_id', " ");
        formData.append('father_name', " ");
        formData.append('mother_name', " ");
        formData.append('active', '1');
        formData.append('is_admin_user', '1');
        formData.append('is_verified', '1');

        if (this.ImageFile) {
            formData.append('hasImage', 'true');
            formData.append('avatar', this.ImageFile, this.ImageFile.name);
        } else {
            formData.append('hasImage', 'false');
        }
        this.adminUsersService.createAdminUser(formData).subscribe(result => {
            if (result.user) {
                this._notification.create('success',
                    result.user.name, 'New Admin user has been created successfully.');
                this.router.navigate(['/dashboard/admin-users/details', result.user.id]);
            }
        }, error => {
            this._notification.error('Failed!', 'Failed to create an admin user');
            console.log("admin user creation error: ", error);
        });
    };

    passwordConfirmationValidator = (
        control: FormControl
    ): { [s: string]: boolean } => {
        if (!control.value) {
            return {required: true};
        } else if (control.value !== this.validateForm.controls['password'].value) {
            return {confirm: true, error: true};
        }
    };


    /** Event method for removing picture */
    onRemoved(file: FileHolder) {
        this.ImageFile = null;
    }

    /** Event method for storing imgae in variable */
    onBeforeUpload = (metadata: UploadMetadata) => {
        this.ImageFile = metadata.file;

        return metadata;
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


    /** Method for division change */
    divisionChange($event) {
        const query = encodeURI($event);
        this.validateForm.controls.zila_id.patchValue(null);
        this.areaService.getAllZilaByDivisionId(query).subscribe(result => {
            this.zilaSearchOptions = result;
        });
    }

    /** Method for zila change */
    zilaChange($event) {
        const query = encodeURI($event);
        this.validateForm.controls.upazila_id.patchValue(null);

        this.areaService.getAllUpazilaByZilaId(query).subscribe(result => {
            this.upazilaSearchOptions = result;
        });
    }

}
