import {Component, ElementRef, OnInit, ViewChild} from "@angular/core";
import {ActivatedRoute, Router} from "@angular/router";
import {Subscription} from "rxjs";
import {NzNotificationService} from "ng-zorro-antd";
import {ExcelService} from "../../../../services/excel.service";
import {AuthService} from "../../../../services/auth.service";
import {UIService} from "../../../../services/ui/ui.service";
import {ProductService} from "../../../../services/product.service";

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
    image: string = "";
    image1: string = "";
    image2: string = "";
    image3: string = "";
    image4: string = "";
    image5: string = "";
    status: string = "0";
    created_by: string = "0";
}

@Component({
    selector: 'app-product-bulk-upload',
    templateUrl: './bulk-upload.component.html',
    styleUrls: ['./bulk-upload.component.css']
})
export class BulkUploadComponent implements OnInit {

    private currentWarehouseSubscriprtion: Subscription;
    private currentWarehouseId: string = '';
    importProducts: ProductBulk[] = [];
    typeSearchOptions: any[] = [];
    status: any = 1;
    currentUser: any;
    _isSpinning: boolean = false;

    limit: number = 20;
    page: number = 1;
    total: number = 0;

    brandSearchOptions: any;

    @ViewChild('uploadFileInputField')
    fileInputVariable: ElementRef;

    isLoading: boolean = false;

    isAdminUser: boolean = false;
    constructor(
        private router: Router,
        private route: ActivatedRoute,
        private excelSrv: ExcelService,
        private productService: ProductService,
        private authService: AuthService,
        private uiService: UIService,
        private _notification: NzNotificationService,
    ) {

        this.router.routeReuseStrategy.shouldReuseRoute = () => false;
    }

    ngOnInit(): void {
        this.route.queryParams.filter(params => params.status).subscribe(params => {
            this.status = params.status;
        });

        this.currentUser = this.authService.getCurrentUser();

        if (this.currentUser.group_id === 'admin') {
            this.isAdminUser = true;
        }
        this.currentWarehouseSubscriprtion = this.uiService.currentSelectedWarehouseInfo.subscribe(
            warehouseId => {
                this.currentWarehouseId = warehouseId || '';
                console.log('this.currentWarehouseId', this.currentWarehouseId)
            }
        );
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
                    if (k === 'status') {
                        obj[k] = this.status;
                    } else if (k === 'created_by') {
                        obj[k] = this.currentUser.id;
                    } else {
                        obj[k] = arr[i];
                    }
                }
                if (this.currentUser.group_id === 'owner') {
                    obj['warehouse_id'] = this.currentUser.warehouse.id;
                }
                return <ProductBulk>obj;
            });

            console.log('this.importProducts', this.importProducts)
            this.total = this.importProducts.length;
        };
        reader.readAsBinaryString(target.files[0]);

    }

    saveImportedProducts(isApproved: number = 0) {

        this._isSpinning = true;
        console.log('this.importProducts', this.importProducts)
        this.fileInputVariable.nativeElement.value = "";
        return this.productService.submitDataForBulkUpload(this.importProducts, this.currentUser.id, isApproved).subscribe((result: any) => {
            console.log('result', result)
            this._isSpinning = false;
            if (result.success) {
                this._notification.create('success', 'Operation Completed', result.message);
            } else {
                this._notification.create('error', 'Operation Failed', result.message);
            }

        }, (error) => {
            console.log('error', error)
            this._isSpinning = false;
            this._notification.create('error', 'Operation Failed', 'Something wrong happened!');
        });
    }

    downloadExcel() {
        this.isLoading = true;
        return this.productService.getGeneratedExcelFile(this.currentUser.id).subscribe((result: any) => {
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
            link.download = "product_upload_" + Date.now() + ".xlsx";
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
}
