import {AfterViewInit, ChangeDetectorRef, Component, OnDestroy, OnInit} from '@angular/core';
import {FormBuilder, FormGroup, Validators} from '@angular/forms';
import {NzNotificationService} from 'ng-zorro-antd';
import {CmsService} from '../../../../services/cms.service';
import {ProductService} from '../../../../services/product.service';

@Component({
    selector: 'app-offer-list',
    templateUrl: './offer-list.component.html',
    styleUrls: ['./offer-list.component.css']
})

export class OfferListComponent implements OnInit, AfterViewInit, OnDestroy {

    private offerProductIds: any = [];
    homeOfferData: any = [];
    homeChildOfferData: any = [];
    addNew: boolean;
    currentProduct: any = {};
    currentOffer: any = {};
    status: any = 1;
    type: any;

    validateForm: FormGroup;
    validateFormOffer: FormGroup;

    isOfferVisible: boolean = false;
    isProductVisible: boolean = false;
    childOffers: any = [];
    allOffers: any = [];
    allProducts: any = [];

    storeProductIds: any = [];
    storeOfferIds: any = [];
    productsOffered = [];
    offers = [];
    checked = 'true';

    private selectedAllProductIds: any = [];
    private allProductSelectAll: any = [];

    homeOfferLimit: number = 10;
    homeOfferPage: number = 1;
    homeOfferTotal: number = 0;

    loading: boolean = false;
    _isSpinning: boolean = true;

    productOfferedLimit: number = 10;
    productOfferedPage: number = 1;
    productOfferedTotal: number = 0;

    offerModalLimit: number = 10;
    offerModalPage: number = 1;
    offerModalTotal: number = 0;

    modalAllOfferLimit: number = 15;
    modalAllOfferPage: number = 1;
    modalAllOfferTotal: number = 0;

    constructor(
        private fb: FormBuilder,
        private productservice: ProductService,
        private _notification: NzNotificationService,
        private cdr: ChangeDetectorRef,
        private cmsService: CmsService) {

    }

    ngOnDestroy(): void {

    }

    ngAfterViewInit() {

    }

    // init the component
    ngOnInit() {
        this.validateForm = this.fb.group({
            name: ['', []],
            quantity: ['', []],
            variant_id: ['', [Validators.required]],
            warehouses_variant_id: ['', [Validators.required]]
        });

        this.validateFormOffer = this.fb.group({
            offerChecked: ['', []],
        });

        this.getData();
        this.getChildData();
    };

    // Event method for getting all the data for the page
    getData() {
        this._isSpinning = true;
        this.cmsService
            .getAllSearch(
                {page: 'POST', section: 'HOME', subsection: 'PARENTOFFER'},
                this.homeOfferLimit,
                this.homeOfferPage
            )
            .subscribe(result => {
                this.loading = false;
                console.log('result-getAllSearch', result);
                this.homeOfferData = result;
                this.homeOfferTotal = result.total;
                this._isSpinning = false;
            }, error => {
                this._isSpinning = false;
            });
    };

    // Event method for getting all child data for the page
    getChildData() {
        this._isSpinning = true;
        this.cmsService
            .getAllSearch({page: 'POST', section: 'HOME', subsection: 'OFFER'},
                this.homeOfferLimit,
                this.homeOfferPage)
            .subscribe(result1 => {
                this.loading = false;
                this.homeChildOfferData = result1;
                this._isSpinning = false;
            }, error => {
                this._isSpinning = false;
            });
    };

    // Method for showing the offer modal
    showOfferModal = data => {
        // this.formReset();
        this.addNew = false;
        this.currentOffer = data;
        this.isOfferVisible = true;
        this.offers = [];
        this.allOffers = [];

        this.getOfferData(1, data);
        if (this.status == 1) {
            this.type = 0;
        } else {
            this.type = 1;
        }
    };

    //Event method for getting all offer data for the page
    getOfferData(event: any, data: any) {
        if (event) {
            this.homeOfferPage = event;
        }
        this.loading = true;
        this.offers = [];
        this.cmsService.getById(data.id)
            .subscribe(arg => {

                this.childOffers = arg.data_value[0].offers;
                console.log('this.childOffers', this.childOffers);
                if (this.childOffers.length > 0) {
                    this.cmsService.getByIds(this.childOffers)
                        .subscribe((result: any) => {
                            this.offers = result;
                        });

                }
                this.cmsService
                    .getAllSearch({page: 'POST', section: 'HOME', subsection: 'OFFER'})
                    .subscribe(result => {
                        this.loading = false;
                        console.log(result);

                        const tmpOfferIds = result.map(elem => elem.id);

                        this.childOffers.forEach(element => {
                            let findValue = tmpOfferIds.indexOf(element);
                            tmpOfferIds.splice(findValue, 1);
                        });
                        if (tmpOfferIds && tmpOfferIds.length > 0) {
                            this.cmsService.getByIds(tmpOfferIds)
                                .subscribe((result: any) => {
                                    this.allOffers = result;
                                });
                        }
                    }, error => {
                        this.loading = false;
                    });
                this.loading = false;
            }, (err) => {
                this.loading = false;
            });

    }

