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

@Component({
    selector: 'app-warehouse-edit',
    templateUrl: './craftsman-create.component.html',
    styleUrls: ['./craftsman-create.component.css']
})
export class CraftsmanCreateComponent implements OnInit {
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

    zilaSearchOptions: any;
    upazilaSearchOptions: any;
    divisionSearchOptions: any;
    division_id: number;
    zila_id: number;
    upazila_id: number;

    divisionSelect: any;
    oldImages = [];
    validateForm: FormGroup;
    ImageFile: File;


    constructor(
        private router: Router,
        private route: ActivatedRoute,
        private _notification: NzNotificationService,
        private fb: FormBuilder,
        private craftsmanService: CraftsmanService,
        private authService: AuthService,
        private validationService: ValidationService,
        private areaService: AreaService
    ) {

    }

    // init the component
    ngOnInit() {

        this.validateForm = this.fb.group({
            username: [
                '',
                [Validators.required],
                [this.validationService.userNameTakenValidator.bind(this)]
            ],
            password: ['', [Validators.required]],
            confirmPassword: ['', [this.passwordConfirmationValidator]],
            // email: ['', [Validators.email]],
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
            upazila_id: ['', [Validators.required]],
            zila_id: ['', [Validators.required]],
            division_id: ['', [Validators.required]],
            avatar: ['', []]
        });

        this.currentUser = this.authService.getCurrentUser();

        this.areaService.getAllDivision().subscribe(result => {
            this.divisionSearchOptions = result;
        });
    }

    //Event method for submitting the form
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
        formData.append('group_id', '6');
        formData.append('upazila_id', value.upazila_id);
        formData.append('zila_id', value.zila_id);
        formData.append('division_id', value.division_id);
        formData.append('address', " ");
        formData.append('permanent_address', " ");
        formData.append('national_id', " ");
        formData.append('father_name', " ");
        formData.append('mother_name', " ");
        formData.append('active', '1');

        formData.append('warehouse_id', this.currentUser.warehouse.id);

        if (this.ImageFile) {
            formData.append('hasImage', 'true');
            formData.append('avatar', this.ImageFile, this.ImageFile.name);
        } else {
            formData.append('hasImage', 'false');
        }
        this.craftsmanService.insert(formData).subscribe(result => {
            if (result.user) {
                this._notification.create(
                    'success',
                    'New Craftsman has been successfully added.',
                    result.user.name
                );
                setTimeout(() => {
                    this.router.navigate([
                        '/dashboard/craftsman/details',
                        result.user.id
                    ]);
                }, 1500);
            }
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


    //Event method for removing picture
    onRemoved(file: FileHolder) {
        this.ImageFile = null;
    }

    //Event method for storing imgae in variable
    onBeforeUpload = (metadata: UploadMetadata) => {
        this.ImageFile = metadata.file;

        return metadata;
    };

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

    zilaSearchChange($event: string) {
    }

    upazilaSearchChange($event: string) {
    }
}
