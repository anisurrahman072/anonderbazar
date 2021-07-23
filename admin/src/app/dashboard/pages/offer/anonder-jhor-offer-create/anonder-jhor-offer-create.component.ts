import {Component, Input, OnInit} from '@angular/core';
import {FormBuilder, FormGroup, Validators} from '@angular/forms';
import {Router} from '@angular/router';
import {FileHolder, UploadMetadata} from 'angular2-image-upload';
import {NzNotificationService} from 'ng-zorro-antd';
import {environment} from "../../../../../environments/environment";
import {OfferService} from "../../../../services/offer.service";
import moment from "moment";
import {DesignImagesService} from "../../../../services/design-images.service";

@Component({
    selector: 'app-anonder-jhor-offer-create',
    templateUrl: './anonder-jhor-offer-create.component.html',
    styleUrls: ['./anonder-jhor-offer-create.component.css']
})
export class AnonderJhorOfferCreateComponent implements OnInit {

    @Input() isVisible: Boolean;

    validateForm: FormGroup;
    ImageFile: File;
    IMAGE_ENDPOINT = environment.IMAGE_ENDPOINT;
    _isSpinning: any = false;
    submitting: boolean = false;
    Calc_type;
    selectionType;
    categoryId;
    subCategoryId;
    subSubCategoryId;

    /** variables used for storing subCat and subSubCat options */
    allCategoryIds;
    allSubCategoryIds;
    allSubSubCategoryIds;
    anonderJhorData;

    ImageFilePath = [];
    hasImageFile: boolean = false;

    constructor(
        private router: Router,
        private _notification: NzNotificationService,
        private fb: FormBuilder,
        private offerService: OfferService,
        private designImagesService: DesignImagesService,
    ) {
        this.validateForm = this.fb.group({
            categoryId: ['', [Validators.required]],
            subCategoryId: ['', [Validators.required]],
            subSubCategoryId: ['', []],
            offerStartDate: ['', Validators.required],
            offerEndDate: ['', Validators.required],
            calculationType: ['', [Validators.required]],
            discountAmount: ['', [Validators.required]],
        });
    }

    ngOnInit() {
        this.getAllCategories()
        this.getAnonderJhor();
    }

    //Event method for submitting the form
    submitForm = ($event, value) => {

        $event.preventDefault();
        this._isSpinning = true;

        for (const key in this.validateForm.controls) {
            this.validateForm.controls[key].markAsDirty();
        }

        let formData = new FormData();

        formData.append('categoryId', value.categoryId);
        formData.append('subCategoryId', this.subCategoryId);
        formData.append('offerStartDate', moment(value.offerStartDate).format('YYYY-MM-DD HH:mm:ss'));
        formData.append('offerEndDate', moment(value.offerEndDate).format('YYYY-MM-DD HH:mm:ss'));
        formData.append('calculationType', value.calculationType);
        formData.append('discountAmount', value.discountAmount);

        let offerStartTime = new Date(value.offerStartDate).getTime();
        let offerEndTime = new Date(value.offerEndDate).getTime();
        let jhorStartTime = new Date(this.anonderJhorData.start_date).getTime();
        let jhorEndTime = new Date(this.anonderJhorData.end_date).getTime();

        if (offerStartTime < jhorStartTime) {
            this._notification.error('Wrong start Time', 'Start time is before anonder jhor start time');
            this._isSpinning = false;
            return;
        }

        if (offerEndTime > jhorEndTime) {
            this._notification.error('Wrong End Time', 'End Date is out of the Anonder Jhor End Date');
            this._isSpinning = false;
            return;
        }

        if (offerStartTime > offerEndTime) {
            this._notification.error('Wrong Date', 'Please enter date and time properly');
            this._isSpinning = false;
            return;
        }

        if (value.subSubCategoryId) {
            formData.append('subSubCategoryId', value.subSubCategoryId);
        }

        if (this.hasImageFile) {
            formData.append('image', this.ImageFilePath[0].split(this.IMAGE_ENDPOINT)[1]);
        }

        this.submitting = true;
        this.offerService.anonderJhorOfferInsert(formData).subscribe(result => {
            this.submitting = false;
            if (result.code === 'INVALID_SUBSUBCAT') {
                this._notification.error('Sub-sub-Category exists', "Sub-sub-Category already exists in another offer ");
                this._isSpinning = false;
            } else {
                this._notification.success('Offer Added', "Offer under anonder jhor created successfully");
                this._isSpinning = false;
                this.resetForm(null);
                this.isVisible = false;
                this.offerService.reloadOfferList();
            }
        }, (error) => {
            this.submitting = false;
            this._notification.error('Error Occurred!', "Error occurred while adding offer!");
        });
    };

