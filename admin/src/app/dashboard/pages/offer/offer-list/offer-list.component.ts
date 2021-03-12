import {AfterViewInit, ChangeDetectorRef, Component, OnInit} from '@angular/core';
import {FormBuilder, FormGroup, Validators} from '@angular/forms';
import {NzNotificationService} from 'ng-zorro-antd';
import {CmsService} from '../../../../services/cms.service';
import {ProductService} from '../../../../services/product.service';

@Component({
    selector: 'app-offer-list',
    templateUrl: './offer-list.component.html',
    styleUrls: ['./offer-list.component.css']
})

export class OfferListComponent implements OnInit, AfterViewInit {
    homeOfferData: any = [];
    offerProductIds: any = [];
    homeChildOfferData: any = [];
    addNew: boolean;
    currentProduct: any = {};
    currentOffer: any = {};
    status: any = 1;
    type: any;
    _isSpinning: boolean = true;
    validateForm: FormGroup;
    validateProductForm: FormGroup;
    validateFormOffer: FormGroup;
    isOfferVisible: boolean = false;
    isProductVisible: boolean = false;
    productOffers: any = [];
    childOffers: any = [];
    alloffers: any = [];
    alloffers2: any = [];
    allProduct: any = [];
    allProduct2: any = [];
    storeProductIds: any = [];
    storeOfferIds: any = [];
    _displayData = [];
    products = [];
    offers = [];
    checked = 'true';

    allProductPage = 1;
    allProductLimit = 30;
    allProductTotal = 0;

    homeOfferLimit: number = 10;
    homeOfferPage: number = 1;
    homeOfferTotal: number = 1;
    loading: boolean = false;

    constructor(
        private fb: FormBuilder,
        private productservice: ProductService,
        private _notification: NzNotificationService,
        private cdr: ChangeDetectorRef,
        private cmsService: CmsService) {

    }

