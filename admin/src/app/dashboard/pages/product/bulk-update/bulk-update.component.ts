import {Component, ElementRef, OnInit, ViewChild} from '@angular/core';
import {CategoryProductService} from "../../../../services/category-product.service";
import {FormBuilder, FormGroup, Validators} from "@angular/forms";
import {ProductService} from "../../../../services/product.service";
import {ExcelService} from "../../../../services/excel.service";
import {AuthService} from "../../../../services/auth.service";
import {NzNotificationService} from "ng-zorro-antd";
import {Subscription} from "rxjs";
import {WarehouseService} from "../../../../services/warehouse.service";
import * as ___ from 'lodash';

class ProductBulk {
    category: string = "";
    warehouse_id: string = "";
    name: string = "";
    code: string = "";
    product_details: string = "";
    brand_id: string = "";
    price: number = 0;
    promo_price: number = 0;
    vendor_price: number = 0;
    quantity: number = 0;
    weight: number = 0;
    frontend_position: number = 111;
    offline_payment: number = 0;
    free_shipping: number = 0;
    partially_payable: number = 0;
    disable_cash_on_delivery: number = 0;
    tag: string = "";
    image: string = "";
    image1: string = "";
    image2: string = "";
    image3: string = "";
    image4: string = "";
    image5: string = "";
    variant1_id: number = 0;
    variant1: string = "";
    variant1_info: string = "";
    variant2_id: number = 0;
    variant2: string = "";
    variant2_info: string = "";
    variant3_id: number = 0;
    variant3: string = "";
    variant3_info: string = "";
    variant4_id: number = 0;
    variant4: string = "";
    variant4_info: string = "";
    variant5_id: number = 0;
    variant5: string = "";
    variant5_info: string = "";
    variant6_id: number = 0;
    variant6: string = "";
    variant6_info: string = "";
    allVariants = [];
}

@Component({
    selector: 'app-bulk-update',
    templateUrl: './bulk-update.component.html',
    styleUrls: ['./bulk-update.component.css']
})
export class BulkUpdateComponent implements OnInit {
    validateForm: FormGroup;
    productsType = null;
    productCategories = null;
    productSubCategory = null;
    _isSpinning: boolean = false;
    subcategoryId = null;
    type_id = null;
    category_id = null;
    importProducts: ProductBulk[] = [];
    total: number = 0;
    currentUser: any;
    isAdminUser: boolean = false;

    @ViewChild('uploadFileInputField')
    fileInputVariable: ElementRef;
    private catSub: Subscription;
    private subCatSub: Subscription;
    private excelSub: Subscription;
    private typeSub: Subscription;
    private updateSub: Subscription;

    vendor_id: any = null;
    warehouses: any = null;

    constructor(private categoryProductService: CategoryProductService,
                private fb: FormBuilder,
                private productService: ProductService,
                private excelSrv: ExcelService,
                private authService: AuthService,
                private _notification: NzNotificationService,
                private warehouseService: WarehouseService) {
        this.validateForm = this.fb.group({
            warehouse_id: ['', []],
            type_id: ['', []],
            category: ['', []],
            subcategory: ['', []]
        });
    }

    ngOnInit() {
        this.currentUser = this.authService.getCurrentUser();

        if (this.currentUser.group_id === 'admin') {
            this.isAdminUser = true;
        }
        this.typeSub = this.categoryProductService.getAllCategory().subscribe((result: any) => {
            this.productsType = result;
        });

        this.warehouseService.getAll(1, 20)
            .subscribe(result => {
                this.warehouses = result;
            }, error => {
                console.log("Error occurred.", error);
            })

    }

    ngOnDestroy(): void {
        this.catSub ? this.catSub.unsubscribe() : '';
        this.subCatSub ? this.subCatSub.unsubscribe() : '';
        this.excelSub ? this.excelSub.unsubscribe() : '';
        this.typeSub ? this.typeSub.unsubscribe() : '';
        this.updateSub ? this.updateSub.unsubscribe() : '';
    }

    getFormControl(name) {
        return this.validateForm.controls[name];
    }

