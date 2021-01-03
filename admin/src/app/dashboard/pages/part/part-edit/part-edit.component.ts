import { Component, OnDestroy, OnInit, ViewChild } from '@angular/core';
import { FormBuilder, FormGroup, Validators } from '@angular/forms';
import { ActivatedRoute, Router } from '@angular/router';
import { Subscription } from 'rxjs';
import { NzNotificationService } from 'ng-zorro-antd';
import { FileHolder, UploadMetadata } from 'angular2-image-upload';
import { PartService } from '../../../../services/part.service';
import { CategoryTypeService } from '../../../../services/category-type.service';
import { CategoryProductService } from '../../../../services/category-product.service';

import {environment} from "../../../../../environments/environment";

@Component({
  selector: 'app-part-edit',
  templateUrl: './part-edit.component.html',
  styleUrls: ['./part-edit.component.css']
})
export class PartEditComponent implements OnInit, OnDestroy {
  spinner: boolean = false;
  id: number;
  data: any;
  sub: Subscription;
  categorySearchOptions: any;
  subcategorySearchOptions: any = {};
  typeSearchOptions: any;
  ImageFileEdit: any[] = [];
  IMAGE_ENDPOINT = environment.IMAGE_ENDPOINT;
  ImageFile: any;

  category_id: any;
  subcategory_id: any;
  type_id: any;
  validateForm: FormGroup;
  imageEditMode: boolean = false;

  ckConfig = {
    uiColor: '#662d91',
    toolbarGroups: [
      { name: 'document', groups: ['mode', 'document', 'doctools'] },
      {
        name: 'editing',
        groups: ['find', 'selection', 'spellchecker', 'editing']
      },
      { name: 'forms', groups: ['forms'] }
    ],
    removeButtons: 'Source,Save,Templates,Find,Replace,Scayt,SelectAll'
  };

  submitForm = ($event, value) => {
    $event.preventDefault();
    this.spinner = true;
    for (const key in this.validateForm.controls) {
      this.validateForm.controls[key].markAsDirty();
    }
    const formData: FormData = new FormData();
    formData.append('name', value.name);
    formData.append('type_id', value.type_id);
    formData.append('category_id', value.category_id);
    formData.append('details', value.details);
    // formData.append('oldImage', this.ImageFile);
    formData.append('subcategory_id', value.subcategory_id);

    if (this.ImageFile) {
      
      formData.append('hasImage', 'true');
      formData.append('image', this.ImageFile, this.ImageFile.name);

    } else {
      formData.append('hasImage', 'false');
    }

    this.partService.update(this.id, formData).subscribe(
      result => {
        this._notification.create(
          'success',
          'Update successful',
          this.data.name
        );

        setTimeout(() => {
          this.spinner = false;
          this.router.navigate(['/dashboard/part/details/', this.id]);
        }, 2000);
      },
      err => {
        this.spinner = false;

        this._notification.create('error', 'error', 'Product part update failed');
      }
    );
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

  constructor(
    private router: Router,
    private route: ActivatedRoute,
    private _notification: NzNotificationService,
    private fb: FormBuilder,
    private categoryTypeService: CategoryTypeService,
    private categoryProductService: CategoryProductService,
    private partService: PartService
  ) {
    this.validateForm = this.fb.group({
      name: ['', [Validators.required]],
      type_id: ['', []],
      category_id: ['', [Validators.required]],
      subcategory_id: ['', []],
      details: ['', [Validators.required]],
      image: [null, []]
    });
  }

  ngOnInit() {
    this.sub = this.route.params.subscribe(params => {
      this.id = +params['id']; // (+) converts string 'id' to a number
      this.partService.getById(this.id).subscribe(result => {
        this.data = result;
        this.ImageFileEdit = [];
        this.validateForm.patchValue(this.data);
        if (this.data && this.data.category_id && this.data.category_id) {
          this.category_id = this.data.category_id.id;
        }
        if (this.data && this.data.subcategory_id && this.data.subcategory_id) {
          this.subcategory_id = this.data.subcategory_id.id;
        }
        if (this.data && this.data.type_id && this.data.type_id.id) {
          this.type_id = this.data.type_id.id;
        }
      });
    });

    this.categoryProductService.getAllCategory().subscribe(result => {
      this.categorySearchOptions = result;
    });
    this.categoryTypeService.getAll().subscribe(result => {
      this.typeSearchOptions = result;
    });
  }

  onRemoved(_file: FileHolder) {
    this.ImageFileEdit = null;
    console.log(this.ImageFileEdit);
    this.imageEditMode = false;
  }

  onBeforeUpload = (metadata: UploadMetadata) => {
    this.ImageFile = metadata.file;
    console.log(this.ImageFileEdit);
    return metadata;
  };

  ngOnDestroy(): void {
    this.sub ? this.sub.unsubscribe() : '';
  }

  categorySearchChange($event) { }

  categoryChange($event) {
    const query = encodeURI($event);
    if (query !== 'null') {
      this.categoryProductService
        .getSubcategoryByCategoryId(query)
        .subscribe(result => {
          this.subcategorySearchOptions = result;
          if (
            this.data &&
            this.data.subcategory_id &&
            this.data.subcategory_id
          ) {
            this.subcategory_id = this.data.subcategory_id.id;
          }
        });
    } else {
      this.subcategorySearchOptions = {};
    }
  }

  subcategorySearchChange($event) { }

  typeSearchChange($event) { }

  subcategoryChange($event) { }

  typeChange($event) { }

  imageEditModeOn() {
    this.imageEditMode = true;
  }
}
