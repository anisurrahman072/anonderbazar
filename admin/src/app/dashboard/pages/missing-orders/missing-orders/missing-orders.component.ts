import {ChangeDetectorRef, Component, OnInit} from '@angular/core';
import {FormBuilder, FormGroup, Validators} from "@angular/forms";
import {OrderService} from "../../../../services/order.service";
import {NzNotificationService} from "ng-zorro-antd";
import {ProductService} from "../../../../services/product.service";
import {CategoryProductService} from "../../../../services/category-product.service";
import {Router} from "@angular/router";

@Component({
    selector: 'app-missing-orders',
    templateUrl: './missing-orders.component.html',
    styleUrls: ['./missing-orders.component.css']
})
export class MissingOrdersComponent implements OnInit {

    validateForm: FormGroup;
    validateOrderForm: FormGroup;
    foundTransaction: boolean = false;
    submitting: boolean = false;

    allShippingAddress: any;
    shippingAddress: any;
    submittingOrderForm: boolean = false;
    productName: any;
    productList: any;
    selectedProducts: any[] = [];
    selectedProductIds: any[] = [];

    private customer: any;
    private ssl_transaction_id: any;

    type_id: any;
    typeSearchOptions: any = null;
    categorySearchOptions: any = null;
    category_id: any = null;
    subcategorySearchOptions: any = null;
    subcategory_id: any = null;
    data: any;
    selectedProduct: any;

    constructor(private fb: FormBuilder,
                private orderService: OrderService,
                private _notification: NzNotificationService,
                private productService: ProductService,
                private categoryProductService: CategoryProductService,
                private router: Router
    ) {
    }

    ngOnInit() {
        this.validateForm = this.fb.group({
            username: ['', [Validators.required]],
            ssl_transaction_id: ['', [Validators.required]]
        });

        this.validateOrderForm = this.fb.group({
            shippingAddress: [null, [Validators.required]],
            searchedProducts: ['',[]],
            type_id: ['',[]],
            category_id: ['',[]],
            subcategory_id: ['',[]],
            quantity: ['',[]]
        });

        this.categoryProductService.getAllCategory().subscribe(result => {
            this.category_id = null;
            this.categorySearchOptions = null;
            this.typeSearchOptions = result;
        });
    }

    getFormControl(name) {
        return this.validateForm.controls[name];
    }
    getOrderFormControl(name) {
        return this.validateOrderForm.controls[name];
    }

    submitForm($event, value) {
        this.submitting = true;
        $event.preventDefault();
        this.ssl_transaction_id = value.ssl_transaction_id;
        let formData = new FormData();
        formData.append('username', value.username);
        formData.append('ssl_transaction_id', value.ssl_transaction_id);

        this.orderService.findSSLTransaction(formData)
            .subscribe(sslResponse => {
                this.submitting = false;
                this.allShippingAddress = sslResponse.shippingAddress;
                this.customer = sslResponse.customer;
                this._notification.create(
                    'success',
                    'Success',
                    'Successfully found the ssl transaction'
                );

                this.foundTransaction = true;

            }, error => {
                this.submitting = false;
                if(error && error.error){
                    this._notification.create(
                        'error',
                        'Error',
                        error.error.message
                    );
                }
                else {
                    this._notification.create(
                        'error',
                        'Error',
                        'Error occurred!'
                    );
                }

                console.log('Error occurred.', error);
            })
    }

    resetForm($event: MouseEvent) {
        $event ? $event.preventDefault() : null;
        this.validateForm.reset();
        this.validateOrderForm.reset();
        for (const key in this.validateForm.controls) {
            this.validateForm.controls[key].markAsPristine();
        }
        for (const key in this.validateOrderForm.controls) {
            this.validateOrderForm.controls[key].markAsPristine();
        }
    }

    getProducts($event) {
        this.productName = $event;
        this.productService.getProductsByName($event)
            .subscribe(data => {
                this.productList = data.products;
                console.log('product list: ', this.productList);
            })
    }

    addProduct(product) {
        if(product){
            product.orderQuantity = 1;
            this.selectedProducts.push(product);
            this.selectedProductIds.push(product.id);
            console.log('after add', this.selectedProducts);
        }
    }

    updateQuantity($event, id) {
        let index = this.selectedProductIds.indexOf(id);
        this.selectedProducts[index].orderQuantity = $event.target.value;
        console.log('after update', this.selectedProducts);
    }

    deleteConfirm(id){
        let index = this.selectedProductIds.indexOf(id);
        this.selectedProducts.splice(index, 1);
        this.selectedProductIds.splice(index, 1);
        console.log('after delete', this.selectedProducts);

    }

    onTypeChange($event) {

        const query = encodeURI($event);
        console.log('onTypeChange', $event);
        this.type_id = $event;
        this.categorySearchOptions = null;
        this.category_id = null;
        this.productList = null;
        if (query !== 'null') {
            this.categoryProductService
                .getSubcategoryByCategoryId(query)
                .subscribe(result => {
                    this.categorySearchOptions = result;
                });
        } else {
            this.categorySearchOptions = {};
        }
    }

    categoryChange($event) {
        const query = encodeURI($event);
        console.log('categoryChange', $event);
        this.category_id = $event;
        this.subcategorySearchOptions = null;
        this.subcategory_id = null;
        if (query !== 'null') {
            this.categoryProductService
                .getSubcategoryByCategoryId(query)
                .subscribe(result => {
                    this.subcategorySearchOptions = result;
                    if (
                        this.data &&
                        this.data.subcategory_id
                    ) {
                        this.subcategory_id = this.data.subcategory_id;
                    }

                    this.productList = null;
                    this.productService.getByCategorySubCategory(this.type_id, this.category_id)
                        .subscribe(response => {
                            this.productList = response.products;
                        })
                });
        } else {
            this.subcategorySearchOptions = {};
        }
    }

    changeSubSubCategory($event){
        this.subcategory_id = $event;
        this.productList = null;
        this.productService.getByCategorySubCategory(this.type_id, this.category_id, this.subcategory_id)
            .subscribe(response => {
                this.productList = response.products;
            })
    }

    generateOrder($event, value){
        this.submittingOrderForm = true;
        $event.preventDefault();

        let formData = new FormData();
        formData.append('shippingAddressId', value.shippingAddress);
        formData.append('products',JSON.stringify(this.selectedProducts));
        formData.append('customerId',this.customer.id);
        formData.append('ssl_transaction_id', this.ssl_transaction_id);

        this.orderService.generateMissingOrders(formData)
            .subscribe(response => {
                this.submittingOrderForm = false;
                this._notification.create(
                    'success',
                    'Success',
                    'Order has been created Successfully.'
                );
                this.selectedProducts = [];
                this.foundTransaction = false;
                this.resetForm();
                console.log(response);
                this.router.navigate(['/dashboard/missing-orders']);
            }, error => {
                if(error && error.error){
                    this._notification.create(
                        'error',
                        'Error',
                        error.error.message
                    );
                }
                else {
                    this._notification.create(
                        'error',
                        'Error',
                        'Error occurred!'
                    );
                }
                this.submittingOrderForm = false;
            })
    }

}
