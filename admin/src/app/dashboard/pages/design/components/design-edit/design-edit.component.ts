import { Component, OnDestroy, OnInit, ViewChild } from '@angular/core';
import {
  FormBuilder,
  FormControl,
  FormGroup,
  Validators
} from '@angular/forms';
import { ActivatedRoute, Router } from '@angular/router';
import { Subscription } from 'rxjs';
import {
  NzInputDirectiveComponent,
  NzNotificationService
} from 'ng-zorro-antd';
import { FileHolder, UploadMetadata } from 'angular2-image-upload';
import { UserService } from '../../../../../services/user.service';
import { AuthService } from '../../../../../services/auth.service';
import { DesignService } from '../../../../../services/design.service';
import { DesignCategoryService } from '../../../../../services/design-category.service';
import { GenreService } from '../../../../../services/genre.service';

import {environment} from "../../../../../../environments/environment";

@Component({
  selector: 'app-design-edit',
  templateUrl: './design-edit.component.html',
  styleUrls: ['./design-edit.component.css']
})
export class DesignEditComponent implements OnInit, OnDestroy {
  validateForm: FormGroup;
  ImageFile: File;
  controlArray: any = [];
  instanceid: number = 0;
  ImageFileEdit: any[] = [];
  IMAGE_ENDPOINT = environment.IMAGE_ENDPOINT;

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
  @ViewChild('Image') Image;
  designCategorySearchOptions: any;
  designSubcategorySearchOptions: any = {};
  genreSearchOptions: any;

  @ViewChild('input') input: NzInputDirectiveComponent;
  sub: Subscription;
  id: number;
  data: any;
  design_category_id: any;
  design_category_ids: any = [];
  design_subcategory_ids: any = [];
  design_Genre_ids: any = [];
  design_subcategory_id: any;
  genre_id: any;
  currentUser: any;
  details: any;
  total_design_category: number;
  total_design_suncategory: number;
  total_genre: number;

