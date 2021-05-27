import {Component, ElementRef, OnInit, ViewChild} from "@angular/core";
import {FormBuilder, FormGroup, Validators} from "@angular/forms";
import {ActivatedRoute, Router} from "@angular/router";
import {NzNotificationService} from "ng-zorro-antd";
import {UploadMetadata, FileHolder} from "angular2-image-upload";
import {WarehouseVariantService} from "../../../../services/warehouse-variant.service";
import {BrandService} from "../../../../services/brand.service";
import {VariantService} from "../../../../services/variant.service";
import {AuthService} from "../../../../services/auth.service";

@Component({
    selector: "app-warehousevariant-create",
    templateUrl: "./warehouse-variant-create.component.html",
    styleUrls: ["./warehouse-variant-create.component.css"]
})
export class WarehouseVariantCreateComponent implements OnInit {
    validateForm: FormGroup;
    variantSearchOptions: any = [];
    brandSearchOptions: any = [];
    type: any;
    _isSpinning: boolean = false;
    selectedVariant_id: any;
    ImageFile: File;
    @ViewChild("Image") Image;
    currentUser: any;

    constructor(
        private router: Router,
        private route: ActivatedRoute,
        private _notification: NzNotificationService,
        private fb: FormBuilder,
        private variantService: VariantService,
        private authService: AuthService,
        private warehouseVariantService: WarehouseVariantService,
        private brandService: BrandService
    ) {
        this.validateForm = this.fb.group({
            name: ["", [Validators.required]],
            variant_id: ["", [Validators.required]],
            quantity: ["0", []],
            unit_price: ["0.0", []],
            unit_name: ["", []],
            brand_id: ["", []],
            rack: ["", []],
            image: [null, []]
        });
    }

    submitForm = ($event, value) => {
        $event.preventDefault();
        for (const key in this.validateForm.controls) {
            this.validateForm.controls[key].markAsDirty();
        }

        let brand_id = null;
        if (value.brand_id) {
            brand_id = value.brand_id;
        }
        const formData: FormData = new FormData();

        formData.append("warehouse_id", this.currentUser.warehouse.id);
        formData.append("name", value.name);
        formData.append("variant_id", value.variant_id.id);
        if (brand_id) {
            formData.append("brand_id", brand_id);
        }
        formData.append("quantity", value.quantity ? value.quantity : "0");
        formData.append("unit_price", value.unit_price ? value.unit_price : "0");
        formData.append("unit_name", value.unit_name ? value.unit_name : "");
        formData.append("rack", value.rack ? value.rack : "");
        if (this.ImageFile) {
            formData.append("image", this.ImageFile, this.ImageFile.name);
            formData.append("hasImage", "true");
        } else {
            formData.append("hasImage", "false");
        }
        this._isSpinning = true;
        this.warehouseVariantService.insert(formData).subscribe(
            result => {
                if (result.id) {
                    this._notification.create(
                        "success",
                        "New Attribute variant has been successfully added.",
                        result.name
                    );

                    setTimeout(
                        () => {
                            this._isSpinning = false;
                            this.router.navigate([
                                "/dashboard/warehousevariant/details/",
                                result.id
                            ]);
                        },
                        this.ImageFile ? 2000 : 0
                    );
                }
            },
            error => {
                this._notification.create("error", "Failed", "Failed");
                this._isSpinning = false;
            }
        );
    };

    onRemoved(file: FileHolder) {
        this.ImageFile = null;
    }

    onBeforeUpload = (metadata: UploadMetadata) => {
        this.ImageFile = metadata.file;
        return metadata;
    };

    resetForm($event: MouseEvent) {
        $event.preventDefault();
        this.validateForm.reset();
        for (const key in this.validateForm.controls) {
            this.validateForm.controls[key].markAsPristine();
        }
    }

    getFormControl(name) {
        return this.validateForm.controls[name];
    }

    ngOnInit() {
        this.currentUser = this.authService.getCurrentUser();

        this.variantService.getAll().subscribe(result => {
            this.variantSearchOptions = result;
            this.variantSearchOptions.forEach(element => {
                if (element.type == 1) {
                    element.name = element.name + " (Price Variation: Yes)";
                } else {
                    element.name = element.name + " (Price Variation: No)";
                }
            });
        });

        this.brandService.getAll().subscribe(result => {
            this.brandSearchOptions = result;
        });
    }

}
