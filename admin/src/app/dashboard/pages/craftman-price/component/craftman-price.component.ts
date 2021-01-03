import { UIService } from '../../../../services/ui/ui.service';
import { Subscription } from 'rxjs';
import { Component, EventEmitter, Input, OnInit, Output } from '@angular/core';

import { CraftmanPriceService } from '../../../../services/craftman-price.service';
import { PartService } from '../../../../services/part.service';
import { AuthService } from '../../../../services/auth.service';
import { DesignCategoryService } from '../../../../services/design-category.service';
import { DesignService } from '../../../../services/design.service';
import { GenreService } from '../../../../services/genre.service';
import { CategoryTypeService } from '../../../../services/category-type.service';
import { CategoryProductService } from '../../../../services/category-product.service';
import { FormGroup } from '@angular/forms';
import { CraftsmanService } from '../../../../services/craftsman.service';
import {environment} from "../../../../../environments/environment";

@Component({
  selector: 'app-craftman-price',
  templateUrl: './craftman-price.component.html',
  styleUrls: ['./craftman-price.component.css']
})
export class CraftmanPriceComponent implements OnInit {
  IMAGE_ENDPOINT = environment.IMAGE_ENDPOINT;

  craftmanId: any;

  craftmanPriceData: any[] = [];
  editRow: any = null;
  editRowActive: boolean = false;
  createRowActive: boolean = false;
  tempEditObject: any = {};

  partSearchOptions: any = {};
  partsSearchOptions: any = [];
  typeSearchOptions: any;
  totalCraftman: any;
  designCategorySearchOptions: any[];
  categorySearchOptions: any[];
  designSubcategorySearchOptions: any = [];
  subcategorySearchOptions: any = [];
  designSearchOptions: any = {};
  genreSearchOptions: any[];
  genresSearchOptions: any[];
  private currentUser: any;

  craftmanSearchoptions: any[];

  _isSpinning = true;
  data = [];
  limit: number = 10;
  page: number = 1;
  total: number;

  sortValue = {
    name: null,
    price: null
  };
  categoryId: any = null;
  subcategoryId: any = null;

  validData: boolean = false;

  validateForm: FormGroup;
  craftmanList: any[] = [];

  nameSearchValue: any = '';
  productClassSearchValue: string = '';
  categorySearchValue: string = '';
  subCategorySearchValue: string = '';
  partSearchValue: string = '';
  genreSearchValue: string = '';
  designCategorySearchValue: string = '';
  designSubcategorySearchValue: string = '';
  designSearchValue: string = '';
  priceSearchValue: string = '';
  timeSearchValue: string = '';

  private currentWarehouseSubscriprtion: Subscription;
  private currentValue:Subscription;
  private currentWarehouseId: any;
  constructor(
    private craftmanpriceService: CraftmanPriceService,
    private partService: PartService,
    private authService: AuthService,
    private categoryTypeService: CategoryTypeService,
    private categoryProductService: CategoryProductService,
    private designCategoryService: DesignCategoryService,
    private craftsmanService: CraftsmanService,
    private designService: DesignService,
    private uiService: UIService,
    private genreService: GenreService
  ) {}
// init the component
  ngOnInit(): void {
    this.currentUser = this.authService.getCurrentUser(); 
    

    this.currentWarehouseSubscriprtion = this.uiService.currentSelectedWarehouseInfo.subscribe(
      warehouseId => { 
        this.currentWarehouseId = warehouseId || '';
        this.getPageData();
        this.getAllCraftsmanSearchData();
      }
    );     

    this.categoryProductService.getAllCategory().subscribe((result: any) => {
      this.categorySearchOptions = result;
    });
    this.categoryTypeService.getAll().subscribe(result => {
      this.typeSearchOptions = result;
    });
    this.designCategoryService.getAllDesignCategory().subscribe(result => {
      this.designCategorySearchOptions = result;
    });
    this.genreService.getAll().subscribe((result: any) => {
      this.genreSearchOptions = result;
    });

    this.partService.getAll().subscribe(result => {
      this.partsSearchOptions = result;
    });
  }

  ngOnDestroy(): void {
    this.currentWarehouseSubscriprtion
      ? this.currentWarehouseSubscriprtion.unsubscribe()
      : '';
  }

  getAllCraftsmanSearchData() {
    this.craftsmanService
      .getAllCraftsmanByWarehouseId(this.currentWarehouseId)
      .subscribe((result: any) => {
        this.craftmanSearchoptions = result.data;
      });
  }
  //Event method for getting all the data for the page
  getPageData() {
    this.craftmanpriceService
      .getAllCraftmanPriceByCraftsmanId(
        this.currentWarehouseId,
        this.page,
        this.limit,
        this.nameSearchValue,
        this.productClassSearchValue || '',
        this.categorySearchValue || '',
        this.subCategorySearchValue || '',
        this.partSearchValue || '',
        this.genreSearchValue || '',
        this.designCategorySearchValue || '',
        this.designSubcategorySearchValue || '',
        this.designSearchValue || '',
        this.priceSearchValue || '',
        this.timeSearchValue || '',
        this.categoryId || '',
        this.subcategoryId || '',
        this.filterTerm(this.sortValue.name),
        this.filterTerm(this.sortValue.price)
      )
      .subscribe(
        result => {
          this.craftmanPriceData = result.data;
          this.total = result.total;
          this._isSpinning = false;
        },
        result => {
          this._isSpinning = false;
        }
      );
  }
  //Event method for pagination change
  changePage(page: number, limit: number) {
    this.page = page;
    this.limit = limit;
    this.getPageData();
    return false;
  }

