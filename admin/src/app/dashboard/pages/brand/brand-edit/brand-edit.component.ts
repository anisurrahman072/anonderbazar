import {Component, OnDestroy, OnInit, ViewChild} from '@angular/core';
import {FormBuilder, FormGroup, Validators} from '@angular/forms';
import {ActivatedRoute, Router} from '@angular/router';
import {Subscription} from 'rxjs';
import {FileHolder, UploadMetadata} from 'angular2-image-upload';
import {BrandService} from '../../../../services/brand.service';

import {environment} from "../../../../../environments/environment";
import {NzNotificationService} from "ng-zorro-antd";
import {UniqueBrandNameValidator} from "../../../../services/validator/UniqueBrandNameValidator";

@Component({
    selector: 'app-brand-edit',
    templateUrl: './brand-edit.component.html',
    styleUrls: ['./brand-edit.component.css']
})
export class BrandEditComponent implements OnInit, OnDestroy {
    @ViewChild('Image') Image;
    id: number;
    data: any;
    sub: Subscription;
    _isSpinning: boolean = false;
    ImageFileEdit: any[] = [];
    IMAGE_ENDPOINT = environment.IMAGE_ENDPOINT;
    validateForm: FormGroup;
    ImageFile: File;

    constructor(private router: Router, private route: ActivatedRoute,
                private _notification: NzNotificationService,
                private fb: FormBuilder,
                private brandService: BrandService,
                private uniqueBrandNameValidator: UniqueBrandNameValidator) {

    }

    // init the component
    ngOnInit() {
        this.validateForm = this.fb.group({
            id: [''],
            name: ['', [Validators.required], [this.uniqueBrandNameValidator]],
            code: [''],
            frontend_position: ['111'],
            image: [null, []],
        });
        this.sub = this.route.params.subscribe(params => {
            this.id = +params['id']; // (+) converts string 'id' to a number
            this.brandService.getById(this.id)
                .subscribe(result => {
                    this.ImageFileEdit = [];
                    this.data = result;
                    this.validateForm.patchValue(this.data);
                    if (this.data && this.data.image) {
                        this.ImageFileEdit.push(this.IMAGE_ENDPOINT + this.data.image);
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
        formData.append('name', value.name);
        formData.append('code', value.code);
        if (this.ImageFile) {
            formData.append('hasImage', 'true');
            formData.append('image', this.ImageFile, this.ImageFile.name);
        } else {
            formData.append('hasImage', 'false');
        }
        this._isSpinning = true;
        this.brandService.update(this.id, formData)
            .subscribe(result => {
                this._notification.create('success', 'Brand Update successful for ', this.data.name);

                setTimeout(() => {
                    this._isSpinning = false;
                    this.router.navigate(['/dashboard/brand/details/', this.id]);
                }, this.ImageFile ? 2000 : 0);
            }, (error) => {
                this._notification.create('error', ' failed', 'Brand update failed');
                this._isSpinning = false;
            });
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
    }

    ngOnDestroy(): void {
        this.sub ? this.sub.unsubscribe() : '';

    }


}
