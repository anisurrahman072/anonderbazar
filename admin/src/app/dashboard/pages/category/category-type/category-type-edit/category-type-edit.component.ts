import {Component, OnDestroy, OnInit, ViewChild} from '@angular/core';
import {FormBuilder, FormControl, FormGroup, Validators} from '@angular/forms';
import {Observable, Subscription} from 'rxjs';
import {CategoryTypeService} from '../../../../../services/category-type.service';
import {ActivatedRoute, Router} from '@angular/router';
import {NzNotificationService} from 'ng-zorro-antd';
import {FileHolder, UploadMetadata} from 'angular2-image-upload';

import {environment} from "../../../../../../environments/environment";

@Component({
    selector: 'app-category-type-edit',
    templateUrl: './category-type-edit.component.html',
    styleUrls: ['./category-type-edit.component.css']
})
export class CategoryTypeEditComponent implements OnInit, OnDestroy{
    categoryType: any;
    categoryTypeId: number;
    sub: Subscription;
    IMAGE_ENDPOINT = environment.IMAGE_ENDPOINT;
    oldImages = [];
    validateForm: FormGroup;
    ImageFile: File;
    @ViewChild('Image') Image;
    submitForm = ($event, value) => {
        $event.preventDefault();
        for (const key in this.validateForm.controls) {
            this.validateForm.controls[key].markAsDirty();
        }
        const formData: FormData = new FormData();
        formData.append('name', value.name);
        formData.append('code', value.code);
        if (this.ImageFile) {
            formData.append('image', this.ImageFile, this.ImageFile.name);
            formData.append('hasImage', 'true');

        } else {
            formData.append('hasImage', 'false');

        }
        this.categoryTypeService.update(this.categoryTypeId, formData)
            .subscribe(result => {
                this._notification.create('success', 'Update successful for ', this.categoryType.name);
                this.router.navigate(['/dashboard/category/type/details/', this.categoryTypeId]);
            });
    }

    resetForm($event: MouseEvent) {
        $event.preventDefault();
        this.validateForm.reset();
        for (const key in this.validateForm.controls) {
            this.validateForm.controls[key].markAsPristine();
        }
    }


    getFormControl(name) {
        return this.validateForm.controls[name];
    }

    constructor(private router: Router, private route: ActivatedRoute, private _notification: NzNotificationService,
                private fb: FormBuilder, private categoryTypeService: CategoryTypeService) {
        this.validateForm = this.fb.group({
            name: ['15', [Validators.required]],
            code:[''],
            image: ['']
        });
    }

    ngOnInit() {
        this.sub = this.route.params.subscribe(params => {
            this.categoryTypeId = +params['id']; // (+) converts string 'id' to a number
            this.categoryTypeService.getById(this.categoryTypeId)
                .subscribe(result => {
                    this.categoryType = result;
                    this.oldImages = [];
                    this.validateForm.patchValue(this.categoryType);
                    if (this.categoryType && this.categoryType.image) {
                        this.oldImages.push(this.IMAGE_ENDPOINT + this.categoryType.image);
                    }
                    this.oldImages.push(this.categoryType.image);
                    
                    
                });
        });
    }

    ngOnDestroy(): void {
        this.sub ? this.sub.unsubscribe() : '';
    
    }

    onRemoved(file: FileHolder) {
        this.ImageFile = null;
    }

    onBeforeUpload = (metadata: UploadMetadata) => { 
        this.ImageFile = metadata.file;
        return metadata;
    }


}
