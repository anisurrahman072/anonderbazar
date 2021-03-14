import {Component, EventEmitter, Input, OnDestroy, OnInit, Output} from "@angular/core";
import {NzNotificationService} from "ng-zorro-antd";
import {FormBuilder, FormGroup} from "@angular/forms";
import {ProductService} from "../../../../../services/product.service";
import * as ___ from 'lodash';
import {CmsService} from "../../../../../services/cms.service";

@Component({
    selector: 'all-products-for-offer',
    templateUrl: './all-product-modal.component.html',
    styleUrls: ['./all-product-modal.component.css']
})
export class AllProductModalComponent implements OnInit, OnDestroy {

    @Input() cmsRow: any;
    @Output() onNewProductsAdded = new EventEmitter<boolean>();

    validateProductForm: FormGroup;

    allProducts: any = [];
    offerProductIds: any = [];
    selectedAllProductIds: any = [];
    allProductSelectAll: any = [false];

    allProductPage: number = 1;
    allProductLimit: number = 20;
    allProductTotal = 0;
    allProductNameSearch: string = '';

    _isSpinning: boolean = false;
    _submitting: boolean = false;

    constructor(
        private cmsService: CmsService,
        private _notification: NzNotificationService,
        private fb: FormBuilder,
        private productservice: ProductService
    ) {
    }

    ngOnDestroy(): void {
    }

    ngOnInit(): void {

        this.validateProductForm = this.fb.group({
            productChecked: ['', []],
        });

        if (this.cmsRow && this.cmsRow.data_value && this.cmsRow.data_value.length && Array.isArray(this.cmsRow.data_value[0].products)) {
            this.offerProductIds = this.cmsRow.data_value[0].products.filter(prod => prod);
        } else {
            this.offerProductIds = [];
        }

        this.getAllProducts(1);
    }

    getAllProducts(event: any) {

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

            }, err => {
                this._isSpinning = false;
            });

    }

    selectAllProducts($event: any) {
        const isChecked = !!$event;
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

        console.log($event);

        if ($event) {
            this.selectedAllProductIds[this.allProductPage - 1].push(value);
        } else {
            let findIndex = this.selectedAllProductIds[this.allProductPage - 1].findIndex((prodId) => {
                return prodId == value.id
            });
            if (findIndex !== -1) {
                this.selectedAllProductIds[this.allProductPage - 1].splice(findIndex, 1);
            }
        }
        console.log(this.selectedAllProductIds);
    }

    allProductNameChangeHandler(event: any) {
        this.allProductNameSearch = event;
        this.getAllProducts(1);
    }


    // Event method for submitting the product form
    submitForm = () => {

        let selectedProductIds = ___.flatten(this.selectedAllProductIds);
        if (selectedProductIds.length === 0) {
            return false;
        }

        this._submitting = true;
        this._isSpinning = true;

        if (this.cmsRow) {
            this.cmsRow.data_value[0].products = this.cmsRow.data_value[0].products.concat(selectedProductIds);
            this._isSpinning = true;
            this.cmsService.offerProductUpdate(this.cmsRow)
                .subscribe(result => {
                    this._notification.success('Offer Product(s) Added Successfully', "");
                    this._isSpinning = false;
                    this._submitting = false;
                    this.selectedAllProductIds = [];
                    this.allProducts = [];
                    this.offerProductIds = [];
                    this.onNewProductsAdded.emit(true);

                }, (err) => {
                    this._notification.error('Problem in adding new offer product(s)', "");
                    this._isSpinning = false;
                    this._submitting = false;
                });
        } else {
            this._isSpinning = false;
            this._submitting = false;
        }
    }
}
