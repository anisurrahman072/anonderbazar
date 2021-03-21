import {Component, ElementRef, OnInit, ViewChild} from '@angular/core';
import {CategoryProductService} from "../../../../services/category-product.service";
import {FormBuilder, FormGroup, Validators} from "@angular/forms";
import {ProductService} from "../../../../services/product.service";
import {ExcelService} from "../../../../services/excel.service";
import {AuthService} from "../../../../services/auth.service";
import {NzNotificationService} from "ng-zorro-antd";
import {Subscription} from "rxjs";

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
    tag: string = "";
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

  constructor(private categoryProductService: CategoryProductService,
              private fb: FormBuilder,
              private productService: ProductService,
              private excelSrv: ExcelService,
              private authService: AuthService,
              private _notification: NzNotificationService,) {
      this.validateForm = this.fb.group({
          type_id: ['', [Validators.required]],
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

    typeIdChange($event){
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
        const target: DataTransfer = <DataTransfer>(evt.target);
        if (target.files.length !== 1) throw new Error('Cannot use multiple files');

        const reader: FileReader = new FileReader();
        reader.onload = (e: any) => {

            const bstr: string = e.target.result;
            const data = <any[]>this.excelSrv.importFromFile(bstr);

            const productOb = new ProductBulk();

            if (this.currentUser.group_id === 'owner') {
                delete productOb.warehouse_id;
            }
            const header: string[] = Object.getOwnPropertyNames(productOb);
            console.log('header', header);

            const importedData = data.slice(1);
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
                for(let key in product){
                    if(product[key] && key !== 'warehouse_id'){
                        flag = true;
                    }
                }
                return flag;
            })
            console.log('this.importProducts', this.importProducts)
            this.total = this.importProducts.length;
        };
        reader.readAsBinaryString(target.files[0]);
    }

    saveImportedProducts() {
        this.fileInputVariable.nativeElement.value = "";
        this._isSpinning = true;
        return this.updateSub = this.productService.submitDataForBulkUpdate(this.importProducts).subscribe((result: any) => {
            this._isSpinning = false;
            if (result.success) {
                this._notification.create('success', 'Operation Completed', result.message);
            } else {
                this._notification.create('error', 'Operation Failed', result.message);
            }

        }, (error) => {
            this._isSpinning = false;
            this._notification.create('error', 'Operation Failed', 'Something wrong happened!');
        });
    }
}
