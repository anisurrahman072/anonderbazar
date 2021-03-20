import { Component, EventEmitter, Input, OnInit, Output } from '@angular/core';
import { DesignCategoryService } from "../../../../../../services/design-category.service";
import { PartService } from "../../../../../../services/part.service";
import { ProductDesignService } from "../../../../../../services/product-design.service";
import { DesignService } from "../../../../../../services/design.service";
import { GenreService } from "../../../../../../services/genre.service";
import { AuthService } from "../../../../../../services/auth.service";
import { CategoryProductService } from "../../../../../../services/category-product.service";
import { CategoryTypeService } from "../../../../../../services/category-type.service";
import { DesignImagesService } from "../../../../../../services/design-images.service";
import {environment} from "../../../../../../../environments/environment";

@Component({
    selector: 'app-add-product-design',
    templateUrl: './add-product-design.component.html',
    styleUrls: ['./add-product-design.component.css']
})
export class AddProductDesignComponent implements OnInit {
    IMAGE_ENDPOINT = environment.IMAGE_ENDPOINT;

    @Input() currentProductForAddPart: any;

    @Output() closeEvent = new EventEmitter<boolean>();
    productDesignData: any = [];
    editRow: any = null;
    tempEditObject: any = {};

    partSearchOptions: any = {};
    typeSearchOptions: any;
    designCategorySearchOptions: any = [];
    categorySearchOptions: any = [];
    designSubcategorySearchOptions: any = {};
    subcategorySearchOptions: any = {};
    designSearchOptions: any = {};
    genreSearchOptions: any = [];
    private currentUser: any;
    designCombinationData: any = [];
    isPartDesignVisible: boolean;
    designs: any = [];
    selectedIndex: number;
    design_id: any;


    constructor(private productDesignService: ProductDesignService,
        private partService: PartService,
        private authService: AuthService,
        private categoryTypeService: CategoryTypeService,
        private categoryProductService: CategoryProductService,
        private designCategoryService: DesignCategoryService,
        private designService: DesignService,
        private designImagesService: DesignImagesService,
        private genreService: GenreService) {
    }

    ngOnInit(): void {
        this.isPartDesignVisible = false;
        this.getDesignCombination();
        this.currentUser = this.authService.getCurrentUser();

        this.productDesignService.getByProductId(this.currentProductForAddPart.id).subscribe((result: any) => {
            this.productDesignData = result;
            if (!this.productDesignData.length) {
                this.addRow();
            }
        });
        this.categoryProductService.getAllCategory().subscribe((result: any) => {
            this.categorySearchOptions = result;
            // console.log(result);

        });
        this.categoryTypeService.getAll().subscribe(result => {
            this.typeSearchOptions = result;
        });

        this.designCategoryService.getAllDesignCategory().subscribe((result) => {
            this.designCategorySearchOptions = result;
            // console.log(result);
        });

        this.genreService.getAll().subscribe((result: any) => {
            this.genreSearchOptions = result;
        });

        this.designSubcategorySearchOptions = null;
        this.subcategorySearchOptions = null;
        this.partSearchOptions = null;

    }

    getDesignCombination() {
        this.designImagesService.getAllCombinationByProductId(this.currentProductForAddPart.id).subscribe(res => {
            this.designCombinationData = res.data;
        })
    }

    showModal = () => {
        this.isPartDesignVisible = true;
    }

    handleOk = (e) => {
        this.isPartDesignVisible = false;
        this.tempEditObject.design_id = this.design_id;
        this.tempEditObject.product_id = this.currentProductForAddPart.id;
        this.tempEditObject.warehouse_id = this.currentUser.warehouse.id;

        this.productDesignService.insert(this.tempEditObject).subscribe((result: any) => {
            this.productDesignData.push(result.data);
            this.tempEditObject = {}

        });

    }

    handleCancel = (e) => {
        this.isPartDesignVisible = false;
    }
    ngOnDestroy() {

    }

    closeAddDesign() {
        this.closeEvent.emit(true);

    }

    addRow() {

        this.tempEditObject = {
            product_id: this.currentProductForAddPart.id,
            warehouse_id: this.currentUser.warehouse.id,
        };
        this.productDesignData.push({});
        this.editRow = this.productDesignData.length - 1;

    }

