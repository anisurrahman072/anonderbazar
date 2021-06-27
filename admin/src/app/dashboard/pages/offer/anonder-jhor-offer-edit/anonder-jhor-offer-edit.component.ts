import {Component, Input, OnInit, ViewChild} from '@angular/core';
import {FormBuilder, FormGroup, Validators} from '@angular/forms';
import {ActivatedRoute, Router} from '@angular/router';
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
    @ViewChild('Image')

    Image: any;
    validateForm: FormGroup;
    ImageFile: File;
    IMAGE_ENDPOINT = environment.IMAGE_ENDPOINT;
    _isSpinning: any = false;
    ImageFileEdit: any;
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

    constructor(
        private router: Router,
        private _notification: NzNotificationService,
        private fb: FormBuilder,
        private offerService: OfferService,
    ) {
    }

    ngOnInit() {
        this.getAllCategories()
        this.validateForm = this.fb.group({
            categoryId: ['', [Validators.required]],
            subCategoryId: ['', []],
            subSubCategoryId: ['', []],
            offerStartDate: ['', Validators.required],
            offerEndDate: ['', Validators.required],
            calculationType: ['', [Validators.required]],
            discountAmount: ['', [Validators.required]],
        });

        this.offerService.getAnonderJhorOfferById(this.jhorOfferId)
            .subscribe(result => {
                console.log(result.anonderJhorOffer);

                this.data = result.anonderJhorOffer;

                this.categoryId = this.data.category_id.id;
                this.subCategoryId = this.data.sub_category_id ? this.data.sub_category_id.id : '';
                this.subSubCategoryId = this.data.sub_sub_category_id ? this.data.sub_sub_category_id.id : '';

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
                this._isSpinning = false;
            });
    }

    /** Event method for submitting the form */
    submitForm = ($event, value) => {
        console.log('value.categoryId: ', value.categoryId);
        console.log('this.subCategoryId: ', this.subCategoryId);
        console.log('this.subSubCategoryId: ', this.subSubCategoryId);

        $event.preventDefault();
        this._isSpinning = true;

        for (const key in this.validateForm.controls) {
            this.validateForm.controls[key].markAsDirty();
        }

        let formData = new FormData();

        formData.append('id', this.jhorOfferId);
        formData.append('categoryId', value.categoryId);
        formData.append('offerStartDate', moment(value.offerStartDate).format('YYYY-MM-DD HH:mm:ss'));
        formData.append('offerEndDate', moment(value.offerEndDate).format('YYYY-MM-DD HH:mm:ss'));
        formData.append('calculationType', value.calculationType);
        formData.append('discountAmount', value.discountAmount);


        if (value.subCategoryId) {
            formData.append('subCategoryId', this.subCategoryId);
        }
        if (value.subSubCategoryId) {
            formData.append('subSubCategoryId', this.subSubCategoryId);
        }

        if (this.ImageFile) {
            formData.append('hasImage', 'true');
            formData.append('image', this.ImageFile, this.ImageFile.name);
        } else {
            formData.append('hasImage', 'false');
        }

        this.offerService.updateAnonderJhorOffer(formData).subscribe(result => {
            /*if (result.code === 'INVALID_SUBSUBCAT') {
                this._notification.error('Sub-sub-Category exists', "Sub-sub-Category already exists in another offer ");
                this._isSpinning = false;
            } else {*/
            this._notification.success('Updated', "Anonder Jhor offer Updated successfully");
            this._isSpinning = false;
            this.resetForm(null);
            this.isEditVisible = false;
            this.router.navigate(['/dashboard/offer/anonder-jhor']);
            // window.location.reload();
            this.offerService.reloadOfferList();
            /*}*/
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
    }

    handleCancel = (e) => {
        this.isEditVisible = false;
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
            })
    }

    getAllSubCategories(event) {
        if (event) {
            this.offerService.getAllSubCategories(event)
                .subscribe(result => {
                    this.allSubCategoryIds = result.data;
                    this.allSubSubCategoryIds = null;
                    this.subCategoryId = null;
                    this.subSubCategoryId = null;
                })
        }
    }

    getAllSubSubCategories(event) {
        console.log('evet in sub sub', event);
        if (event) {
            this.offerService.getAllSubSubCategories(event)
                .subscribe(result => {
                    this.allSubSubCategoryIds = result.data;
                    this.subSubCategoryId = null;
                })
        }
        console.log('inside get all sub sub: ', this.subSubCategoryId);
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

    /** Event method for setting up form in validation */
    getFormControl(name) {
        return this.validateForm.controls[name];
    }

}
