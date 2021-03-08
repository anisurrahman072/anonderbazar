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

@Component({
    selector: 'app-warehouse-edit',
    templateUrl: './craftsman-edit.component.html',
    styleUrls: ['./craftsman-edit.component.css']
})
export class CraftsmanEditComponent implements OnInit {
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

    constructor(
        private router: Router,
        private route: ActivatedRoute,
        private _notification: NzNotificationService,
        private fb: FormBuilder,
        private validationService: ValidationService,
        private craftsmanService: CraftsmanService,
        private authService: AuthService,
        private areaService: AreaService
    ) {

    }

    // init the component
    ngOnInit() {
        this.validateForm = this.fb.group({
            username: ['', [Validators.required]],
            email: ['', [this.validationService.emailValidator]],
            first_name: ['', [Validators.required]],
            last_name: ['', [Validators.required]],
            phone: ['', [Validators.required]],
            gender: ['', [Validators.required]],
            upazila_id: ['', [Validators.required]],
            zila_id: ['', [Validators.required]],
            division_id: ['', [Validators.required]],
            avatar: ['', []]
        });

        this.areaService.getAllDivision().subscribe(result => {
            this.divisionSearchOptions = result;
        });

        this.sub = this.route.params.subscribe(params => {
            this.id = +params['id']; // (+) converts string 'id' to a number
            this.craftsmanService.getById(this.id).subscribe(result => {
                this.ImageFileEdit = [];
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
                    if (this.data && this.data.avatar) {
                        this.ImageFileEdit.push(this.IMAGE_ENDPOINT + this.data.avatar);
                    }
                }
            });
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
        formData.append('email', value.email);
        formData.append('first_name', value.first_name);
        formData.append('last_name', value.last_name);
        formData.append('phone', value.phone);
        formData.append('gender', value.gender);
        formData.append('upazila_id', value.upazila_id);
        formData.append('zila_id', value.zila_id);
        formData.append('division_id', value.division_id);
        formData.append('active', '1');

        if (this.ImageFile) {
            formData.append('hasImage', 'true');
            formData.append('avatar', this.ImageFile, this.ImageFile.name);
        } else {
            formData.append('hasImage', 'false');
        }
        this.craftsmanService.update(this.id, formData).subscribe(
            result => {
                this._notification.create(
                    'success',
                    'Craftsman Update successful',
                    this.data.name
                );

                setTimeout(() => {
                    this.router.navigate(['/dashboard/craftsman/details', this.id]);
                }, 2000);
            },
            error => {
            }
        );
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


    //Event method for removing picture
    onRemoved(file: FileHolder) {
        this.ImageFile = null;
    }

    //Event method for storing imgae in variable
    onBeforeUpload = (metadata: UploadMetadata) => {
        this.ImageFile = metadata.file;
        return metadata;
    };

    //Method for division search change
    divisionSearchChange($event: string) {
        const query = encodeURI($event);
    }

    //Method for division change
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

    //Method for zila change
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

    zilaSearchChange($event: string) {
    }

    upazilaSearchChange($event: string) {
    }
}
