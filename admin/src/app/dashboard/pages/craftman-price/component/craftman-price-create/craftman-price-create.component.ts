import { UIService } from '../../../../../services/ui/ui.service';
import { Subscription } from 'rxjs';
import { Component, EventEmitter, Input, OnInit, Output, ViewChild } from '@angular/core';

import { CraftmanPriceService } from '../../../../../services/craftman-price.service';
import { PartService } from '../../../../../services/part.service';
import { AuthService } from '../../../../../services/auth.service';
import { DesignCategoryService } from '../../../../../services/design-category.service';
import { DesignService } from '../../../../../services/design.service';
import { GenreService } from '../../../../../services/genre.service';
import { CategoryTypeService } from '../../../../../services/category-type.service';
import { CategoryProductService } from '../../../../../services/category-product.service';
import { FormGroup, FormBuilder, Validators } from '@angular/forms';
import { CraftsmanService } from '../../../../../services/craftsman.service';
import { Router, ActivatedRoute } from '@angular/router';
import { NzNotificationService } from 'ng-zorro-antd';
import { FileHolder, UploadMetadata } from 'angular2-image-upload';
import {environment} from "../../../../../../environments/environment";

@Component({
  selector: 'app-craftman-price-create',
  templateUrl: './craftman-price-create.component.html',
  styleUrls: ['./craftman-price-create.component.css']
})
export class CraftmanPriceCreateComponent implements OnInit {

  validateForm: FormGroup;
  _isSpinning: boolean = false;
  ImageFile: File[] = [];
  genreSearchValue: string = '';
  genreSearchOptions: any[];
  designCategorySearchOptions: any[];
  designSubcategorySearchOptions: any = [];
  tempEditObject: any = {};
  designSearchOptions: any = {};
  typeSearchOptions: any;
  categorySearchOptions: any[];
  partsSearchOptions: any = [];
  subcategorySearchOptions: any = [];
  partSearchOptions: any = {};
  designs: any = [];
  IMAGE_ENDPOINT = environment.IMAGE_ENDPOINT;
  selectedIndex: any;
  craftmanSearchoptions: any[];
  private currentWarehouseSubscriprtion: Subscription;
  private currentWarehouseId: any;


  @ViewChild('Image') Image;
  currentUser: any;
  design_id: any;


  constructor(private router: Router,
    private route: ActivatedRoute,
    private _notification: NzNotificationService,
    private fb: FormBuilder,
    private authService: AuthService,
    private craftmanService: CraftsmanService,
    private genreService: GenreService,
    private designService: DesignService,
    private designCategoryService: DesignCategoryService,
    private categoryTypeService: CategoryTypeService,
    private categoryProductService: CategoryProductService,
    private craftsmanService: CraftsmanService,
    private craftmanpriceService: CraftmanPriceService,
    private uiService: UIService,
    private partService: PartService) {
    this.validateForm = this.fb.group({
      craftman_id: ['', [Validators.required]],
      genre_id: ['', [Validators.required]],
      design_category_id: ['', [Validators.required]],
      design_subcategory_id: ['', [Validators.required]],
      category_id: ['', [Validators.required]],
      subcategory_id: ['', [Validators.required]],
      part_id: ['', [Validators.required]],
      type_id: ['', [Validators.required]],
      price: ['', [Validators.required]],
      time: ['', [Validators.required]],
      comment: ['']

    });
  }
  //Event method for submitting the form
  submitForm = ($event, value) => {
    $event.preventDefault();
    for (const key in this.validateForm.controls) {
      this.validateForm.controls[key].markAsDirty();
    } 

    const formData: FormData = new FormData();

    formData.append('genre_id', value.genre_id);
    formData.append('design_category_id', value.design_category_id);
    formData.append('design_subcategory_id', value.design_subcategory_id);
    formData.append('design_id', this.design_id);

    formData.append('type_id', value.type_id);
    formData.append('category_id', value.category_id);
    formData.append('subcategory_id', value.subcategory_id);
    formData.append('part_id', value.part_id);

    formData.append('price', value.price);
    formData.append('time', value.time);

    formData.append('comment', value.comment);
    formData.append('warehouse_id', this.currentWarehouseId);
    formData.append('craftman_id', value.craftman_id);

    this.craftmanpriceService.insert(formData)
      .subscribe(result => {
        if (result.id) { 
          this._notification.create('success', 'New Brand has been successfully added.', result.name);
          this.router.navigate(['/dashboard/craftsmanprice/details/', result.id]);
        }
      }, (error) => {

      });

  }
  //Event method for removing picture
  onRemoved(_file: FileHolder) {
    this.ImageFile = [];
  }
  //Event method for storing imgae in variable
  onBeforeUpload = (metadata: UploadMetadata) => {
    try {
      this.ImageFile[0] = metadata.file;
      return metadata;

    } catch (error) { 
    }

  }
  //Event method for resetting the form
  resetForm($event: MouseEvent) {
    $event.preventDefault();
    this.validateForm.reset();
    for (const key in this.validateForm.controls) {
      this.validateForm.controls[key].markAsPristine();
    }
  }
  //Event method for setting up form in validation
  getFormControl(name) {
    return this.validateForm.controls[name];
  }
  // init the component
  ngOnInit() {
    this.currentUser = this.authService.getCurrentUser();
    this.genreService.getAll().subscribe((result: any) => {
      this.genreSearchOptions = result;
    });

    this.currentWarehouseSubscriprtion = this.uiService.currentSelectedWarehouseInfo.subscribe(
      warehouseId => { 
        this.currentWarehouseId = warehouseId || '';
        this.getAllCraftsmanSearchData();
      }
    );

    this.designCategoryService.getAllDesignCategory().subscribe(result => {
      this.designCategorySearchOptions = result;
    });
    this.categoryProductService.getAllCategory().subscribe((result: any) => {
      this.categorySearchOptions = result;
    });
    this.categoryTypeService.getAll().subscribe(result => {
      this.typeSearchOptions = result;
    });
    this.partService.getAll().subscribe(result => {
      this.partsSearchOptions = result;
    });
  }
  getAllCraftsmanSearchData() {
    this.craftsmanService
      .getAllCraftsmanByWarehouseId(this.currentWarehouseId)
      .subscribe((result: any) => {
        this.craftmanSearchoptions = result.data;
      });
  }
  ngOnDestroy(): void {
    this.currentWarehouseSubscriprtion
      ? this.currentWarehouseSubscriprtion.unsubscribe()
      : '';
  }
  crafmanChange($event: string) { 
  }
  categoryIdChange($event) { 
    const query = encodeURI($event);


    if (query !== 'null') {
      this.categoryProductService
        .getSubcategoryByCategoryId(query)
        .subscribe(result => {
          this.subcategorySearchOptions = result;
        });
    }
  }
  subcategorySearchChange($event) {
    this.tempEditObject.part_id = null;
    const query = encodeURI($event);
    if (query !== 'null') {
      this.partService.getPartBySubcategoryId(query).subscribe(result => {
        this.partSearchOptions = result;
      });
    } else {
      this.partSearchOptions = {};
    }
  }
  categoryIdSearchChange($event) { }
  subcategoryIdSearchChange($event) { }

