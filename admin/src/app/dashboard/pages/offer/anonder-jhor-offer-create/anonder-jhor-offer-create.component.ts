import {Component, Input, OnInit} from '@angular/core';
import {FormBuilder, FormGroup, Validators} from '@angular/forms';
import {Router} from '@angular/router';
import {FileHolder, UploadMetadata} from 'angular2-image-upload';
import {NzNotificationService} from 'ng-zorro-antd';
import {environment} from "../../../../../environments/environment";
import {OfferService} from "../../../../services/offer.service";
import moment from "moment";
import {ExcelService} from "../../../../services/excel.service";

class OfferBulk {
    code: string = "";
    calculation_type: string = "";
    discount_amount: number = 0;

}

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

    /** excel file variables */
    isLoading: boolean = false;
    private importedProducts: OfferBulk[] = [];
    total: number = 0;
    wrongCodes = [];
    private individuallySelectedCodes: any = [];
    continue: Boolean = false;
    private individuallySelectedProductsCalculation: any = [];
    private individuallySelectedProductsAmount: any = [];

    constructor(
        private router: Router,
        private _notification: NzNotificationService,
        private fb: FormBuilder,
        private offerService: OfferService,
        private excelService: ExcelService,
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

        if (this.ImageFile) {
            formData.append('hasImage', 'true');
            formData.append('image', this.ImageFile, this.ImageFile.name);
        } else {
            formData.append('hasImage', 'false');
        }

        if (this.individuallySelectedCodes && this.individuallySelectedCodes.length <= 0) {
            this._notification.error('No Product', 'Please add products for this offer');
            return;
        } else {
            formData.append('individuallySelectedCodes', this.individuallySelectedCodes);
        }

        if (this.individuallySelectedProductsCalculation) {
            formData.append('individuallySelectedProductsCalculation', this.individuallySelectedProductsCalculation);
        }
        if (this.individuallySelectedProductsAmount) {
            formData.append('individuallySelectedProductsAmount', this.individuallySelectedProductsAmount);
        }

        this.submitting = true;
        this.offerService.anonderJhorOfferInsert(formData).subscribe(result => {
            this.submitting = false;
            this._notification.success('Offer Added', "Offer under anonder jhor created successfully");
            this._isSpinning = false;
            this.resetForm(null);
            this.isVisible = false;
            this.offerService.reloadOfferList();
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

    /** Event Method for generating the empty sample excel file to add jhor offer products with individual offer price */
    generateExcel() {
        return this.offerService.generateExcel().subscribe((result: any) => {
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
            link.download = "Sample Jhor excel " + Date.now() + ".xlsx";

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

    /** handles the uploaded excel file and checks the validity of the uploaded products codes */
    onCSVUpload(event: any) {
        const target: DataTransfer = <DataTransfer>(event.target);
        if (target.files.length !== 1) throw new Error('Cannot use multiple files');

        const reader: FileReader = new FileReader();
        reader.onload = (e: any) => {
            const fileResult: string = e.target.result;
            const data = <any[]>this.excelService.importFromFile(fileResult);

            const offerObj = new OfferBulk();

            const header: string[] = Object.getOwnPropertyNames(offerObj);
            console.log('header', header);

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