  constructor(
    private router: Router,
    private route: ActivatedRoute,
    private _notification: NzNotificationService,
    private fb: FormBuilder,
    private userService: UserService,
    private authService: AuthService,
    private genreService: GenreService,
    private designCategoryService: DesignCategoryService,
    private designService: DesignService
  ) {
    this.validateForm = this.fb.group({
      name: ['', [Validators.required]],
      code: [''],
      design_category_id: ['', [Validators.required]],
      design_subcategory_id: ['', [Validators.required]],
      genre_id: ['', [Validators.required]],
      details: ['', [Validators.required]]
    });
  }
//Event method for submitting the form
  submitForm = ($event, value) => {
    $event.preventDefault();
    for (const key in this.validateForm.controls) {
      this.validateForm.controls[key].markAsDirty();
    }

    const formData: FormData = new FormData();
    formData.append('name', value.name);
    formData.append('code', value.code);

    let design_category_id = [], design_subcategory_id = [], genre_id = [];
    for (let i = 0; i < this.instanceid; i++) {
      design_category_id.push(this.validateForm.value["design_category_id[" + i + "]"]);
      design_subcategory_id.push(this.validateForm.value["design_subcategory_id[" + i + "]"]);
      genre_id.push(this.validateForm.value["genre_id[" + i + "]"]);
    }

    
    formData.append('design_category_id', JSON.stringify(design_category_id));
    formData.append('genre_id', JSON.stringify(genre_id));
    formData.append('warehouse_id', this.currentUser.warehouse.id);

    if (value.design_subcategory_id) {
      formData.append('design_subcategory_id', JSON.stringify(design_subcategory_id));
    }

    if (value.details) {
      formData.append('details', value.details);
    }

    if (this.ImageFile) {
      formData.append('hasImage', 'true');
      formData.append('image', this.ImageFile, this.ImageFile.name);
    } else {
      formData.append('hasImage', 'false');
    }
    
    this.designService.update(this.id, formData).subscribe(result => {
      if (result) {
        this._notification.create(
          'success',
          'Update successful ',
          this.data.name
        );
        this.router.navigate(['/dashboard/design/details/', this.id]);
      }
    });
  };
 // init the component
  ngOnInit() {
    this.currentUser = this.authService.getCurrentUser(); 
    this.sub = this.route.params.subscribe(params => {
      this.id = +params['id']; // (+) converts string 'id' to a number
      this.designService.getById(this.id).subscribe(result => {
        this.data = result;
        this.validateForm.patchValue(this.data);
        this.ImageFileEdit = [];

        let newCategory = this.data.design_category_id;
        let newSubCategory = this.data.design_subcategory_id;
        let newGenre = this.data.genre_id;

        let choiceLength = 0;
        if (newCategory.length > newSubCategory.length) {
          choiceLength = newCategory.length;
        } else if (newCategory.length < newSubCategory.length) {
          choiceLength = newSubCategory.length;
        } else {
          choiceLength = newGenre.length;
        }

        for (let index = 0; index < choiceLength; index++) {
          this.addField();
        }

        
        if (this.data && this.data.image) {
          this.ImageFileEdit.push(this.IMAGE_ENDPOINT + this.data.image);
        }
        this.design_category_ids = newCategory;
        this.design_subcategory_ids = newSubCategory;
        this.design_Genre_ids = newGenre;

        if (this.data && this.data.details) {
          this.details = this.data.details;
        }
      });
    });

    this.designCategoryService.getAllDesignCategory().subscribe(result => {
      this.designCategorySearchOptions = result; 
    });

    this.genreService.getAll().subscribe(result => {
      this.genreSearchOptions = result;
    });

    this.designSubcategorySearchOptions = null;
  }
  //Event method for removing picture
  onRemoved(file: FileHolder) {
    this.ImageFile = null;
  }
//Event method for storing imgae in variable
  onBeforeUpload = (metadata: UploadMetadata) => {
    this.ImageFile = metadata.file;
    return metadata;
  };
//Event method for resetting the form
  resetForm($event: MouseEvent) {
    $event.preventDefault();
    this.validateForm.reset();
    for (const key in this.validateForm.controls) {
      this.validateForm.controls[key].markAsPristine();
    }
  }
    //Event method for storing imgae in variable
  getFormControl(name) {
    return this.validateForm.controls[name];
  }



  addField(e?: MouseEvent) {
    if (e) {
      e.preventDefault();
    }
    const id = this.instanceid; 

    const design_category_control = {
      id,
      controlInstance: `design_category_id[${id}]`
    };
    const design_subcategory_control = {
      id,
      controlInstance1: `design_subcategory_id[${id}]`
    };
    const genre_control = {
      id,
      controlInstance2: `genre_id[${id}]`
    };
    let choice = [];
    choice.push(design_category_control, design_subcategory_control, genre_control)
    const index = this.controlArray.push(choice);
    this.validateForm.addControl(this.controlArray[index - 1][0].controlInstance, new FormControl(null, Validators.required));
    this.validateForm.addControl(this.controlArray[index - 1][1].controlInstance1, new FormControl(null, Validators.required));
    this.validateForm.addControl(this.controlArray[index - 1][2].controlInstance2, new FormControl(null, Validators.required));
    this.instanceid++;
  }

  removeField(i, e: MouseEvent) {
    e.preventDefault();
    if (this.controlArray.length > 1) {
      const index = this.controlArray.indexOf(i);
      this.controlArray.splice(index, 1);
      this.validateForm.removeControl(i.controlInstance);
    }
  }
  ngOnDestroy(): void {
    this.sub ? this.sub.unsubscribe() : '';
  }

  categorySearchChange($event) { }

  categoryChange($event) {
    const query = encodeURI($event);
    if (query !== 'null') {
      this.designCategoryService
        .getDesignSubcategoryByDesignCategoryId(query)
        .subscribe(result => {
          this.designSubcategorySearchOptions = result;
        });
    } else {
      this.designSubcategorySearchOptions = {};
    }
  }

  subcategorySearchChange($event) { }

  subcategoryChange($event) { }

  genreSearchChange($event) { }
}