    // init the component
    ngOnInit() {
        this.validateForm = this.fb.group({
            name: ['', []],
            quantity: ['', []],
            variant_id: ['', [Validators.required]],
            warehouses_variant_id: ['', [Validators.required]]
        });
        this.validateProductForm = this.fb.group({
            productChecked: ['', []],
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

    //Event method for getting all offer data for the page
    getOfferData(event: any, data: any) {
        if (event) {
            this.homeOfferPage = event;
        }
        this.loading = true;
        this.offers = [];
        this.cmsService.getById(data.id, this.homeOfferPage, this.homeOfferLimit)
            .subscribe(arg => {

                this.childOffers = arg.data_value[0].offers;
                console.log(this.childOffers);
                if (this.childOffers.length > 0) {
                    this.childOffers.forEach(element => {
                        this.cmsService.getById(element, this.homeOfferPage, this.homeOfferLimit)
                            .subscribe(result => {
                                this.offers.push(result);
                            });
                    });
                }

            });

        this.cmsService
            .getAllSearch({page: 'POST', section: 'HOME', subsection: 'OFFER'})
            .subscribe(result => {
                this.loading = false;
                console.log(result);

                result.forEach(element => {
                    this.alloffers2.push(element.id);
                });

                this.childOffers.forEach(element => {
                    let findValue = this.alloffers2.indexOf(element);
                    this.alloffers2.splice(findValue, 1);
                });

                this.alloffers2.forEach(element => {
                    this.cmsService.getById(element, this.homeOfferPage, this.homeOfferLimit)
                        .subscribe(result => {
                            this.alloffers.push(result);
                        });
                });

            }, error => {
                this.loading = false;
            });
    }


    // Method for showing the offer modal
    showOfferModal = data => {
        // this.formReset();
        this.addNew = false;
        this.currentOffer = data;
        this.isOfferVisible = true;
        this.offers = [];
        this.alloffers = [];
        this.alloffers2 = [];

        this.getOfferData(null, data);
        if (this.status == 1) {
            this.type = 0;
        } else {
            this.type = 1;
        }
    };

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
        this.products = [];
        this.getProduct(null, data);
        if (this.status == 1) {
            this.type = 0;
        } else {
            this.type = 1;
        }
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

    getProduct(event: any, data?: any) {
        if (event) {
            this.homeOfferPage = event;
        }
        if (data) {
            this.offerProductIds = data.data_value[0].products;
        }
        console.log('getProduct', data);

        this.productOffers = this.offerProductIds;

        this._isSpinning = true;

        this.productservice.getByIdsWithJoin(this.offerProductIds)
            .subscribe(result => {
                this.products = result;
                this._isSpinning = false;
            }, (error) => {
                this._isSpinning = false;
            });
        this.allProduct = [];
        // this.getAllProducts();

    };

    getAllProducts() {
        this.productservice.getAllWithPagination(this.homeOfferPage, this.homeOfferLimit)
            .subscribe(result => {
                console.log(' this.productservice.getAll', result)
                this.allProduct = [];
                if (typeof result.data !== 'undefined') {
                    this.allProduct = result.data.filter((item) => {
                        return this.productOffers.indexOf(item.id) === -1
                    })
                }

                this.allProductTotal = result.total;

                // this.productOffers.forEach(element => {
                //     let findValue = this.allProduct2.indexOf(element);
                //     this.allProduct2.splice(findValue, 1);
                // });

                // result.forEach(element => {
                //     this.productservice.getById(element)
                //         .subscribe(result2 => {
                //             this.allProduct.push(result2);
                //         });
                // });

            });
    }


    ngAfterViewInit() {


    }


    // Event method for submitting the offer form
    submitFormOffer = ($event, value) => {

        this.currentOffer.data_value[0].offers = this.currentOffer.data_value[0].offers.concat(this.storeOfferIds);

        this.cmsService.updateOffer(this.currentOffer).subscribe(result => {
            this._notification.success('Offer Added', "Feature Title: ");
            this._isSpinning = false;
            this.isOfferVisible = false;
            this.storeOfferIds = [];
            this.alloffers = [];
            this.offers = [];
            this.alloffers2 = [];
        });
        console.log(this.currentProduct);

    }

    // Event method for submitting the product form
    submitForm = ($event, value) => {
        this.currentProduct.data_value[0].products = this.currentProduct.data_value[0].products.concat(this.storeProductIds);

        this.cmsService.offerProductUpdate(this.currentProduct).subscribe(result => {
            this._notification.success('Offer Added', "Feature Title: ");
            this._isSpinning = false;
            this.isProductVisible = false;
            this.storeProductIds = [];
            this.allProduct = [];
            this.productOffers = [];
            this.allProduct2 = [];
        });
        console.log(this.currentProduct);

    }

    // Method for refresh offer checkbox data in the offer modal
    _refreshStatus($event, value) {
        if ($event == true) {
            this.storeProductIds.push(value);
        } else {
            let findValue = this.storeProductIds.indexOf(value);
            this.storeProductIds.splice(findValue, 1);
        }
    };

    //Event method for deleting offer product
    deleteConfirm(index, id) {

        let findValue = this.productOffers.indexOf(id);
        this.productOffers.splice(findValue, 1);
        this.currentProduct.data_value[0].products = this.productOffers;

        this.cmsService.offerProductUpdate(this.currentProduct).subscribe(result => {
            this._notification.warning('Offer Product Delete', "Deleted Successfully");
            this._isSpinning = false;
            this.isProductVisible = false;
            this.storeProductIds = [];
            this.allProduct = [];
            this.productOffers = [];
            this.allProduct2 = [];
        });

    };

    //Event method for deleting child offer
    deleteConfirmOffer(index, id) {

        let findValue = this.childOffers.indexOf(id);
        this.childOffers.splice(findValue, 1);
        this.currentOffer.data_value[0].offers = this.childOffers;

        this.cmsService.updateOffer(this.currentOffer).subscribe(result => {
            this._notification.warning('Offer Delete', "Deleted Successfully");
            this._isSpinning = false;
            this.isOfferVisible = false;
            this.storeOfferIds = [];
            this.offers = [];
            this.alloffers2 = [];
        });
    };

    //Event method for deleting offer
    deleteOffer(index, id) {

        this.cmsService.delete(id).subscribe(result => {
            this._notification.warning('Parent Offer Delete', "Deleted Successfully");
            this._isSpinning = false;
            this.getData();
        });
    };
}