  genreSearchChange($event) { 

    this.tempEditObject.design_id = null;
    const query = encodeURI($event);
    if (this.validateForm.get("genre_id").value !== 'null') {
      this.designService.getDesignByGenreId(query).subscribe(result => {
        this.designSearchOptions = result;
      });
      this.designService.getDesigns(this.validateForm.get("genre_id").value, this.validateForm.get("design_category_id").value,
        this.validateForm.get("design_subcategory_id").value, "desc").subscribe(result => {
          this.designs = result;

        });
    } else {
      this.designSearchOptions = {};

      this.designService.getDesigns(" ", this.validateForm.get("design_category_id").value,
        this.validateForm.get("design_subcategory_id").value, "desc").subscribe(result => {
          this.designs = result; 
        });

    }


  }

  public setRow(_index: number, id: any) { 
    this.selectedIndex = _index;  // don't forget to update the model here
    this.design_id = id;
    // ... do other stuff here ...
  }
  designCategorySearchChange($event) {

    this.tempEditObject.design_subcategory_id = null;
    const query = encodeURI($event);
    if (query !== 'null') {
      this.designCategoryService
        .getDesignSubcategoryByDesignCategoryId(query)
        .subscribe(result => {
          this.designSubcategorySearchOptions = result;

          this.designService.getDesigns(this.validateForm.get("genre_id").value, this.validateForm.get("design_category_id").value,
            this.validateForm.get("design_subcategory_id").value, "desc").subscribe(result => {
              this.designs = result; 
            });

        });
    } else {
      this.designSubcategorySearchOptions = [];
    }
  }

  designSubcategorySearchChange($event) {
    this.tempEditObject.design_id = null;
    const query = encodeURI($event);
    if (query !== 'null') {
      this.designService
        .getDesignByDesignSubcategoryId(query)
        .subscribe(result => {
          this.designSearchOptions = result;
        });

      this.designService.getDesigns(this.validateForm.get("genre_id").value, this.validateForm.get("design_category_id").value,
        this.validateForm.get("design_subcategory_id").value, "desc").subscribe(result => {
          this.designs = result; 
        });
    } else {
      this.designSearchOptions = {};
    }
  }
  typeSearchChange($event: string) { }
  partSearchChange($event) { }
  onUploadStateChanged(state: boolean) {

  }
  categoryChange($event) {
    this.tempEditObject.subcategory_id = null;
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

}