  private filterTerm(sortValue: string): string {
    switch (sortValue) {
      case 'ascend':
        return 'ASC';
      case 'descend':
        return 'DESC';
      default:
        return '';
    }
  }
  //Event method for resetting all filters
  resetAllFilter() {
    this.limit = 5;
    this.page = 1;
    this.nameSearchValue = '';
    this.productClassSearchValue = '';
    this.categorySearchValue = '';
    this.subCategorySearchValue = '';
    this.partSearchValue = '';
    this.genreSearchValue = '';
    this.designCategorySearchValue = '';
    this.designSubcategorySearchValue = '';
    this.designSearchValue = '';
    this.priceSearchValue = '';
    this.timeSearchValue = '';

    this.sortValue = {
      name: null,
      price: null
    };
    this.categoryId = null;
    this.subcategoryId = null;
    this.subcategorySearchOptions = [];
    this.getPageData();
  }

  categoryIdChange($event) {
    this.page = 1;
    const query = encodeURI($event);


    this.subcategorySearchOptions = [];
    this.subcategoryId = null;
    this.getPageData();

    if (query !== 'null') {
      this.categoryProductService
        .getSubcategoryByCategoryId(query)
        .subscribe(result => {
          this.subcategorySearchOptions = result;
        });
    }
  }

  categoryIdSearchChange($event) {}

  subcategoryIdChange($event) {
    this.page = 1;
    this.getPageData();
  }

  subcategoryIdSearchChange($event) {}

  addRow() {
    this.tempEditObject = {
      warehouse_id: this.currentUser.warehouse.id
    };
    this.craftmanPriceData.push({});
    this.editRow = this.craftmanPriceData.length - 1;
    this.editRowActive = true;
  }
  //Event method for deleting courier price
  deleteConfirm(index, data) {
    if (data.id) {
      this.craftmanpriceService.delete(data.id).subscribe(result => {
        this.craftmanPriceData.splice(index, 1);
      });
    } else {
      this.craftmanPriceData.splice(index, 1);
    }
  }
//Event method for submitting the edit form
  editThisRow(i, data) {
    this.editRowActive = true;
    this.tempEditObject = {
      id: data.id,
      type_id: data.type_id.id,
      category_id: data.category_id.id,
      subcategory_id: data.subcategory_id.id,
      part_id: data.part_id.id,
      design_category_id: data.design_category_id.id,
      design_subcategory_id: data.design_subcategory_id
        ? data.design_subcategory_id.id
        : null,
      design_id: data.design_id.id,
      genre_id: data.genre_id.id,
      price: data.price,
      time: data.time,
      comment: data.comment,
      craftman_id: data.craftman_id.id,
      warehouse_id: this.currentUser.warehouse.id
    };

    this.categoryProductService
      .getSubcategoryByCategoryId(data.category_id.id)
      .subscribe(result => {
        this.subcategorySearchOptions = result;
      });
    this.designCategoryService
      .getDesignSubcategoryByDesignCategoryId(data.design_category_id.id)
      .subscribe(result => {
        this.designSubcategorySearchOptions = result;
      });
    this.editRow = i;
  }
//Event method for setting up form in validation
  getFormControl(name) {
    return this.validateForm.controls[name];
  }
//Event method for submitting the form
  saveThisRow(i, data) {
    if (data.id) {
      this.craftmanpriceService
        .update(data.id, this.tempEditObject)
        .subscribe((result: any) => {
          this.craftmanPriceData[i] = result.data[0];
          this.tempEditObject = {};
        });
    } else {
      this.craftmanpriceService
        .insert(this.tempEditObject)
        .subscribe((result: any) => {
          this.craftmanPriceData[i] = result.data;
          this.tempEditObject = {};
          this.editRow = null;
          this.editRowActive = false;
        });
    }
  }

  cancelThisRow(i, data) {
    this.editRow = null;
    this.editRowActive = false;
    if (data.id) {
    } else {
      this.craftmanPriceData.splice(i, 1);
    }
  }

  partSearchChange($event) {}

  designCategorySearchChange($event) {
    this.tempEditObject.design_subcategory_id = null;
    const query = encodeURI($event);
    if (query !== 'null') {
      this.designCategoryService
        .getDesignSubcategoryByDesignCategoryId(query)
        .subscribe(result => {
          this.designSubcategorySearchOptions = result;
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
    } else {
      this.designSearchOptions = {};
    }
  }

  designSearchChange($event) {}

  genreSearchChange($event) {
    this.tempEditObject.design_id = null;
    const query = encodeURI($event);
    if (query !== 'null') {
      this.designService.getDesignByGenreId(query).subscribe(result => {
        this.designSearchOptions = result;
      });
    } else {
      this.designSearchOptions = {};
    }
  }

  categorySearchChange($event) {}

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

  typeSearchChange($event: string) {}

  crafmanChange($event: string) { 
  }
  crafmanSearchChange($event: string) { 
  }
}
