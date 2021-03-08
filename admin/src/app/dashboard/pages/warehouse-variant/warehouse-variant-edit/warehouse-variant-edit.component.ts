import { Component, OnDestroy, OnInit, ViewChild } from '@angular/core';
import {
  FormBuilder,
  FormGroup,
  Validators
} from '@angular/forms';
import { ActivatedRoute, Router } from '@angular/router';
import { Subscription } from 'rxjs';
import { NzNotificationService } from 'ng-zorro-antd';
import { FileHolder, UploadMetadata } from 'angular2-image-upload';
import { WarehouseVariantService } from '../../../../services/warehouse-variant.service';
import { BrandService } from '../../../../services/brand.service';
import { VariantService } from '../../../../services/variant.service';
import {environment} from "../../../../../environments/environment";

@Component({
  selector: 'app-warehouse-variant-edit',
  templateUrl: './warehouse-variant-edit.component.html',
  styleUrls: ['./warehouse-variant-edit.component.css']
})
export class WarehouseVariantEditComponent implements OnInit, OnDestroy {
  validateForm: FormGroup;
  variantSearchOptions: any = [];
    selectedVariant_id: any = [];
  brandSearchOptions: any = [];
  _isSpinning: boolean = false;
  ImageFileEdit: any[] = [];
    IMAGE_ENDPOINT = environment.IMAGE_ENDPOINT;
    ImageFile: File;
  @ViewChild('Image') Image;
  sub: Subscription;
  id: number;
  data: any | undefined;

  constructor(
    private router: Router,
    private route: ActivatedRoute,
    private _notification: NzNotificationService,
    private fb: FormBuilder,
    private variantService: VariantService,
    private warehouseVariantService: WarehouseVariantService,
    private brandService: BrandService
  ) {
    this.validateForm = this.fb.group({
      name: ['', [Validators.required]],
      variant_id: ['', [Validators.required]],
      quantity: ['', []],
      unit_price: ['', []],
      unit_name: ['', []],
      brand_id: ['', []],
      rack: ['', []],
      image: [null, []]
    });
  }

  submitForm = ($event, value) => {
    $event.preventDefault();
    for (const key in this.validateForm.controls) {
      this.validateForm.controls[key].markAsDirty();
    }

    const formData: FormData = new FormData();
    formData.append('name', value.name);
    formData.append('variant_id', value.variant_id.id);
    formData.append('brand_id', value.brand_id ? value.brand_id.id : '0');
    formData.append("quantity", value.quantity ? value.quantity : "0");
    formData.append("unit_price", value.unit_price? value.unit_price : "0");
    formData.append("unit_name", value.unit_name? value.unit_name : "");
    formData.append("rack", value.rack? value.rack : "");
    if (this.ImageFile) {
      formData.append('hasImage', 'true');
      formData.append('image', this.ImageFile, this.ImageFile.name);
    } else {
      formData.append('hasImage', 'false');
    }
    this._isSpinning = true;
    this.warehouseVariantService.update(this.id, formData).subscribe(
      result => {
        if (result) {
          this._notification.create('success', 'Update successful', this.data.name);

          setTimeout(() => {
            this._isSpinning = false;
            this.router.navigate([
              '/dashboard/warehousevariant/details/',
              this.id
            ]);
          }, this.ImageFile ? 2000 : 0);
        }
      },
      error => {
        this._isSpinning = false;
        this._notification.create('error', 'failed', 'Update failed');
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
    this.variantService.getAll().subscribe(result => {
      result.forEach(element => {
        if (element.type == 1) {
          element.name = element.name + " (Price Variation: Yes)"
        } else {
          element.name = element.name + " (Price Variation: No)"
        }

      });
      this.variantSearchOptions = result;
    });

    this.brandService.getAll().subscribe(result => {
      this.brandSearchOptions = result;
    });

    this.sub = this.route.params.subscribe(params => {
      this.id = +params['id']; // (+) converts string 'id' to a number
      this.warehouseVariantService.getById(this.id).subscribe(result => {
        this.data = result;

        this.ImageFileEdit = [];
        this.validateForm.patchValue(this.data);
        if (this.data && this.data.variant_id) {
          this.validateForm.controls.variant_id.patchValue(this.data.variant_id.id);
          this.selectedVariant_id= this.data.variant_id;
        }
        if (this.data && this.data.brand_id) {
          this.validateForm.controls.brand_id.patchValue(this.data.brand_id.id);
        }
        if (this.data && this.data.image) {
          this.ImageFileEdit.push(this.IMAGE_ENDPOINT + this.data.image);
      }
      });
    });
  }

  ngOnDestroy(): void {
    this.sub ? this.sub.unsubscribe() : '';
  }

}
