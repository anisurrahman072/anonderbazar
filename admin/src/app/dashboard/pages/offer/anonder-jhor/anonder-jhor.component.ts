import {Component, OnDestroy, OnInit} from '@angular/core';
import {FormBuilder, FormControl, FormGroup, Validators} from "@angular/forms";
import {environment} from "../../../../../environments/environment";
import {OfferService} from "../../../../services/offer.service";
import moment from "moment";
import {NzNotificationService} from "ng-zorro-antd";
import {FileHolder, UploadMetadata} from "angular2-image-upload";
import {Subscription} from "rxjs";
import {ExportService} from "../../../../services/export.service";

@Component({
    selector: 'app-anonder-jhor',
    templateUrl: './anonder-jhor.component.html',
    styleUrls: ['./anonder-jhor.component.css']
})
export class AnonderJhorComponent implements OnInit, OnDestroy {

    /** Anonder Jhor variables */
    anonderJhorData: any;
    isAnonderJhorEdit: Boolean = false;
    anonderJhorBannerImageFile: File;
    AnonderJhorBannerImageFileEdit: any;
    status: Boolean = false;

    /** Anonder Jhor Offers variables */
    anonderJhorOffersData: any = [];
    anonderJhorOfferLimit: number = 10;
    anonderJhorOfferPage: number = 1;
    anonderJhorOfferTotal: number = 0;
    offerStatus: Boolean = false;
    isAddNew: Boolean = false;
    isVisible: Boolean = false;
    isEdit: Boolean = false;
    isEditVisible: Boolean = false;
    jhorOfferId: number;
    orderedOfferedProducts;
    offerInfo;

    /** Common Variables */
    validateForm: FormGroup;
    IMAGE_ENDPOINT = environment.IMAGE_ENDPOINT;
    _isSpinning: any = false;
    loading: boolean = false;
    private sub: Subscription;


    constructor(
        private fb: FormBuilder,
        private offerService: OfferService,
        private _notification: NzNotificationService,
        private exportService: ExportService
    ) {
    }

    ngOnInit() {
        this.getAnonderJhor();
        this.getAllAnonderJhorOffersData();

        this.sub = this.offerService.reloadOfferListObservable()
            .subscribe(() => {
                this.getAllAnonderJhorOffersData();
            });
    }

    /** Method called to get data of anonder Jhor */
    getAnonderJhor() {
        this.offerService.getAnonderJhor()
            .subscribe(result => {
                this._isSpinning = true
                console.log('anonder jhor data: ', result.data);
                if (result.data) {
                    this.anonderJhorData = result.data;
                    this.status = this.anonderJhorData.status;
                    this._isSpinning = false;
                } else {
                    this._isSpinning = false;
                    this._notification.error('failed', 'Sorry, something went wrong');
                }
            }, () => {
                this._isSpinning = false;
            });
    }

    /** Method called to get all data of anonder Jhor offers */
    getAllAnonderJhorOffersData() {
        this._isSpinning = true;
        this.offerService.getAllAnonderJhorOffersData(this.anonderJhorOfferLimit, this.anonderJhorOfferPage)
            .subscribe(result => {
                this.loading = false;
                console.log('getAnonderJhorOffersData data: ', result);
                this.anonderJhorOffersData = result.data;
                this.anonderJhorOfferTotal = result.total;
                this._isSpinning = false;
            }, error => {
                this._isSpinning = false;
                console.log('error: ', error);
            })
    }

    /** Event Method called to change the status of anonder jhor */
    jhorActiveStatusChange(event) {
        this.offerService.jhorActiveStatusChange(event)
            .subscribe(result => {
                console.log('status : ', result);
                if (result.code === 'INVALID_ACTION') {
                    this._notification.error('Sorry!', 'Offer time ended, you can not change status');
                }
                this.status = result.status;
                this.getAnonderJhor();
                this.getAllAnonderJhorOffersData();
            });
    }

    /** Event Method called to change the status of anonder jhor offers */
    offerActiveStatusChange(event, offerId) {
        this.offerService.getAnonderJhorOfferById(offerId)
            .subscribe(result => {
                let presentTime = moment();
                if (presentTime.diff(result.anonderJhorOffer.end_date) > 0) {
                    this._notification.error('Time Ended', 'You can not change the status for offer purchase history purpose. You better create a new one');
                    this.getAllAnonderJhorOffersData();
                    return;
                } else {
                    let data = {event, offerId}
                    this.offerService.offerActiveStatusChange(data)
                        .subscribe(result => {
                            if (result.code === 'NOT_ALLOWED') {
                                this._notification.error('Time Ended!', 'Anonder Jhor offer has ended');
                            }
                            this.getAllAnonderJhorOffersData();
                        });
                }
            })
    }