    /** Event method for resetting the form */
    resetForm($event: MouseEvent) {
        $event ? $event.preventDefault() : null;
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

        let formData = new FormData();
        formData.append('oldImagePath', `${this.ImageFilePath[0].split(this.IMAGE_ENDPOINT)[1]}`);

        this.designImagesService.deleteImage(formData)
            .subscribe(data => {
                this.ImageFilePath = [];
                this.hasImageFile = false;
                this._notification.success("Success", "Successfully deleted image");
            }, error => {
                console.log("Error occurred: ", error);
                this._notification.success("Error", "Error occurred while deleting image");
            })
    }

    onUploadStateChanged(state: boolean) {
    }

    /** Event method for storing image in variable */
    onBeforeUpload = (metadata: UploadMetadata) => {
        let formData = new FormData();
        formData.append('image', metadata.file, metadata.file.name);

        this.designImagesService.insertImage(formData)
            .subscribe(data => {
                this.hasImageFile = true;
                this.ImageFilePath.push(this.IMAGE_ENDPOINT + data.path);
            }, error => {
                console.log("Error occurred: ", error);
            })

        return metadata;
    }

    getAllCategories() {
        this.offerService.getAllCategories()
            .subscribe(result => {
                this.allCategoryIds = result.data;
                this.allSubCategoryIds = null;
                this.allSubSubCategoryIds = null;
            }, error => {
                this._notification.error('Error Occurred!', "Error occurred while getting all categories!");
            });
    }

    getAllSubCategories(event) {
        if (event) {
            this.offerService.getAllSubCategories(event)
                .subscribe(result => {

                    if (this.allSubCategoryIds) {
                        this.finalSelectionType(true, false, event);
                    }
                    this.allSubSubCategoryIds = null;
                    this.allSubCategoryIds = result.data;
                }, error => {
                    this._notification.error('Error Occurred!', "Error occurred while getting all sub categories!");
                });
        }
    }

    getAllSubSubCategories(event) {
        if (event) {
            this.offerService.getAllSubSubCategories(event)
                .subscribe(result => {
                    if (this.allSubSubCategoryIds) {
                        this.finalSelectionType(false, true, event);
                    }
                    this.allSubSubCategoryIds = result.data;
                }, (error) => {
                    this._notification.error('Error Occurred!', "Error occurred while getting all sub sub categories!");
                });
        }
    }

    finalSelectionType(catId, subCatId, event) {
        if (event) {
            if (catId) {
                this.categoryId = event;
                this.subCategoryId = null;
                this.subSubCategoryId = null;
            } else if (subCatId) {
                this.subCategoryId = event;
                this.subSubCategoryId = null;
            }
        }
    }

    handleOk = (e) => {
        this.isVisible = false;
    }

    handleCancel = (e) => {
        this.isVisible = false;
    }

    /** Method called to get data of anonder Jhor */
    getAnonderJhor() {
        this.offerService.getAnonderJhor()
            .subscribe(result => {
                this._isSpinning = true
                if (result.data) {
                    this.anonderJhorData = result.data;
                    this._isSpinning = false;
                } else {
                    this._isSpinning = false;
                    this._notification.error('failed', 'Sorry, something went wrong');
                }
            }, () => {
                this._isSpinning = false;
            });
    }
}
