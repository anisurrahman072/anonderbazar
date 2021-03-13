import {AfterViewInit, ChangeDetectorRef, Component, OnDestroy, OnInit, ViewChild} from '@angular/core';
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
    @ViewChild('allProductSelectAll') allProductSelectAllElem;

    homeOfferData: any = [];
    private offerProductIds: any = [];
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
    childOffers: any = [];
    alloffers: any = [];
    alloffers2: any = [];
    allProducts: any = [];
    allProduct2: any = [];
    storeProductIds: any = [];
    storeOfferIds: any = [];
    _displayData = [];
    products = [];
    offers = [];
    checked = 'true';

    allProductPage = 1;
    allProductLimit = 20;
    allProductTotal = 0;
    allProductNameSearch: string = '';
    private selectedAllProductIds: any = [];
    private allProductSelectAll: any = [];

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
    ngOnDestroy(): void {

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
        this.allProductSelectAllElem.nativeElement.checked = false;
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
        } else {
            this.offerProductIds = [];
        }
        console.log('getProduct', data);

        this._isSpinning = true;

        this.productservice.getByIdsWithJoin(this.offerProductIds)
            .subscribe(result => {
                this.products = result;
                this._isSpinning = false;
                this.getAllProducts(1);
            }, (error) => {
                this._isSpinning = false;
            });


    };

    selectAllProducts($event: any) {
        const isChecked = !!$event.target.checked;
        if (!isChecked) {
            this.selectedAllProductIds[this.allProductPage - 1] = [];
        }

        this.allProductSelectAll[this.allProductPage - 1] = isChecked;
        const len = this.allProducts.length;
        for (let i = 0; i < len; i++) {
            this.allProducts[i].checked = isChecked;
            if (isChecked) {
                const foundIndex = this.selectedAllProductIds[this.allProductPage - 1].findIndex((prodId) => {
                    return prodId == this.allProducts[i].id;
                });
                if (foundIndex === -1) {
                    this.selectedAllProductIds[this.allProductPage - 1].push(this.allProducts[i].id);
                }
            }
        }
    }

    // Method for refresh offer checkbox data in the offer modal
    _refreshStatus($event, value) {

        if ($event && $event.currentTarget.checked) {
            this.selectedAllProductIds[this.allProductPage - 1].push(value);
        } else {
            let findIndex = this.selectedAllProductIds[this.allProductPage - 1].findIndex((prodId) => {
                return prodId == value.id
            });
            if (findIndex !== -1) {
                this.selectedAllProductIds[this.allProductPage - 1].splice(findIndex, 1);
            }
        }
    }

    addNewProducts() {

        this.allProductPage = 1;
        this.selectedAllProductIds = [];
        this.allProductSelectAll = [];
        this.addNew = !this.addNew;
    }

    getAllProducts(event: any) {

        if (this.allProductPage != event || !(this.allProducts && this.allProducts.length > 0)) {
            if (event) {
                this.allProductPage = event;
            }
            this._isSpinning = true;
            this.productservice.getAllWithPagination(this.allProductPage, this.allProductLimit, this.offerProductIds, this.allProductNameSearch)
                .subscribe(result => {

                    console.log(' this.product service.get all ', result);

                    if (typeof result.data !== 'undefined') {
                        this.allProducts = result.data;
                        this.allProductTotal = result.total;
                        this.allProducts = result.data.map((item) => {
                            return {
                                ...item,
                                checked: false
                            }
                        });

                        const thisTotal = this.allProducts.length;

                        if (typeof this.selectedAllProductIds[this.allProductPage - 1] === 'undefined') {
                            this.selectedAllProductIds[this.allProductPage - 1] = [];
                        }
                        if (typeof this.allProductSelectAll[this.allProductPage - 1] === 'undefined') {
                            this.allProductSelectAll[this.allProductPage - 1] = false;
                        }

                        this.allProductSelectAllElem.nativeElement.checked = !!this.allProductSelectAll[this.allProductPage - 1];

                        if (this.selectedAllProductIds[this.allProductPage - 1].length) {
                            for (let index = 0; index < thisTotal; index++) {
                                const foundIndex = this.selectedAllProductIds[this.allProductPage - 1].findIndex((prodId) => {
                                    return prodId == this.allProducts[index].id;
                                });
                                this.allProducts[index].checked = foundIndex !== -1;
                            }
                        } else {
                            for (let index = 0; index < thisTotal; index++) {
                                this.allProducts[index].checked = false;
                            }
                        }
                    } else {
                        this.allProducts = [];
                        this.allProductTotal = 0;
                    }
                    this._isSpinning = false;
                    /*                    this.offerProductIds.forEach(element => {
                                            let findValue = this.allProduct2.indexOf(element);
                                            this.allProduct2.splice(findValue, 1);
                                        });

                                        result.forEach(element => {
                                            this.productservice.getById(element)
                                                .subscribe(result2 => {
                                                    this.allProducts.push(result2);
                                                });
                                        });*/

                }, err => {
                    this._isSpinning = false;
                });
        }

    }

    allProductNameChangeHandler(event: any) {
        this.allProductNameSearch = event;
        this.getAllProducts(1);
    }

    ngAfterViewInit() {


    }

    // Event method for submitting the offer form
    submitFormOffer = ($event, value) => {

        this.currentOffer.data_value[0].offers = this.currentOffer.data_value[0].offers.concat(this.storeOfferIds);
        this._isSpinning = true;
        this.cmsService.updateOffer(this.currentOffer)
            .subscribe(result => {
                this._notification.success('Offer Added', "Feature Title: ");
                this._isSpinning = false;
                this.isOfferVisible = false;
                this.storeOfferIds = [];
                this.alloffers = [];
                this.offers = [];
                this.alloffers2 = [];
            }, (er) => {
                this._isSpinning = false;
            });


    }

    // Event method for submitting the product form
    submitForm = ($event, value) => {
        this.currentProduct.data_value[0].products = this.currentProduct.data_value[0].products.concat(this.storeProductIds);
        this._isSpinning = true;
        this.cmsService.offerProductUpdate(this.currentProduct)
            .subscribe(result => {
                this._notification.success('Offer Added', "Feature Title: ");
                this._isSpinning = false;
                this.isProductVisible = false;
                this.storeProductIds = [];
                this.allProducts = [];
                this.offerProductIds = [];
                this.allProduct2 = [];
                console.log(this.currentProduct);
            }, (err) => {
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
            this.allProduct2 = [];
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
            this.alloffers2 = [];
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
        }, (err) => {
            this._isSpinning = false;
        });
    };

}