    deleteConfirm(index, data) {
        if (data.id) {
            this.productDesignService.delete(data.id).subscribe(result => {
                this.productDesignData.splice(index, 1);

            })

        } else {
            this.productDesignData.splice(index, 1);
        }


    }

    editThisRow(i, data) {

        this.tempEditObject = {
            id: data.id,
            type_id: data.type_id.id,
            category_id: data.category_id.id,
            subcategory_id: data.subcategory_id.id,
            part_id: data.part_id.id,
            design_category_id: data.design_category_id.id,
            design_subcategory_id: data.design_subcategory_id ? data.design_subcategory_id.id : null,
            design_id: data.design_id.id,
            genre_id: data.genre_id.id,
            price: data.price,
            comment: data.comment,
            product_id: this.currentProductForAddPart.id,
            warehouse_id: this.currentUser.warehouse.id,
        };
        this.categoryProductService.getSubcategoryByCategoryId(data.category_id.id).subscribe(result => {
            this.subcategorySearchOptions = result;
        });

        this.designCategoryService.getDesignSubcategoryByDesignCategoryId(data.design_category_id.id).subscribe(result => {
            this.designSubcategorySearchOptions = result;
        });
        this.editRow = i;
    }

    saveThisRow(i, data) {
        if (data.id) {
            this.productDesignService.update(data.id, this.tempEditObject).subscribe((result: any) => {
                this.productDesignData[i] = result.data[0];
                this.tempEditObject = {}
            });

        } else {
            this.productDesignService.insert(this.tempEditObject).subscribe((result: any) => {
                this.productDesignData[i] = result.data;
                this.tempEditObject = {}

            });
        }

        /*with some loading....................*/
        this.editRow = null;

    }

    partSearchChange($event) {

    }

    designCategorySearchChange($event) {

        this.tempEditObject.design_id = null;
        const query = encodeURI($event);
        if (query !== 'null') {
            if (this.tempEditObject.genre_id && this.tempEditObject.design_subcategory_id) {
                this.designService.getDesigns(this.tempEditObject.genre_id, this.tempEditObject.design_category_id, this.tempEditObject.design_subcategory_id, "desc").subscribe(result => {
                    this.designs = result;
                });
            } else {
                this.designService.getDesigns("", this.tempEditObject.design_category_id, "", "desc").subscribe(result => {
                    this.designs = result;
                });
            }
            this.designCategoryService.getDesignSubcategoryByDesignCategoryId(query).subscribe(result => {
                this.designSubcategorySearchOptions = result;
            });
        } else {
            this.designSubcategorySearchOptions = {};
            this.designs = [];
        }
    }

    designSubcategorySearchChange($event) {
        this.tempEditObject.design_id = null;
        const query = encodeURI($event);
        if (query !== 'null') {
            if (this.tempEditObject.genre_id && this.tempEditObject.design_category_id) {
                this.designService.getDesigns(this.tempEditObject.genre_id, this.tempEditObject.design_category_id, this.tempEditObject.design_subcategory_id, "desc").subscribe(result => {
                    this.designs = result;
                });
            } else {
                this.designService.getDesigns("", "", this.tempEditObject.design_subcategory_id, "desc").subscribe(result => {
                    this.designs = result;
                });
            }

        } else {
            this.designs = [];
        }
    }

    genreSearchChange($event) {
        this.tempEditObject.design_id = null;
        const query = encodeURI($event);
        if (query !== 'null') {
            if (this.tempEditObject.design_category_id && this.tempEditObject.design_subcategory_id) {
                this.designService.getDesigns(this.tempEditObject.genre_id, this.tempEditObject.design_category_id, this.tempEditObject.design_subcategory_id, "desc").subscribe(result => {
                    this.designs = result;
                });
            } else {
                this.designService.getDesigns(this.tempEditObject.genre_id, "", "", "desc").subscribe(result => {
                    this.designs = result;
                });
            }
            this.designService.getDesignByGenreId(query).subscribe(result => {
                this.designSearchOptions = result;
            });
        } else {
            this.designSearchOptions = {};
            this.designs = [];
        }
    }
    public setRow(_index: number, id: any) {

        this.selectedIndex = _index;  // don't forget to update the model here
        this.design_id = id;
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

    typeSearchChange($event) {

    }
}