    /** Event method called for editing anonder jhor */
    editAnonderJhor() {
        if (this.isAnonderJhorEdit) {
            this.validateForm = this.fb.group({
                startDate: ['', [Validators.required]],
                endDate: ['', [Validators.required]],
            });

            this.AnonderJhorBannerImageFileEdit = [];

            let payload = {
                startDate: this.anonderJhorData.start_date ? this.anonderJhorData.start_date : '',
                endDate: this.anonderJhorData.end_date ? this.anonderJhorData.end_date : ''
            }
            this.validateForm.patchValue(payload);

            if (this.anonderJhorData && this.anonderJhorData.banner_image) {
                this.AnonderJhorBannerImageFileEdit.push(this.IMAGE_ENDPOINT + this.anonderJhorData.banner_image);
            }

            this._isSpinning = false;
        }
    }

    /** Event method for submitting the form */
    submitForm = ($event, value) => {
        $event.preventDefault();
        this._isSpinning = true;

        for (const key in this.validateForm.controls) {
            this.validateForm.controls[key].markAsDirty();
        }

        let formData = new FormData();

        formData.append('startDate', moment(value.startDate).format('YYYY-MM-DD HH:mm:ss'));
        formData.append('endDate', moment(value.endDate).format('YYYY-MM-DD HH:mm:ss'));

        if (this.anonderJhorBannerImageFile) {
            formData.append('hasImage', 'true');
            formData.append('image', this.anonderJhorBannerImageFile, this.anonderJhorBannerImageFile.name);
        } else {
            formData.append('hasImage', 'false');
        }

        this.offerService.updateAnonderJhor(formData).subscribe(result => {
            if (result) {
                this._notification.success('Update', "Anonder Jhor Updated Successfully");
                this._isSpinning = false;
                this.resetForm(null);

                this.getAnonderJhor();
                this.getAllAnonderJhorOffersData();
                this.isAnonderJhorEdit = false;
            }
        }, () => {
            this._isSpinning = false;
        });
    };

    onJhorBannerRemoved(file: FileHolder) {
        this.anonderJhorBannerImageFile = null;
    }

    onBeforejhorBannerUpload = (metadata: UploadMetadata) => {
        this.anonderJhorBannerImageFile = metadata.file;
        return metadata;
    }

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

    /** Event method for deleting anonder jhor offer */
    deleteAnonderJhorOffer(index, id) {
        this._isSpinning = true;
        this.offerService.deleteAnonderJhorOffer(id).subscribe(result => {
            this._notification.warning(' Delete', "Anonder Jhor Offer Successfully");
            this._isSpinning = false;
            this.getAllAnonderJhorOffersData();
        }, (err) => {
            this._isSpinning = false;
        });
    };

    addNew() {
        this.isAddNew = !this.isAddNew;
        this.isVisible = true;
    }

    editJhorOffer(index, id) {
        this.offerService.getAnonderJhorOfferById(id)
            .subscribe(result => {
                let presentTime = moment();
                if (presentTime.diff(result.anonderJhorOffer.end_date) > 0) {
                    this._notification.error('Time Ended', 'You can not edit this offer for the history purpose. If you dnt want to keep this, then delete it(products purchased history from this offer will also be deleted)');
                    return;
                } else {
                    this.isEdit = !this.isEdit;
                    this.isEditVisible = true;
                    this.jhorOfferId = id;
                }
            })
    }

    generateOfferExcelById(offerId) {
        this.offerService.generateOfferExcelById(2, offerId)
            .subscribe(result => {
                this.orderedOfferedProducts = result.data[0];
                if (this.orderedOfferedProducts && this.orderedOfferedProducts.length <= 0) {
                    this._notification.error('No Order', 'None of the products were ordered from this offer, no need to create a CSV file');
                    return;
                } else {
                    this.offerInfo = result.data[1];
                    let excelData = [];
                    this.orderedOfferedProducts.forEach(offerItem => {
                        excelData.push({
                            'Order id': offerItem.order_id,
                            'Sub Order id': offerItem.suborder_id,
                            'product code': offerItem.product_code,
                            'product name': offerItem.product_name,
                            'product quantity': offerItem.product_quantity,
                            'product total price': offerItem.product_total_price,
                            'warehouse name': offerItem.warehouse_name,
                        })
                    });

                    const header = [
                        'Order id',
                        'Sub Order id',
                        'product code',
                        'product name',
                        'product quantity',
                        'product total price',
                        'warehouse name',
                    ];
                    let offer_id = this.offerInfo.id;
                    let offerName = 'Anonder Jhor';
                    let offer_calculation_type = this.offerInfo.calculation_type;
                    let offer_discount_amount = this.offerInfo.discount_amount;
                    let offer_start_date = moment(this.offerInfo.start_date).format('DD-MM-YYYY HH:mm:ss');
                    let offer_end_date = moment(this.offerInfo.end_date).format('DD-MM-YYYY HH:mm:ss');

                    let fileName = 'Jhor Offer Orders';

                    this.offerService.downloadFile(excelData, header, fileName, offer_id, offerName, offer_calculation_type, offer_discount_amount, offer_start_date, offer_end_date);
                }
            })
    }

    ngOnDestroy(): void {
        this.sub ? this.sub.unsubscribe() : '';
    }

}
