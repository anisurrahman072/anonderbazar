import { Component, ElementRef, OnInit, ViewChild } from '@angular/core';
import { FormBuilder, FormGroup, Validators } from '@angular/forms';
import { ActivatedRoute, Router } from '@angular/router';
import { NzNotificationService } from 'ng-zorro-antd';
import { UploadMetadata, FileHolder } from 'angular2-image-upload';
import { AuthService } from '../../../../services/auth.service';
import { PartService } from '../../../../services/part.service';
import { CategoryTypeService } from '../../../../services/category-type.service';
import { CategoryProductService } from '../../../../services/category-product.service';

@Component({
  selector: 'app-part-create',
  templateUrl: './part-create.component.html',
  styleUrls: ['./part-create.component.css']
})
export class PartCreateComponent implements OnInit {
  validateForm: FormGroup;
  ImageFile: File;
  @ViewChild('Image') Image;
  currentUser: any;
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
  categorySearchOptions: any;
  subcategorySearchOptions: any = {};
  typeSearchOptions: any;

  constructor(
    private router: Router,
    private route: ActivatedRoute,
    private _notification: NzNotificationService,
    private fb: FormBuilder,
    private authService: AuthService,
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
      image: ['']
    });
  }

  submitForm = ($event, value) => {
    $event.preventDefault();
    for (const key in this.validateForm.controls) {
      this.validateForm.controls[key].markAsDirty();
    }

    const formData: FormData = new FormData();
    formData.append('name', value.name);
    formData.append('type_id', value.type_id);
    formData.append('category_id', value.category_id);
    formData.append('details', value.details);

    if (value.subcategory_id) {
      formData.append('subcategory_id', value.subcategory_id);
    }

    if (this.ImageFile) {
      formData.append('hasImage', 'true');
      formData.append('image', this.ImageFile, this.ImageFile.name);
    } else {
      formData.append('hasImage', 'false');
    }
    this.partService.insert(formData).subscribe(result => {
      if (result.id) {
        this._notification.create(
          'success',
          'New product parts has been successfully added.',
          result.name
        );
        this.router.navigate(['/dashboard/part/details/', result.id]);
      }
    });
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

    this.categoryProductService.getAllCategory().subscribe(result => {
      this.categorySearchOptions = result;
    });
    this.categoryTypeService.getAll().subscribe(result => {
      this.typeSearchOptions = result;
    });
  }

  onUploadStateChanged(state: boolean) {}

  categorySearchChange($event) {}

  categoryChange($event) {
    const query = encodeURI($event);
    if (query !== 'null') {
      this.categoryProductService
        .getSubcategoryByCategoryId(query)
        .subscribe(result => {
          this.subcategorySearchOptions = result;
        });
    } else {
      this.subcategorySearchOptions = {};
    }
  }

  subcategorySearchChange($event) {}

  typeSearchChange($event: string) {}
}
