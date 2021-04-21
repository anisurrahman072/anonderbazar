import {Component, OnInit, ViewChild} from '@angular/core';
import {CmsService} from '../../../../../services/cms.service';
import {FormBuilder, FormGroup, Validators} from '@angular/forms';
import {FileHolder, ImageUploadComponent, UploadMetadata} from 'angular2-image-upload';
import {NzNotificationService} from 'ng-zorro-antd';
import {environment} from "../../../../../../environments/environment";

@Component({
    selector: 'app-cms-carousel',
    templateUrl: './cms-carousel.component.html',
    styleUrls: ['./cms-carousel.component.css']
})
export class CmsCarouselComponent implements OnInit {
    @ViewChild('desktopImageUploadCreate') desktopImageUpload: ImageUploadComponent;
    @ViewChild('desktopImageUploadEdit') desktopImageUploadEdit: ImageUploadComponent;
    @ViewChild('mobileImageUploadEdit') mobileImageUpload: ImageUploadComponent;

    editImage: any = [];
    editImageMobile: any = [];

    cmsCarouselData: any = [];
    isAddModalVisible = false;
    isEditModalVisible = false;
    IMAGE_ENDPOINT = environment.IMAGE_ENDPOINT;
    editValidateForm: FormGroup;

    validateForm: FormGroup;
    ImageFile: File;
    ImageForMobileFile: File;

    _isSpinning: any = false;
    id: any;

    currentCarouselId: any;
    submitting: boolean = false;

    isMobileImageRemoved: boolean = false;
    isDesktopImageRemoved: boolean = false;
    frontendPosition: number = 111;

    constructor(
        private cmsService: CmsService,
        private _notification: NzNotificationService,
        private fb: FormBuilder
    ) {

    }

    //Event method for getting all the data for the page
    ngOnInit() {
        this.validateForm = this.fb.group({
            title: ['', [Validators.required]],
            frontend_position: ['111'],
            short1: ['', [Validators.required]],
            short2: ['', [Validators.required]],
            short3: ['', [Validators.required]],
            linktext: ['', [Validators.required]],
            link: ['', [Validators.required]],
        });

        this.editValidateForm = this.fb.group({
            title: ['', [Validators.required]],
            frontend_position: [''],
            short1: ['', [Validators.required]],
            short2: ['', [Validators.required]],
            short3: ['', [Validators.required]],
            linktext: ['', [Validators.required]],
            link: ['', [Validators.required]],
        });
        this.getData();
    }

    //Event method for getting all the data for the page
    getData() {
        this._isSpinning = true;
        this.cmsService.getBySectionName('CAROUSEL').subscribe(result => {
            if (result && result.length > 0) {
                this.id = result[0].id;
                this.cmsCarouselData = result[0].data_value;
                this.cmsCarouselData.forEach(element => {
                    element.description = JSON.parse(element.description);
                });
                this._isSpinning = false;
                console.log('this.cmsCarouselData', this.cmsCarouselData);
            } else {
                this.id = undefined;
                this.cmsCarouselData = [];
                this.cmsCarouselData.forEach(element => {
                    element.description = JSON.parse(element.description);
                });
                this._isSpinning = false;
            }
        });
    }

    //Method for showing the modal
    showCreateModal = () => {
        this.desktopImageUpload.deleteAll();
        this.isAddModalVisible = true;
    };
    //Method for showing the edit modal
    showEditModal = i => {
        this.currentCarouselId = i;
        this.isMobileImageRemoved = false;
        this.isDesktopImageRemoved = false;
        this.editImage = [];
        if (this.cmsCarouselData[i].image) {
            this.editImage.push(this.IMAGE_ENDPOINT + this.cmsCarouselData[i].image);
        }
        this.editImageMobile = [];
        if (this.cmsCarouselData[i].image_mobile) {
            this.editImageMobile.push(this.IMAGE_ENDPOINT + this.cmsCarouselData[i].image_mobile);
        }

        let textDescription = this.cmsCarouselData[i].description;
        this.cmsCarouselData[i]['short1'] = textDescription.short1;
        this.cmsCarouselData[i]['short2'] = textDescription.short2;
        this.cmsCarouselData[i]['short3'] = textDescription.short3;
        this.cmsCarouselData[i]['linktext'] = textDescription.linktext;
        this.cmsCarouselData[i]['link'] = textDescription.link;
        this.editValidateForm.patchValue(this.cmsCarouselData[i]);
        this.isEditModalVisible = true;
    };

    handleModalOk = e => {

        this.editImage = [];
        this.editImageMobile = [];
        this.desktopImageUploadEdit.deleteAll();
        this.mobileImageUpload.deleteAll();
        this.isAddModalVisible = false;
        this.isEditModalVisible = false;

    };

    handleModalCancel = e => {
        this.resetForm(e);

        this.editImage = [];
        this.editImageMobile = [];
        this.desktopImageUploadEdit.deleteAll();
        this.mobileImageUpload.deleteAll();
        this.isAddModalVisible = false;
        this.isEditModalVisible = false;
    };

