import {Component, Input, OnInit} from '@angular/core';
import {FormBuilder, FormGroup, Validators} from '@angular/forms';
import {Router} from '@angular/router';
import {FileHolder, UploadMetadata} from 'angular2-image-upload';
import {NzNotificationService} from 'ng-zorro-antd';
import {environment} from "../../../../../environments/environment";
import {OfferService} from "../../../../services/offer.service";
import moment from "moment";
import {DesignImagesService} from "../../../../services/design-images.service";
import {ExcelService} from "../../../../services/excel.service";

class OfferBulk {
    code: string = "";
    calculation_type: string = "";
    discount_amount: number = 0;

}

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

    hasImageFile: boolean = false;
    isImageInDB: boolean = false;

    id;

    /** excel file variables */
    isLoading: boolean = false;
    private importedProducts: OfferBulk[] = [];
    total: number = 0;
    wrongCodes = [];
    private individuallySelectedCodes: any = [];
    continue: Boolean = true;
    private individuallySelectedProductsCalculation: any = [];
    private individuallySelectedProductsAmount: any = [];

    constructor(
        private router: Router,
        private _notification: NzNotificationService,
        private fb: FormBuilder,
        private offerService: OfferService,
        private designImagesService: DesignImagesService,
        private excelService: ExcelService,
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
                this.id = this.data.id;

                this.categoryId = this.data.category_id ? this.data.category_id.id : '';
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
                    this.hasImageFile = true;
                    this.isImageInDB = true;
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
        formData.append('individuallySelectedProductsCalculation', this.individuallySelectedProductsCalculation);
        formData.append('individuallySelectedProductsAmount', this.individuallySelectedProductsAmount);
        console.log("selected codes: ", this.individuallySelectedCodes);
        formData.append('individuallySelectedCodes', this.individuallySelectedCodes);

        let offerStartTime = new Date(value.offerStartDate).getTime();
        let offerEndTime = new Date(value.offerEndDate).getTime();
        let jhorStartTime = new Date(this.anonderJhorData.start_date).getTime();
        let jhorEndTime = new Date(this.anonderJhorData.end_date).getTime();

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

        if (this.hasImageFile) {
            formData.append('image', this.ImageFileEdit[0].split(this.IMAGE_ENDPOINT)[1]);
        }

        this.offerService.updateAnonderJhorOffer(formData).subscribe((result) => {
            this._notification.success('Updated', "Anonder Jhor offer Updated successfully");
            this._isSpinning = false;
            this.resetForm(null);
            this.isEditVisible = false;
            this.offerService.reloadOfferList();

        }, () => {
            this._notification.error('Error Occurred!', "Error occurred while adding offer!");
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

        let formData = new FormData();
        formData.append('oldImagePath', `${this.ImageFileEdit[0].split(this.IMAGE_ENDPOINT)[1]}`);
        if(this.isImageInDB){
            formData.append('id', `${this.id}`);
            formData.append('tableName', `anonder_jhor_offers`);
            formData.append('column', `image`);
        }

        this.designImagesService.deleteImage(formData)
            .subscribe(data => {
                this.isImageInDB = false;
                this.ImageFileEdit = [];
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
                this.ImageFileEdit.push(this.IMAGE_ENDPOINT + data.path);
            }, error => {
                console.log("Error occurred: ", error);
            })

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

    /** Event Method for generating the excel file with the offered products for this offer */
    generateExcel() {
        return this.offerService.generateJhorOfferedExcel(this.jhorOfferId).subscribe((result: any) => {
            // It is necessary to create a new blob object with mime-type explicitly set
            // otherwise only Chrome works like it should
            const newBlob = new Blob([result], {type: "application/vnd.openxmlformats-officedocument.spreadsheetml.sheet"});

            // IE doesn't allow using a blob object directly as link href
            // instead it is necessary to use msSaveOrOpenBlob
            if (window.navigator && window.navigator.msSaveOrOpenBlob) {
                window.navigator.msSaveOrOpenBlob(newBlob);
                return;
            }

            // For other browsers:
            // Create a link pointing to the ObjectURL containing the blob.
            const data = window.URL.createObjectURL(newBlob);

            const link = document.createElement('a');
            link.href = data;
            link.download = "Offered Products " + Date.now() + ".xlsx";

            // this is necessary as link.click() does not work on the latest firefox
            link.dispatchEvent(new MouseEvent('click', {bubbles: true, cancelable: true, view: window}));

            setTimeout(() => {
                // For Firefox it is necessary to delay revoking the ObjectURL
                window.URL.revokeObjectURL(data)
                this.isLoading = false
                link.remove();
            }, 100);
        });
    }

    /** handles the uploaded excel file and checks the validity of the uploaded product's codes */
    onCSVUpload(event: any) {
        const target: DataTransfer = <DataTransfer>(event.target);
        if (target.files.length !== 1) throw new Error('Cannot use multiple files');

        const reader: FileReader = new FileReader();
        reader.onload = (e: any) => {
            const fileResult: string = e.target.result;
            const data = <any[]>this.excelService.importFromFile(fileResult);

            const offerObj = new OfferBulk();

            const header: string[] = Object.getOwnPropertyNames(offerObj);

            this.importedProducts = data.slice(1);

            this.total = this.importedProducts.length;

            this.individuallySelectedCodes = this.importedProducts.map(codes => codes[0]);
            this.individuallySelectedProductsCalculation = this.importedProducts.map(calculation => calculation[1]);
            this.individuallySelectedProductsAmount = this.importedProducts.map(discountAmount => discountAmount[2]);

            this.offerService.checkIndividualProductsCodesValidity(this.individuallySelectedCodes)
                .subscribe(result => {
                    this.wrongCodes = result.data;

                    if (this.wrongCodes && this.wrongCodes.length > 0) {
                        this.individuallySelectedCodes = [];
                        this.individuallySelectedProductsCalculation = [];
                        this.individuallySelectedProductsAmount = [];
                        this.continue = false;
                        this._notification.error('Failed!', 'Please Input Proper Data');
                    } else {
                        this.continue = true;
                    }
                })
        };
        reader.readAsBinaryString(target.files[0]);
    }

}
