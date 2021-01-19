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
import {forEach} from "@angular/router/src/utils/collection";
import { BrandService } from '../../../../../services/brand.service';

@Component({
    selector: 'app-fixed-product-create',
    templateUrl: './fixed-product-create.component.html',
    styleUrls: ['./fixed-product-create.component.css']
})
export class FixedProductCreateComponent implements OnInit {
    tagOptions: any = [];
    validateForm: FormGroup;
    ImageBlukArray: any = [];
    ImageFile: File[] = [];
    ImageFrontFile: File[] =[];
    @ViewChild('Image') Image;
    isSubmit:boolean =true;

/*    ckConfig = {
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
    };*/
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
                private userService: UserService,
                private brandService: BrandService,
                private authService: AuthService,
                private categoryTypeService: CategoryTypeService,
                private categoryProductService: CategoryProductService,
                private productService: ProductService) {
        this.validateForm = this.fb.group({
            name: ['', [Validators.required]],
            code:[''],
            image: [null, []],
            frontimage: [null, []],
            price: ['0', []],
            vendor_price: ['', []],
            min_unit: [1, [Validators.required]],
            alert_quantity: [10, []],
            brand_id: ['', []],
            category_id: ['', [Validators.required]],
            subcategory_id: ['', []],
            quantity: ['1', [Validators.required]],
            product_details: ['', [Validators.required]],
            type_id: ['', []],
            tag: ['', []],
            featured: [false, []],
            weight: ['0.0', [Validators.required]]
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
        formData.append('vendor_price', value.vendor_price);
        formData.append('alert_quantity', value.alert_quantity || '0');
        formData.append('brand_id', value.brand_id);
        formData.append('category_id', value.category_id);
        formData.append('quantity', value.quantity);
        formData.append('product_details', value.product_details);
        formData.append('type_id', value.type_id);
        formData.append('tag', JSON.stringify(value.tag));
        formData.append('featured', value.featured ? '1' : '0');
        formData.append('weight', value.weight);
        formData.append('status', '1');

        if (value.subcategory_id) {
            formData.append('subcategory_id', value.subcategory_id);
        }

        formData.append('warehouse_id', this.currentUser.warehouse.id);

        if (this.ImageBlukArray.length>0) {
            let ImageBluk=[];
            for (let i = 0; i < this.ImageBlukArray.length; i++) {
                ImageBluk[i]=this.ImageBlukArray[i].id;
            }
            formData.append('ImageBlukArray', ImageBluk.toString());
        }
        if (this.ImageFrontFile.length>0) {
            formData.append('hasImageFront', 'true');
            formData.append('frontimage', this.ImageFrontFile[0], this.ImageFrontFile[0].name);
        } else {
            formData.append('hasImageFront', 'false');

        }
        this.isSubmit=false;
        this.productService.insert(formData).subscribe(result => {
            console.log(result);
            if (result.id) {
                this._notification.create(
                    'success',
                    'New fixed product has been successfully added.',
                    result.name
                );
                this.router.navigate(['/dashboard/product/details/', result.id], {queryParams: {status: this.queryStatus}});
            }
        });
    };
    // Event method for removing picture
    onRemoved(_file: FileHolder) {
        var index = this.ImageFile.findIndex(e => e.name === _file.file.name);

        const formData: FormData = new FormData();
        formData.append('id', this.ImageBlukArray[index].id);

        this.ImageFile.splice(index,1);
        this.ImageBlukArray.splice(index, 1);

        this.productService.upload(formData).subscribe(result => {
        });


    }
    // Event method for storing imgae in variable
    onBeforeUpload = (metadata: UploadMetadata) => {
        const formData: FormData = new FormData();
        formData.append('hasImage', 'true');
        formData.append('image', metadata.file, metadata.file.name);

        this.productService.upload(formData).subscribe(result => {
            this.ImageBlukArray.push(result);
        });
        this.ImageFile.push(metadata.file);
        return metadata;
    };
    // Event method for removing front picture
    onRemovedFront(_file: FileHolder) {
        this.ImageFrontFile.splice(
          this.ImageFrontFile.findIndex(e => e.name === _file.file.name),
          1
        );
    }
    // Event method for storing front imgae in variable
    onBeforeUploadFront = (metadata: UploadMetadata) => {
        this.ImageFrontFile.push(metadata.file);
        return metadata;
    }
    // Event method for resetting the form
    resetForm($event: MouseEvent) {
        $event.preventDefault();
        this.validateForm.reset();
        for (const key in this.validateForm.controls) {
            this.validateForm.controls[key].markAsPristine();
        }
    }
    // Event method for resetting the form
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
