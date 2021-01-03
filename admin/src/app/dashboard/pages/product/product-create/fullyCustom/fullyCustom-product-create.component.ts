import {
    Component,
    ElementRef,
    EventEmitter,
    Input,
    OnInit,
    Output,
    ViewChild
} from '@angular/core';
import {FormBuilder, FormGroup, Validators} from '@angular/forms';
import {ActivatedRoute, Router} from '@angular/router';
import {
    NzInputDirectiveComponent,
    NzNotificationService
} from 'ng-zorro-antd';
import {UploadMetadata, FileHolder} from 'angular2-image-upload';
import {ProductService} from '../../../../../services/product.service';
import {CategoryTypeService} from '../../../../../services/category-type.service';
import {CategoryProductService} from '../../../../../services/category-product.service';
import {UserService} from '../../../../../services/user.service';
import {AuthService} from '../../../../../services/auth.service';
import { BrandService } from '../../../../../services/brand.service';

@Component({
    selector: 'app-fully-custom-product-create',
    templateUrl: './fullyCustom-product-create.component.html',
    styleUrls: ['./fullyCustom-product-create.component.css']
})
export class FullyCustomProductCreateComponent implements OnInit {
    tagOptions: any = [];
    validateForm: FormGroup;
    ImageFile: File[] = [];
    ckConfig = {
        uiColor: '#662d91',
        toolbarGroups: [
            {
                name: 'basicstyles',
                group: [
                    'Bold',
                    'Italic',
                    'Underline',
                    'Strike',
                    'Subscript',
                    'Superscript',
                    '-',
                    'JustifyLeft',
                    'JustifyCenter',
                    'JustifyRight',
                    'JustifyBlock',
                    '-',
                    'BidiLtr',
                    'BidiRtl',
                    'Language'
                ]
            },
            {
                name: 'paragraph',
                groups: ['JustifyLeft', 'JustifyCenter', 'JustifyRight', 'JustifyBlock']
            },
            {name: 'styles', groups: ['Styles', 'Format', 'Font', 'FontSize']}
        ],
        removeButtons: 'Source,Save,Templates,Find,Replace,Scayt,SelectAll'
    };
    @ViewChild('Image') Image;
    categorySearchOptions: any = [];
    subcategorySearchOptions: any = [];
    typeSearchOptions: any;
    brandSearchOptions: any;

    craftsmanSearchOptions: any;
    tag: any;
    tags = [];
    inputVisible = false;
    inputValue = '';
    statusOptions = [
        { label: 'Inactive Product', value: 0 },
        { label: 'Fixed Product', value: 1 },
        { label: 'Variable Product', value: 2 },
    ];

    currentUser: any;
    queryStatus: any;
    constructor(private router: Router,
                private route: ActivatedRoute,
                private _notification: NzNotificationService,
                private fb: FormBuilder,
                private brandService: BrandService,
                private userService: UserService,
                private authService: AuthService,
                private categoryTypeService: CategoryTypeService,
                private categoryProductService: CategoryProductService,
                private productService: ProductService) {
        this.validateForm = this.fb.group({
            name: ['', [Validators.required]],
            code:[''],
            image: [null, []],
            price: ['', []],
            min_unit: [0, [Validators.required]],
            alert_quantity: [0.0, []],
            category_id: ['', [Validators.required]],
            brand_id: ['', [Validators.required]],
            subcategory_id: ['', []],
            quantity: ['', [Validators.required]],
            product_details: ['', [Validators.required]],
            type_id: ['', []],
            craftsman_id: ['', [Validators.required]],
            craftsman_price: ['', [Validators.required]],
            produce_time: ['', []],
            tag: ['', []],
            featured: [false, []],
            weight: ['', []]
        });
    }
    // Event method for submitting the form
    submitForm = ($event, value) => {
        $event.preventDefault();
        for (const key in this.validateForm.controls) {
            this.validateForm.controls[key].markAsDirty();
        }

        const formData: FormData = new FormData();
        formData.append('name', value.name);
        formData.append('code', value.code);
        formData.append('min_unit', value.min_unit);
        formData.append('price', value.price);
        formData.append('alert_quantity', value.alert_quantity || '0');
        formData.append('category_id', value.category_id);
        formData.append('quantity', value.quantity);
        formData.append('product_details', value.product_details);
        formData.append('type_id', value.type_id);
        formData.append('craftsman_id', value.craftsman_id);
        formData.append('craftsman_price', value.craftsman_price);
        formData.append('tag', JSON.stringify(value.tag));
        formData.append('featured', value.featured ? '1' : '0');
        formData.append('weight', value.weight);
        formData.append('produce_time', value.produce_time);
        formData.append('status', '3');

        if (value.subcategory_id) {
            formData.append('subcategory_id', value.subcategory_id);
        }

        formData.append('warehouse_id', this.currentUser.warehouse.id);
        if (this.ImageFile) {
            formData.append('hasImage', 'true');

            formData.append('imageCounter', this.ImageFile.length.toString());

            for (let i = 0; i < this.ImageFile.length; i++) {
                formData.append('image' + i, this.ImageFile[i], this.ImageFile[i].name);
            }
        } else {
            formData.append('hasImage', 'false');
        }
        this.productService.insert(formData).subscribe(result => {
            if (result.id) {
                this._notification.create(
                    'success',
                    'New fully customize product has been successfully added.',
                    result.name
                );
                this.router.navigate(['/dashboard/product/details/', result.id], {queryParams: {status: this.queryStatus}});
            }
        });
    };
    // Event method for removing picture
    onRemoved(_file: FileHolder) {
        this.ImageFile.splice(
            this.ImageFile.findIndex(e => e.name === _file.file.name),
            1
        );
    }
    // Event method for storing imgae in variable
    onBeforeUpload = (metadata: UploadMetadata) => {
        this.ImageFile.push(metadata.file);
        return metadata;
    };
    // Event method for resetting the form
    resetForm($event: MouseEvent) {
        $event.preventDefault();
        this.validateForm.reset();
        for (const key in this.validateForm.controls) {
            this.validateForm.controls[key].markAsPristine();
        }
    }
    // Event method for setting up form in validation
    getFormControl(name) {
        return this.validateForm.controls[name];
    }
    // For initiating the section element with data
    ngOnInit() {
        this.currentUser = this.authService.getCurrentUser();
        this.route.queryParams.filter(params => params.status).subscribe(params => {  
            this.queryStatus = params.status;
        });
        this.categoryProductService.getAllCategory().subscribe(result => {
            this.typeSearchOptions = result;
        });
        this.brandService.getAll().subscribe((result: any) => {
            this.brandSearchOptions = result; 
            
        }); 
        this.userService
            .getAllCraftsmanByWarehouseId(this.currentUser.warehouse.id)
            .subscribe(result => {
                this.craftsmanSearchOptions=result.data;
            });
    }

    categorySearchChange($event) {
    }
    // Method called on product type change
    onTypeChange($event) {
        const query = encodeURI($event);
        if (query !== 'null') {
            this.categoryProductService
                .getSubcategoryByCategoryId(query)
                .subscribe(result => {
                    this.categorySearchOptions = result;
                });
        } else {
            this.subcategorySearchOptions = {};
        }
    }
    // Method called on category change
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

    subcategorySearchChange($event) {
    }

    typeSearchChange($event: string) {
    }

    craftsmanSearchChange($event) {
    }
}