    // Method for refresh offer checkbox data in the offer modal
    _refreshStatusOffer($event, value) {
        if ($event == true) {
            this.storeOfferIds.push(value);
        } else {
            let findValue = this.storeOfferIds.indexOf(value);
            this.storeOfferIds.splice(findValue, 1);
        }
    };

    // Method for showing product modal
    showProductModal = data => {
        // this.formReset();
        this.addNew = false;
        this.currentProduct = data;
        this.isProductVisible = true;

        this.productsOffered = [];
        this.getProduct(null, data);
        if (this.status == 1) {
            this.type = 0;
        } else {
            this.type = 1;
        }
    };

    getProduct(event: any, data?: any) {
        if (event) {
            this.homeOfferPage = event;
        }

        if (data && data.data_value && data.data_value.length && Array.isArray(data.data_value[0].products)) {
            this.offerProductIds = data.data_value[0].products.filter(prod => prod);
        } else {
            this.offerProductIds = [];
        }

        this._isSpinning = true;

        this.productservice.getByIdsWithJoin(this.offerProductIds)
            .subscribe(result => {
                this.productsOffered = result;
                console.log('getProduct-result', result);
                this._isSpinning = false;

            }, (error) => {
                this._isSpinning = false;
            });
    };

    //Event method for resetting the form
    formReset() {
        this.validateForm.reset();
        for (const key in this.validateForm.controls) {
            this.validateForm.controls[key].markAsPristine();
        }
    };

    handleOk = e => {
        this.isOfferVisible = false;
        this.isProductVisible = false;
    };

    handleCancel = e => {
        this.isOfferVisible = false;
        this.isProductVisible = false;
    };

    addNewProducts() {
        this.selectedAllProductIds = [];
        this.allProductSelectAll = [];
        this.addNew = !this.addNew;
    }

    // Event method for submitting the offer form
    submitFormOffer = ($event, value) => {

        if( !(this.storeOfferIds && this.storeOfferIds.length > 0) ){
            return false;
        }

        this.currentOffer.data_value[0].offers = this.currentOffer.data_value[0].offers.concat(this.storeOfferIds);
        this._isSpinning = true;
        this.cmsService.updateOffer(this.currentOffer)
            .subscribe(result => {
                this._notification.success('Offer Added', "Feature Title: ");
                this._isSpinning = false;
                this.isOfferVisible = false;
                this.storeOfferIds = [];
                this.allOffers = [];
                this.offers = [];

            }, (er) => {
                this._isSpinning = false;
            });
    }


    //Event method for deleting offer product
    deleteConfirm(index, id) {

        let findValue = this.offerProductIds.indexOf(id);
        this.offerProductIds.splice(findValue, 1);
        this.currentProduct.data_value[0].products = this.offerProductIds;
        this._isSpinning = true;
        this.cmsService.offerProductUpdate(this.currentProduct).subscribe(result => {
            this._notification.warning('Offer Product Delete', "Deleted Successfully");
            this._isSpinning = false;
            this.isProductVisible = false;
            this.storeProductIds = [];
            this.allProducts = [];
            this.offerProductIds = [];

        }, (err) => {
            this._isSpinning = false;
        });

    };

    //Event method for deleting child offer
    deleteConfirmOffer(index, id) {

        let findValue = this.childOffers.indexOf(id);
        this.childOffers.splice(findValue, 1);
        this.currentOffer.data_value[0].offers = this.childOffers;
        this._isSpinning = true;
        this.cmsService.updateOffer(this.currentOffer).subscribe(result => {
            this._notification.warning('Offer Delete', "Deleted Successfully");
            this._isSpinning = false;
            this.isOfferVisible = false;
            this.storeOfferIds = [];
            this.offers = [];
            // this.alloffers2 = [];
        }, (err) => {
            this._isSpinning = false;
        });
    };

    //Event method for deleting offer
    deleteOffer(index, id) {
        this._isSpinning = true;
        this.cmsService.delete(id).subscribe(result => {
            this._notification.warning('Parent Offer Delete', "Deleted Successfully");
            this._isSpinning = false;
            this.getData();
            this.getChildData();
        }, (err) => {
            this._isSpinning = false;
        });
    };

    onNewProductAdded() {
        this.addNew = false;
        this.isProductVisible = false;
        this.getData();
        // this.getProduct(1, this.currentProduct);
    }
}


