import {Component, OnInit} from "@angular/core";
import {ActivatedRoute, Router} from "@angular/router";
import {ExcelService} from "../../../../services/excel.service";
import {AuthService} from "../../../../services/auth.service";
import {BrandService} from "../../../../services/brand.service";
import {CategoryProductService} from "../../../../services/category-product.service";
import {UIService} from "../../../../services/ui/ui.service";
import {Subscription} from "rxjs";

class ProductBulk {
    name: string = "";
    code: string = "";
    price: number = 0;
    vendor_price: number = 0;
    min_unit: number = 0;
    quantity: number = 0;
    alert_quantity: number = 0;
    weight: number = 0;
    tag: string = "";
    product_details: string = "";
    approval_status: string = "2";
    brand_id: string = "0";
    type_id: string = "0";
    category_id: string = "0";
    subcategory_id: string = "0";
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

    constructor(
        private router: Router,
        private route: ActivatedRoute,
        private uiService: UIService,
        private excelSrv: ExcelService,
        private categoryProductService: CategoryProductService,
        private authService: AuthService,
        private brandService: BrandService
    ) {

        this.router.routeReuseStrategy.shouldReuseRoute = () => false;
    }

    ngOnInit(): void {
        this.route.queryParams.filter(params => params.status).subscribe(params => {
            this.status = params.status;
        });

        this.currentUser = this.authService.getCurrentUser();
        this.currentWarehouseSubscriprtion = this.uiService.currentSelectedWarehouseInfo.subscribe(
            warehouseId => {
                this.currentWarehouseId = warehouseId || '';
            }
        );

        this.categoryProductService.getAllCategory().subscribe((result: any) => {
            this.typeSearchOptions = result;
        });

        this.brandService.getAll().subscribe((result: any) => {
            this.brandSearchOptions = result;
        });
    }

    typeIdChange(event, code){
        const selectedVal = encodeURI(event);
        const foundIndex = this.importProducts.findIndex((prod) => {
            return prod.code === code;
        })
        if (foundIndex !== -1) {
            this.importProducts[foundIndex].type_id = selectedVal
        }
    }

    brandIdChange(event, code) {
        const selectedVal = encodeURI(event);
        const foundIndex = this.importProducts.findIndex((prod) => {
            return prod.code === code;
        })
        if (foundIndex !== -1) {
            this.importProducts[foundIndex].brand_id = selectedVal
        }
    }

    approvalStatusChange(event, code) {
        const foundIndex = this.importProducts.findIndex((prod) => {
            return prod.code === code;
        })
        if (foundIndex !== -1) {
            this.importProducts[foundIndex].approval_status = event
        }
    }

    onFileChange(evt: any) {
        const target: DataTransfer = <DataTransfer>(evt.target);
        if (target.files.length !== 1) throw new Error('Cannot use multiple files');

        const reader: FileReader = new FileReader();
        reader.onload = (e: any) => {

            const bstr: string = e.target.result;
            const data = <any[]>this.excelSrv.importFromFile(bstr);

            const header: string[] = Object.getOwnPropertyNames(new ProductBulk());
            const importedData = data.slice(1);
            console.log('importFromFile', header, data, importedData)
            this.importProducts = importedData.map(arr => {
                const obj = {};
                for (let i = 0; i < header.length; i++) {
                    const k = header[i];
                    if (k === 'approval_status') {
                        obj[k] = "2";
                    } else {
                        obj[k] = arr[i];
                    }

                }
                console.log(obj)
                return <ProductBulk>obj;
            })
            console.log('this.importProducts', this.importProducts)
            this.total = this.importProducts.length;
        };
        reader.readAsBinaryString(target.files[0]);

    }
    saveImportedProducts(){
        console.log('this.importProducts', this.importProducts)
    }
}
