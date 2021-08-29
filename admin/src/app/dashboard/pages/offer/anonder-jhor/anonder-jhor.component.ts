import {Component, OnDestroy, OnInit} from '@angular/core';
import {FormBuilder, FormGroup, Validators} from "@angular/forms";
import {environment} from "../../../../../environments/environment";
import {OfferService} from "../../../../services/offer.service";
import moment from "moment";
import {NzNotificationService} from "ng-zorro-antd";
import {FileHolder, UploadMetadata} from "angular2-image-upload";
import {Subscription} from "rxjs";
import * as _moment from "moment";
import {GLOBAL_CONFIGS, ORDER_TYPE} from "../../../../../environments/global_config";
import {DesignImagesService} from "../../../../services/design-images.service";

@Component({
    selector: 'app-anonder-jhor',
    templateUrl: './anonder-jhor.component.html',
    styleUrls: ['./anonder-jhor.component.css']
})
export class AnonderJhorComponent implements OnInit, OnDestroy {
    jhorId: number;

    /** Anonder Jhor variables */
    anonderJhorData: any;
    isAnonderJhorEdit: Boolean = false;
    anonderJhorBannerImageFile: File;
    AnonderJhorBannerImageFileEdit: any;
    status: Boolean = false;
    showHome: Boolean = false;
    anonderJhorHomepageBannerImageFile: File;
    AnonderJhorHomepageBannerImageFileEdit: any;

    isActiveSslCommerz: boolean = false;
    isActiveBkash: boolean = false;
    isActiveOffline: boolean = false;
    isActiveCashOnDelivery: boolean = false;
    isActiveNagad: boolean = false;

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
    private statusOptions = GLOBAL_CONFIGS.ORDER_STATUSES_KEY_VALUE;

    /** Image variables */
    hasJhorBannerImageFile: boolean = false;
    hasAnonderJhorHomepageBannerImageFile: boolean = false;

    isJhorBannerImageInDB: boolean = false;
    isAnonderJhorHomepageBannerImageInDB: boolean = false;