    typeIdChange($event) {
        this.productCategories = [];
        this.category_id = null;
        this.productSubCategory = [];
        this.subcategoryId = null;
        const query = encodeURI($event);
        if (query !== 'null') {
            this.catSub = this.categoryProductService
                .getSubcategoryByCategoryId(query)
                .subscribe(result => {
                    this.productCategories = result;
                });
        }

    }

    onCategoryChange($event) {
        this.productSubCategory = [];
        this.subcategoryId = null;
        const query = encodeURI($event);
        if (query !== 'null') {
            this.subCatSub = this.categoryProductService
                .getSubcategoryByCategoryId(query)
                .subscribe(result => {
                    this.productSubCategory = result;
                });
        }
    }

    submitForm($event: any, value: any) {
        $event.preventDefault();
        this.downloadExcel(value);
    }

    downloadExcel(value) {
        this._isSpinning = true;
        return this.excelSub = this.productService.productExcel(value).subscribe((result: any) => {
            this._isSpinning = false;
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
            link.download = "product_update_" + Date.now() + ".xlsx";
            // this is necessary as link.click() does not work on the latest firefox
            link.dispatchEvent(new MouseEvent('click', {bubbles: true, cancelable: true, view: window}));

            setTimeout(() => {
                // For Firefox it is necessary to delay revoking the ObjectURL
                window.URL.revokeObjectURL(data)
                link.remove();
            }, 100);
            this._notification.create('success', 'Operation Completed!', 'Successfully fetched all data to Excel file.');
        }, error => {
            this._isSpinning = false;
            this._notification.create('error', 'Operation Failed', 'Something Went wrong!');
        });
    }