    //Event method for submitting the form
    submitForm = ($event, value) => {
        this.submitting = true;
        this._isSpinning = true;
        $event.preventDefault();
        for (const key in this.validateForm.controls) {
            this.validateForm.controls[key].markAsDirty();
        }

        let formData = new FormData();
        formData.append('id', this.id.toString());

        formData.append('title', value.title);
        formData.append('frontend_position', value.frontend_position ? value.frontend_position : 111);
        formData.append('description', JSON.stringify({
            'short1': value.short1,
            'short2': value.short2,
            'short3': value.short3,
            'linktext': value.linktext,
            'link': value.link
        }));

        if (this.ImageFile) {
            formData.append('hasDesktopImage', 'true');
            formData.append('image', this.ImageFile, this.ImageFile.name);
        }

        this.cmsService.customInsert(formData).subscribe(result => {
                this.submitting = false;
                this.cmsCarouselData.push(result.data);
                this._isSpinning = false;
                this.isAddModalVisible = false;
                this._notification.create(
                    "success",
                    "New Carousel has been successfully added.",
                    result.name
                );
                this.resetForm(null);
                this.getData();
            },
            error => {
                this.submitting = false;
                this._notification.create(
                    "error",
                    "Error Occurred!",
                    "New Carousel didn't added successfully!"
                );

            });

    };

    //Event method for submitting the edit form
    submitEditForm = ($event, value) => {
        $event.preventDefault();

        this._isSpinning = true;
        for (const key in this.editValidateForm.controls) {
            this.editValidateForm.controls[key].markAsDirty();
        }

        if (this.editValidateForm.invalid) {
            return false;
        }

        let formData = new FormData();

        formData.append('id', this.id.toString());
        formData.append('dataValueId', this.currentCarouselId.toString());
        formData.append('title', value.title);
        formData.append('frontend_position', value.frontend_position);
        formData.append('description', JSON.stringify({
            'short1': value.short1,
            'short2': value.short2,
            'short3': value.short3,
            'linktext': value.linktext,
            'link': value.link
        }));

        if (this.ImageFile) {
            formData.append('hasDesktopImage', 'true');
            formData.append('image', this.ImageFile, this.ImageFile.name);
        } else if (this.isDesktopImageRemoved) {
            formData.append('isDesktopImageRemoved', 'true');
        }

        if(this.isMobileImageRemoved){
            formData.append('isMobileImageRemoved', 'true');
        }

        this.cmsService.customUpdate(formData).subscribe(result => {
            this.cmsCarouselData[this.currentCarouselId] = result.data;
            this._notification.success('success', 'Carousel Update Succeeded');
            this._isSpinning = false;
            this.desktopImageUploadEdit.deleteAll();
            this.mobileImageUpload.deleteAll();
            this.isEditModalVisible = false;
            this.resetForm(null);
            this.getData();
        }, (error) => {
            this._isSpinning = false;
            this._notification.error('Ohpps!', 'There was a problem updating the content.');
        });

    };

    //Method for removing the image
    onRemoved(file: FileHolder) {
        this.ImageFile = null;
        this.isDesktopImageRemoved = true;
    }

    //Method for removing the image
    onRemovedMobile(file: FileHolder) {
        // this._isSpinning = true;
        this.ImageForMobileFile = null;
        this.isMobileImageRemoved = true;
        /*        this.cmsService.deleteCarouselImage(this.id.toString(), {
                    type: 'image_mobile',
                    dataValueId: this.currentCarouselId.toString()
                })
                    .subscribe((result: any) => {
                        this.cmsCarouselData[this.currentCarouselId] = result.data;
                        this._notification.success('success', 'Carousel Update Succeeded');
                        this._isSpinning = false;
                        this.isEditModalVisible = false;
                    }, (error) => {
                        this._isSpinning = false;
                        this._notification.error('Ohpps!', 'There was a problem updating the content.');
                    });*/
    }

    //Method for storing image in variable
    onBeforeUpload = (metadata: UploadMetadata) => {
        this.ImageFile = metadata.file;
        return metadata;
    };

    onBeforeUploadMobile = (metadata: UploadMetadata) => {
        console.log('onBeforeUploadMobile');
        this.ImageForMobileFile = metadata.file;

        this._isSpinning = true;
        let formData = new FormData();
        formData.append('dataValueId', this.currentCarouselId.toString());
        formData.append('image', metadata.file, metadata.file.name);

        this.cmsService.uploadCarouselMobileImage(this.id.toString(), formData)
            .subscribe((result: any) => {
                console.log('result', result);
                this.cmsCarouselData[this.currentCarouselId] = result.data;
                this._notification.success('success', 'Carousel Update Succeeded');
                this._isSpinning = false;
            }, (error) => {
                this._isSpinning = false;
                this._notification.error('Ohpps!', 'There was a problem updating the content.');
            });
        return metadata;
    };

    onUploadFinishedMobile(file: FileHolder) {
        console.log('onUploadFinishedMobile', file);
    }

    //Event method for resetting the form
    resetForm($event: MouseEvent) {
        $event ? $event.preventDefault() : null;
        this.ImageFile = null;
        this.editImage = [];
        this.editImageMobile = [];

        this.validateForm.reset();
        for (const key in this.validateForm.controls) {
            this.validateForm.controls[key].markAsPristine();
        }
        this.editValidateForm.reset();
        for (const key in this.editValidateForm.controls) {
            this.editValidateForm.controls[key].markAsPristine();
        }

    }

    //Event method for setting up form in validation
    getFormControl(title) {
        return this.validateForm.controls[title];
    }

    //Event method for setting up edit form in validation
    getEditFormControl(title) {
        return this.editValidateForm.controls[title];
    }

    //Event method for deleting carousel
    deleteCarousel(i) {
        this._isSpinning = true;
        let deletePayload = {
            id: this.id,
            carouselId: i
        };
        this.cmsService.customDelete(deletePayload).subscribe(result => {
            this._notification.success('Delete', 'Carousel Delete Successfully');
            this._isSpinning = false;
            this.getData();
        });
    }
}