    constructor(
        private fb: FormBuilder,
        private offerService: OfferService,
        private _notification: NzNotificationService,
        private designImagesService: DesignImagesService,
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
                if (result.data) {
                    this.anonderJhorData = result.data;

                    this.isActiveSslCommerz = !!this.anonderJhorData.pay_by_sslcommerz;
                    this.isActiveBkash = !!this.anonderJhorData.pay_by_bKash;
                    this.isActiveOffline = !!this.anonderJhorData.pay_by_offline;
                    this.isActiveCashOnDelivery = !!this.anonderJhorData.pay_by_cashOnDelivery;
                    this.isActiveNagad = !!this.anonderJhorData.pay_by_nagad;

                    this.status = this.anonderJhorData.status;
                    this.jhorId = this.anonderJhorData.id;
                    if(this.anonderJhorData.banner_image){
                        this.isJhorBannerImageInDB = true;
                    }
                    if(this.anonderJhorData.homepage_banner_image){
                        this.isAnonderJhorHomepageBannerImageInDB = true;
                    }
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
                /*console.log('getAnonderJhorOffersData data: ', result);*/
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
                                this._notification.error('Time Ended!', 'Anonder Jhor offer has ended or forcefully stopped');
                            }
                            this.getAllAnonderJhorOffersData();
                        });
                }
            })
    }

    /** Event Method called to forcefully stop the anonder jhor offers */
    offerForceStop(event, offerId) {
        console.log('eve: ', event);
        this.offerService.getAnonderJhorOfferById(offerId)
            .subscribe(result => {
                let presentTime = moment();
                if (presentTime.diff(result.anonderJhorOffer.end_date) > 0) {
                    this._notification.error('Time Ended', 'No use, Time already ended');
                    this.getAllAnonderJhorOffersData();
                    return;
                } else {
                    let data = {event, offerId}
                    this.offerService.offerForceStop(data)
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
                showHome: ['', []],
                pay_by_sslcommerz: ['', []],
                pay_by_bKash: ['', []],
                pay_by_offline: ['', []],
                pay_by_cashOnDelivery: ['', []],
                pay_by_nagad: ['', []]
            });

            this.AnonderJhorBannerImageFileEdit = [];
            this.AnonderJhorHomepageBannerImageFileEdit = [];

            this.showHome = this.anonderJhorData.show_in_homepage ? this.anonderJhorData.show_in_homepage : false

            let payload = {
                startDate: this.anonderJhorData.start_date ? this.anonderJhorData.start_date : '',
                endDate: this.anonderJhorData.end_date ? this.anonderJhorData.end_date : '',
                showHome: this.showHome,
                pay_by_sslcommerz: this.anonderJhorData.pay_by_sslcommerz,
                pay_by_bKash: this.anonderJhorData.pay_by_bKash,
                pay_by_offline: this.anonderJhorData.pay_by_offline,
                pay_by_cashOnDelivery: this.anonderJhorData.pay_by_cashOnDelivery,
                pay_by_nagad: this.anonderJhorData.pay_by_nagad
            }

            this.validateForm.patchValue(payload);

            if (this.anonderJhorData && this.anonderJhorData.banner_image) {
                this.hasJhorBannerImageFile = true;
                this.AnonderJhorBannerImageFileEdit.push(this.IMAGE_ENDPOINT + this.anonderJhorData.banner_image);
            }

            if (this.anonderJhorData && this.anonderJhorData.homepage_banner_image) {
                this.hasAnonderJhorHomepageBannerImageFile = true;
                this.AnonderJhorHomepageBannerImageFileEdit.push(this.IMAGE_ENDPOINT + this.anonderJhorData.homepage_banner_image);
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
        formData.append('showHome', value.showHome);
        formData.append('pay_by_sslcommerz', this.isActiveSslCommerz ? "1" : "0");
        formData.append('pay_by_bKash', this.isActiveBkash ? "1" : "0");
        formData.append('pay_by_offline', this.isActiveOffline ? "1" : "0");
        formData.append('pay_by_cashOnDelivery', this.isActiveCashOnDelivery ? "1" : "0");
        formData.append('pay_by_nagad', this.isActiveNagad ? "1" : "0");

        /*if (this.anonderJhorBannerImageFile) {
            formData.append('hasImage', 'true');
            formData.append('image', this.anonderJhorBannerImageFile, this.anonderJhorBannerImageFile.name);
        } else {
            formData.append('hasImage', 'false');
        }

        if (this.anonderJhorHomepageBannerImageFile) {
            formData.append('hasBannerImage', 'true');
            formData.append('image', this.anonderJhorHomepageBannerImageFile, this.anonderJhorHomepageBannerImageFile.name);
        } else {
            formData.append('hasBannerImage', 'false');
        }*/

        if (this.hasJhorBannerImageFile) {
            formData.append('banner_image', this.AnonderJhorBannerImageFileEdit[0].split(this.IMAGE_ENDPOINT)[1]);
        }

        if (this.hasAnonderJhorHomepageBannerImageFile) {
            formData.append('homepage_banner_image', this.AnonderJhorHomepageBannerImageFileEdit[0].split(this.IMAGE_ENDPOINT)[1]);
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
            this._notification.error('Failed!', 'Something is wrong');
        });
    };

    onJhorBannerRemoved(file: FileHolder) {
        let formData = new FormData();
        formData.append('oldImagePath', `${this.AnonderJhorBannerImageFileEdit[0].split(this.IMAGE_ENDPOINT)[1]}`);
        if(this.isJhorBannerImageInDB){
            formData.append('id', `${this.jhorId}`);
            formData.append('tableName', `anonder_jhor`);
            formData.append('column', `banner_image`);
        }

        this.designImagesService.deleteImage(formData)
            .subscribe(data => {
                this.isJhorBannerImageInDB = false;
                this.AnonderJhorBannerImageFileEdit = [];
                this.hasJhorBannerImageFile = false;
                this._notification.success("Success", "Successfully deleted Anonder Jhor Banner image");
            }, error => {
                console.log("Error occurred: ", error);
                this._notification.success("Error", "Error occurred while deleting Anonder Jhor Banner image");
            })
    }

    onJhorHomepageBannerRemoved(file: FileHolder) {
        let formData = new FormData();
        formData.append('oldImagePath', `${this.AnonderJhorHomepageBannerImageFileEdit[0].split(this.IMAGE_ENDPOINT)[1]}`);
        if(this.isAnonderJhorHomepageBannerImageInDB){
            formData.append('id', `${this.jhorId}`);
            formData.append('tableName', `anonder_jhor`);
            formData.append('column', `homepage_banner_image`);
        }

        this.designImagesService.deleteImage(formData)
            .subscribe(data => {
                this.isAnonderJhorHomepageBannerImageInDB = false;
                this.AnonderJhorHomepageBannerImageFileEdit = [];
                this.hasAnonderJhorHomepageBannerImageFile = false;
                this._notification.success("Success", "Successfully deleted Anonder Jhor Homepage Banner image");
            }, error => {
                console.log("Error occurred: ", error);
                this._notification.success("Error", "Error occurred while deleting Anonder Jhor Homepage Banner image");
            })
    }

    onBeforejhorBannerUpload = (metadata: UploadMetadata) => {
        let formData = new FormData();
        formData.append('image', metadata.file, metadata.file.name);

        this.designImagesService.insertImage(formData)
            .subscribe(data => {
                this.hasJhorBannerImageFile = true;
                this.AnonderJhorBannerImageFileEdit.push(this.IMAGE_ENDPOINT + data.path);
            }, error => {
                console.log("Error occurred: ", error);
            })

        return metadata;
    }

    onBeforejhorHomepageBannerUpload = (metadata: UploadMetadata) => {
        let formData = new FormData();
        formData.append('image', metadata.file, metadata.file.name);

        this.designImagesService.insertImage(formData)
            .subscribe(data => {
                this.hasAnonderJhorHomepageBannerImageFile = true;
                this.AnonderJhorHomepageBannerImageFileEdit.push(this.IMAGE_ENDPOINT + data.path);
            }, error => {
                console.log("Error occurred: ", error);
            })

        return metadata;
    }

    changeShowHomepage() {
        this.showHome = !this.showHome;
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
                    this._notification.error('Time Ended', 'You can not edit this offer for the history purpose. If you do not want to keep this, then delete it(products purchased history from this offer will also be deleted)');
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
                    /*console.log('offer info: ', this.offerInfo);*/
                    let excelData = [];
                    this.orderedOfferedProducts.forEach(offerItem => {
                        excelData.push({
                            'Order Date': _moment(offerItem.orderCreatedAt).format('DD-MM-YYYY'),
                            'Order Time': _moment(offerItem.orderCreatedAt).format('h:m a'),
                            'Order id': offerItem.order_id,
                            'SubOrder Id': offerItem.suborder_id,
                            'Customer Name': offerItem.customer_name ? offerItem.customer_name.split(',').join('-').trim() : 'N/a',
                            'Customer Phone': (offerItem.customer_phone) ? offerItem.customer_phone : 'N/a',
                            'Customer Division': offerItem.division_name ? offerItem.division_name.split(',').join('/').trim() : 'N/a',
                            'Customer District': offerItem.zila_name ? offerItem.zila_name.split(',').join('/').trim() : 'N/a',
                            'Customer Upazila': offerItem.upazila_name ? offerItem.upazila_name.split(',').join('/').trim() : 'N/a',
                            'Customer House/Road/Block/Village': offerItem.address ? offerItem.address.split(',').join('/').trim() : 'N/a',
                            'Category': offerItem.categoryName ? offerItem.categoryName.split(',').join('-').trim() : 'N/a',
                            'product name': offerItem.product_name ? offerItem.product_name.split(',').join('-').trim() : 'N/a',
                            'Product SKU': offerItem.product_code,
                            'MRP': offerItem.originalPrice,
                            'Vendor Price': offerItem.vendorPrice,
                            'Quantity': offerItem.product_quantity,
                            'Shipping Charge': offerItem.courier_charge,
                            'Total': offerItem.product_total_price,
                            'Grand Total': offerItem.total_price,
                            'Payment Method': offerItem.paymentType,
                            'Transaction ID': offerItem.transactionKey,
                            'Payment Amount': offerItem.order_type === ORDER_TYPE.REGULAR_ORDER_TYPE ? offerItem.paid_amount : offerItem.paymentAmount,
                            'Transaction Time': _moment(offerItem.transactionTime).format('DD-MM-YYYY h:m a'),
                            'Remaining Amount': offerItem.dueAmount ? offerItem.dueAmount : 0,
                            'Vendor Name': offerItem.warehouse_name ? offerItem.warehouse_name.split(',').join('-').trim() : 'N/a',
                            'Vendor Phone': (offerItem.vendor_phone) ? offerItem.vendor_phone : 'N/a',
                            'Vendor Address': offerItem.vendor_address ? offerItem.vendor_address.split(',').join('/').trim() : 'N/a',
                            'Suborder Status': typeof this.statusOptions[offerItem.sub_order_status] !== 'undefined' ? this.statusOptions[offerItem.sub_order_status] : 'Unrecognized Status',
                            'Suborder Changed By': ((offerItem.suborder_changed_by_name) ? offerItem.suborder_changed_by_name : ''),
                            'Order Status': typeof this.statusOptions[offerItem.order_status] !== 'undefined' ? this.statusOptions[offerItem.order_status] : 'Unrecognized Status',
                            'Order Status Changed By': ((offerItem.order_changed_by_name) ? offerItem.order_changed_by_name : ''),
                        })
                    });

                    const header = [
                        'Order Date',
                        'Order Time',
                        'Order id',
                        'SubOrder Id',
                        'Customer Name',
                        'Customer Phone',
                        'Customer Division',
                        'Customer District',
                        'Customer Upazila',
                        'Customer House/Road/Block/Village',
                        'Category',
                        'product name',
                        'Product SKU',
                        'MRP',
                        'Vendor Price',
                        'Quantity',
                        'Shipping Charge',
                        'Total',
                        'Grand Total',
                        'Payment Method',
                        'Transaction ID',
                        'Payment Amount',
                        'Transaction Time',
                        'Remaining Amount',
                        'Vendor Name',
                        'Vendor Phone',
                        'Vendor Address',
                        'Suborder Status',
                        'Suborder Changed By',
                        'Order Status',
                        'Order Status Changed By'
                    ];
                    let offer_id = this.offerInfo.id;
                    let offerName = this.offerInfo.offer_name;
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

    changeSslCommerzActivation() {
        this.isActiveSslCommerz = !this.isActiveSslCommerz;
    }
    changeBkashActivation() {
        this.isActiveBkash = !this.isActiveBkash;
    }
    changeOfflineActivation() {
        this.isActiveOffline = !this.isActiveOffline;
    }
    changeCashOnDeliveryActivation() {
        this.isActiveCashOnDelivery = !this.isActiveCashOnDelivery;
    }
    changeNagadActivation() {
        this.isActiveNagad = !this.isActiveNagad;
    }
}
