import {Component, OnInit, ViewChild} from '@angular/core';
import {
    FormBuilder,
    FormGroup,
    Validators
} from '@angular/forms';
import {ActivatedRoute, Router} from '@angular/router';
import {UploadMetadata, FileHolder} from 'angular2-image-upload';
import {BrandService} from '../../../../services/brand.service';
import {AuthService} from '../../../../services/auth.service';
import {NzNotificationService} from "ng-zorro-antd";

@Component({
    selector: 'app-brand-create',
    templateUrl: './brand-create.component.html',
    styleUrls: ['./brand-create.component.css']
})
export class BrandCreateComponent implements OnInit {
    validateForm: FormGroup;
    _isSpinning: boolean = false;
    ImageFile: File[] = [];
    @ViewChild('Image') Image;
    currentUser: any;


    constructor(private router: Router,
                private route: ActivatedRoute,
                private _notification: NzNotificationService,
                private fb: FormBuilder,
                private authService: AuthService,
                private brandService: BrandService) {
        this.validateForm = this.fb.group({
            name: ['', [Validators.required]],
            code:[''],
            image: [''],
        });
    }
    //Event method for submitting the form
    submitForm = ($event, value) => {
        $event.preventDefault();
        for (const key in this.validateForm.controls) {
            this.validateForm.controls[key].markAsDirty();
        }
        const formData: FormData = new FormData();
        formData.append('name', value.name);
        formData.append('code', value.code);

        if (this.ImageFile.length) {
            formData.append('hasImage', 'true');
            formData.append('image', this.ImageFile[0], this.ImageFile[0].name);
        } else {
            formData.append('hasImage', 'false');

        }
        this.brandService.insert(formData)
            .subscribe((result: any) => {
                if (result.id) {
                    this._notification.create('success', 'New Brand has been successfully added. ', result.name);
                    this.router.navigate(['/dashboard/brand/details/', result.id]);

                }
            });
    }
    //Event method for removing picture
    onRemoved(_file: FileHolder) {
        this.ImageFile = [];
    }
    //Event method for storing imgae in variable
    onBeforeUpload = (metadata: UploadMetadata) => {
        try {
            this.ImageFile[0] = metadata.file;
            return metadata;

        } catch (error) {
        }
    }

    //Event method for storing imgae in variable
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
    // init the component
    ngOnInit() {
        this.currentUser = this.authService.getCurrentUser();
    }

    onUploadStateChanged(state: boolean) {

    }

}
