import {Component, Input, OnInit} from '@angular/core';
import {FormBuilder, FormGroup, Validators} from '@angular/forms';
import {Router} from '@angular/router';
import {FileHolder, UploadMetadata} from 'angular2-image-upload';
import {NzNotificationService} from 'ng-zorro-antd';
import {environment} from "../../../../../environments/environment";
import {OfferService} from "../../../../services/offer.service";
import moment from "moment";

@Component({
    selector: 'app-anonder-jhor-offer-edit',
    templateUrl: './anonder-jhor-offer-edit.component.html',
    styleUrls: ['./anonder-jhor-offer-edit.component.css']
})
export class AnonderJhorOfferEditComponent implements OnInit {

    @Input() isEditVisible: Boolean;
    @Input() jhorOfferId;

    validateForm: FormGroup;
    ImageFile: File;
    IMAGE_ENDPOINT = environment.IMAGE_ENDPOINT;
    _isSpinning: any = false;
    ImageFileEdit: any = [];
    data: any;

    categoryId;
    subCategoryId;
    subSubCategoryId;
    calculationType;

    Calc_type;
    submitting: boolean = false;

    allCategoryIds;
    allSubCategoryIds;
    allSubSubCategoryIds;

    anonderJhorData;

    constructor(
        private router: Router,
        private _notification: NzNotificationService,
        private fb: FormBuilder,
        private offerService: OfferService,
    ) {
    }

    ngOnInit() {
        this.getAnonderJhor();
        this.getAllCategories();

        this.validateForm = this.fb.group({
            categoryId: ['', [Validators.required]],
            subCategoryId: ['', [Validators.required]],
            subSubCategoryId: ['', []],
            offerStartDate: ['', Validators.required],
            offerEndDate: ['', Validators.required],
            calculationType: ['', [Validators.required]],
            discountAmount: ['', [Validators.required]],
        });

        this.offerService.getAnonderJhorOfferById(this.jhorOfferId)
            .subscribe(result => {
                this.data = result.anonderJhorOffer;

                this.categoryId = this.data.category_id ? this.data.category_id.id : '';
                this.subCategoryId = this.data.sub_category_id ? this.data.sub_category_id.id : '';
                this.subSubCategoryId = this.data.sub_sub_category_id ? this.data.sub_sub_category_id.id : '';

                console.log('getAnonderJhorOfferById', this.categoryId, this.subCategoryId, this.subSubCategoryId);

                this.ImageFileEdit = [];

                let payload = {
                    categoryId: this.data.category_id.id,
                    subCategoryId: this.data.sub_category_id ? this.data.sub_category_id.id : '',
                    subSubCategoryId: this.data.sub_sub_category_id ? this.data.sub_sub_category_id.id : '',
                    offerStartDate: this.data.start_date,
                    offerEndDate: this.data.end_date,
                    discountAmount: this.data.discount_amount,
                    calculationType: this.data.calculation_type,
                };

                this.validateForm.patchValue(payload);

                if (this.data && this.data.image) {
                    this.ImageFileEdit.push(this.IMAGE_ENDPOINT + this.data.image);
                }

                this._isSpinning = false;
            }, () => {
                this._notification.error('Failed', 'Failed to get data for this offer edit');
                this._isSpinning = false;
            });
    }

    /** Event method for submitting the form */
    submitForm = ($event, value) => {

        $event.preventDefault();
        this._isSpinning = true;

        for (const key in this.validateForm.controls) {
            this.validateForm.controls[key].markAsDirty();
        }

        let formData = new FormData();

        formData.append('id', this.jhorOfferId);
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

        console.log('(value.offerEndDate; ', value.offerEndDate);

        if (offerEndTime > jhorEndTime) {
            this._notification.error('Wrong Date', 'End Date is out of the Anonder Jhor End Date');
            this._isSpinning = false;
            return;
        }

        if (offerStartTime > offerEndTime || offerStartTime < jhorStartTime) {
            this._notification.error('Wrong Date', 'Please enter date and time properly');
            this._isSpinning = false;
            return;
        }

        if (value.subSubCategoryId) {
            formData.append('subSubCategoryId', value.subSubCategoryId);
        }

        if (this.ImageFile) {
            formData.append('hasImage', 'true');
            formData.append('image', this.ImageFile, this.ImageFile.name);
        } else {
            formData.append('hasImage', 'false');
        }

        this.offerService.updateAnonderJhorOffer(formData).subscribe((result) => {
            this._notification.success('Updated', "Anonder Jhor offer Updated successfully");
            this._isSpinning = false;
            this.resetForm(null);
            this.isEditVisible = false;
            this.offerService.reloadOfferList();

        }, () => {
            this._isSpinning = false;
        });
    };

    //Event method for resetting the form
    resetForm($event: MouseEvent) {
        $event ? $event.preventDefault() : null;
        this.validateForm.reset();
        for (const key in this.validateForm.controls) {
            this.validateForm.controls[key].markAsPristine();
        }
    }

    handleOk = (e) => {
        this.isEditVisible = false;
        this.offerService.reloadOfferList();
    }

    handleCancel = (e) => {
        this.isEditVisible = false;
        this.offerService.reloadOfferList();
    }

    /** Event method for removing picture */
    onRemoved(file: FileHolder) {
        this.ImageFile = null;
    }

    onUploadStateChanged(state: boolean) {
    }

    /** Event method for storing image in variable */
    onBeforeUpload = (metadata: UploadMetadata) => {
        this.ImageFile = metadata.file;
        return metadata;
    }

    getAllCategories() {
        this.offerService.getAllCategories()
            .subscribe(result => {
                this.allCategoryIds = result.data;
            });
    }

    getAllSubCategories(event) {

        if (event) {
            this.offerService.getAllSubCategories(event)
                .subscribe(result => {
                    console.log('getAllSubCategories', result);
                    if (this.allSubCategoryIds) {
                        this.finalSelectionType(true, false, false, event);
                    }
                    this.allSubCategoryIds = result.data;
                });
        }
    }

    getAllSubSubCategories(event) {

        if (event) {
            this.offerService.getAllSubSubCategories(event)
                .subscribe(result => {
                    console.log('getAllSubSubCategories', result);
                    if (this.allSubSubCategoryIds) {
                        this.finalSelectionType(false, true, false, event);
                    }
                    this.allSubSubCategoryIds = result.data;
                })
        }
    }

    getSubSubCategoryId(event) {
        if (event) {
            this.finalSelectionType(false, false, true, event);
        }
    }

    finalSelectionType(catId, subCatId, subSubCatId, event) {
        if (event) {
            if (catId) {
                this.categoryId = event;
                this.subCategoryId = null;
                this.subSubCategoryId = null;
            } else if (subCatId) {
                this.subCategoryId = event;
                this.subSubCategoryId = null;
            } else if (subSubCatId) {
                this.subSubCategoryId = event;
            }
        }
    }

    /** Event method for setting up form in validation */
    getFormControl(name) {
        return this.validateForm.controls[name];
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