    onFileChange(evt: any) {
        let target: DataTransfer = <DataTransfer>(evt.target);
        if (target.files.length !== 1) throw new Error('Cannot use multiple files');

        const reader: FileReader = new FileReader();
        reader.onload = (e: any) => {

            const bstr: string = e.target.result;
            const data = <any[]>this.excelSrv.importFromFile(bstr);

            const productOb = new ProductBulk();

            if (this.currentUser.group_id === 'owner') {
                delete productOb.warehouse_id;
                delete productOb.frontend_position;
                delete productOb.offline_payment;
                delete productOb.free_shipping;
                delete productOb.partially_payable;
                delete productOb.disable_cash_on_delivery;
            }
            const header: string[] = Object.getOwnPropertyNames(productOb);
            console.log('header', header);

            const importedData = data.slice(1);
            console.log('importedData', importedData);

            this.importProducts = importedData.map(arr => {
                const obj = {};
                for (let i = 0; i < header.length; i++) {
                    const k = header[i];
                    obj[k] = arr[i];
                }
                if (this.currentUser.group_id === 'owner') {
                    obj['warehouse_id'] = this.currentUser.warehouse.id;
                }
                return <ProductBulk>obj;
            });

            this.importProducts = this.importProducts.filter(product => {
                let flag = false;
                for (let key in product) {
                    if (product[key] && key !== 'warehouse_id') {
                        flag = true;
                    }
                }
                return flag;
            });

            let productsCount = this.importProducts.length;

            for (let index = 0; index < productsCount; index++) {
                this.importProducts[index].allVariants = [];
                const product = this.importProducts[index];
                if (this.importProducts[index].variant1 && this.importProducts[index].variant1_info) {
                    let variantInfo = this.importProducts[index].variant1_info;
                    if (___.isNumber(variantInfo) || variantInfo.split('|').length !== 2 || parseInt(variantInfo.split('|')[0])) {
                        this._notification.create('error', 'Variant Information not correctly provided', "Format =>> Variant label | Additional Price");
                        this.fileInputVariable.nativeElement.value = "";
                        this.importProducts = [];
                        return false;
                    }
                    this.importProducts[index].allVariants.push(this.createVariant(product.variant1_id, product.variant1, product.variant1_info));
                }
                if (this.importProducts[index].variant2 && this.importProducts[index].variant2_info) {
                    let variantInfo = this.importProducts[index].variant2_info;
                    if (___.isNumber(variantInfo) || variantInfo.split('|').length !== 2 || parseInt(variantInfo.split('|')[0])) {
                        this._notification.create('error', 'Variant Information not correctly provided', "Format =>> Variant label | Additional Price");
                        this.fileInputVariable.nativeElement.value = "";
                        this.importProducts = [];
                        return false;
                    }
                    this.importProducts[index].allVariants.push(this.createVariant(product.variant2_id, product.variant2, product.variant2_info));
                }
                if (this.importProducts[index].variant3 && this.importProducts[index].variant3_info) {
                    let variantInfo = this.importProducts[index].variant3_info;
                    if (___.isNumber(variantInfo) || variantInfo.split('|').length !== 2 || parseInt(variantInfo.split('|')[0])) {
                        this._notification.create('error', 'Variant Information not correctly provided', "Format =>> Variant label | Additional Price");
                        this.fileInputVariable.nativeElement.value = "";
                        this.importProducts = [];
                        return false;
                    }
                    this.importProducts[index].allVariants.push(this.createVariant(product.variant3_id, product.variant3, product.variant3_info));
                }
                if (this.importProducts[index].variant4 && this.importProducts[index].variant4_info) {
                    let variantInfo = this.importProducts[index].variant4_info;
                    if (___.isNumber(variantInfo) || variantInfo.split('|').length !== 2 || parseInt(variantInfo.split('|')[0])) {
                        this._notification.create('error', 'Variant Information not correctly provided', "Format =>> Variant label | Additional Price");
                        this.fileInputVariable.nativeElement.value = "";
                        this.importProducts = [];
                        return false;
                    }
                    this.importProducts[index].allVariants.push(this.createVariant(product.variant4_id, product.variant4, product.variant4_info));
                }
                if (this.importProducts[index].variant5 && this.importProducts[index].variant5_info) {
                    let variantInfo = this.importProducts[index].variant5_info;
                    if (___.isNumber(variantInfo) || variantInfo.split('|').length !== 2 || parseInt(variantInfo.split('|')[0])) {
                        this._notification.create('error', 'Variant Information not correctly provided', "Format =>> Variant label | Additional Price");
                        this.fileInputVariable.nativeElement.value = "";
                        this.importProducts = [];
                        return false;
                    }
                    this.importProducts[index].allVariants.push(this.createVariant(product.variant5_id, product.variant5, product.variant5_info));
                }
                if (this.importProducts[index].variant6 && this.importProducts[index].variant6_info) {
                    let variantInfo = this.importProducts[index].variant6_info;
                    if (___.isNumber(variantInfo) || variantInfo.split('|').length !== 2 || parseInt(variantInfo.split('|')[0])) {
                        this._notification.create('error', 'Variant Information not correctly provided', "Format =>> Variant label | Additional Price");
                        this.fileInputVariable.nativeElement.value = "";
                        this.importProducts = [];
                        return false;
                    }
                    this.importProducts[index].allVariants.push(this.createVariant(product.variant6_id, product.variant6, product.variant6_info));
                }
            }

            console.log('this.importProducts', this.importProducts);

            this.total = this.importProducts.length;
        };
        reader.readAsBinaryString(target.files[0]);
    }

    createVariant(id, variant, variantInfo) {
        return {
            id: id ? parseInt(id) : null,
            variant_id: parseInt(variant.split(',')[0]),
            warehouses_variant_id: parseInt(variant.split(',')[1]),
            name: variantInfo.split('|')[0],
            quantity: parseFloat(variantInfo.split('|')[1]),
        }
    }

    saveImportedProducts() {
        this.fileInputVariable.nativeElement.value = "";
        this._isSpinning = true;
        if (this.importProducts && this.importProducts.length > 0) {
            return this.updateSub = this.productService.submitDataForBulkUpdate(this.importProducts).subscribe((result: any) => {
                this._isSpinning = false;
                if (result.success) {
                    this._notification.create('success', 'Operation Completed', result.message);
                } else {
                    this._notification.create('error', 'Operation Failed', result.message);
                }

            }, (error) => {
                this._isSpinning = false;
                console.log(error.error.message);
                this._notification.create('error', 'Operation Failed', error.error.message);
            });
        } else {
            this._isSpinning = false;
            this._notification.info('No products found!', 'Operation Failed!');
        }
    }
}
