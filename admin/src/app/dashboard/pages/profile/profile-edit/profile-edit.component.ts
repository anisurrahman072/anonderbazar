import {Component, OnInit, ViewChild} from '@angular/core';
import {
    FormBuilder,
    FormGroup,
    Validators
} from '@angular/forms';
import {ActivatedRoute, Router} from '@angular/router';
import {Subscription} from 'rxjs';
import {NzNotificationService} from 'ng-zorro-antd';
import {FileHolder, UploadMetadata} from 'angular2-image-upload';
import {UserService} from '../../../../services/user.service';
import {AuthService} from '../../../../services/auth.service';
import {AreaService} from '../../../../services/area.service';
import {ValidationService} from '../../../../services/validation.service';

@Component({
    selector: 'app-warehouse-edit',
    templateUrl: './profile-edit.component.html',
    styleUrls: ['./profile-edit.component.css']
})
export class ProfileEditComponent implements OnInit {
    @ViewChild('Image') Image;
    _isSpinning: Boolean = true;
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
    ImageFile: any;

    //Event method for submitting the form
    submitForm = ($event, value) => {
        $event.preventDefault();
        for (const key in this.validateForm.controls) {
            this.validateForm.controls[key].markAsDirty();
        }
        const formData: FormData = new FormData();
        formData.append('first_name', value.first_name);
        formData.append('last_name', value.last_name);
        formData.append('phone', value.phone);
        formData.append('gender', value.gender);
        formData.append('upazila_id', value.upazila_id);
        formData.append('zila_id', value.zila_id);
        formData.append('division_id', value.division_id);
        if (this.ImageFile) {
            formData.append('hasImage', 'true');
            formData.append('avatar', this.ImageFile, this.ImageFile.name);
        } else {
            formData.append('hasImage', 'false');
        }
        this._isSpinning = true;
        this.userService.update(this.id, formData).subscribe(
            result => {
                this._isSpinning = false;
                this._notification.create(
                    'success',
                    'Update successful',
                    this.data.name
                );
                this.router.navigate(['/dashboard/profile', this.id]);
            },
            error => {
                this._isSpinning = false;
            }
        );
    };

//Event method for resetting the form
    resetForm($event: MouseEvent) {
        $event.preventDefault();
        this.getData();
    }

//Event method for setting up form in validation
    getFormControl(name) {
        return this.validateForm.controls[name];
    }

    constructor(
        private router: Router,
        private route: ActivatedRoute,
        private _notification: NzNotificationService,
        private fb: FormBuilder,
        private validationService: ValidationService,
        private userService: UserService,
        private authService: AuthService,
        private areaService: AreaService
    ) {
        this.validateForm = this.fb.group({
            username: ['', [Validators.required]],
            email: ['', [Validators.required]],
            first_name: ['', [Validators.required]],
            last_name: ['', [Validators.required]],
            phone: ['', [this.validationService.phoneValidator]],
            gender: ['', [Validators.required]],
            upazila_id: ['', [Validators.required]],
            zila_id: ['', [Validators.required]],
            division_id: ['', [Validators.required]],
            avatar: ['', []]
        });

        this.areaService.getAllDivision().subscribe(
            result => {
                this.divisionSearchOptions = result;
            },
            error => {
            }
        );
    }

    // init the component
    ngOnInit() {
        const userId = this.authService.getCurrentUserId();
        if (userId) {
            this.userID = userId;
            this.id = userId;
            this.getData();
        }
    }

    //Event method for getting all the data for the page
    getData() {
        this._isSpinning = true;
        this.userService.getById(this.userID).subscribe(
            result => {
                if (result) {
                    this.data = result;
                    this.validateForm.patchValue(this.data);
                    this.validateForm.controls.division_id.patchValue(
                        this.data.division_id.id
                    );
                    this.validateForm.controls.zila_id.patchValue(this.data.zila_id.id);
                    this.validateForm.controls.upazila_id.patchValue(
                        this.data.upazila_id.id
                    );
                }
                this._isSpinning = false;
            },
            error => {
                this._isSpinning = false;
            }
        );
    }

//Event method for removing picture
    onRemoved(file: FileHolder) {
        this.ImageFile = null;
    }

//Event method for storing imgae in variable
    onBeforeUpload = (metadata: UploadMetadata) => {
        this.ImageFile = metadata.file;
        return metadata;
    };

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
            error => {
            }
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
            error => {
            }
        );
    }

}
