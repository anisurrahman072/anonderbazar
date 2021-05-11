import {ChangeDetectorRef, Component, OnInit} from '@angular/core';
import {FormBuilder, FormGroup, Validators} from "@angular/forms";
import {OrderService} from "../../../../services/order.service";
import {NzNotificationService} from "ng-zorro-antd";
import {ProductService} from "../../../../services/product.service";

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

    constructor(private fb: FormBuilder,
                private orderService: OrderService,
                private _notification: NzNotificationService,
                private productService: ProductService,
                private cdr: ChangeDetectorRef
    ) {
    }

    ngOnInit() {
        this.validateForm = this.fb.group({
            username: ['', [Validators.required]],
            ssl_transaction_id: ['', [Validators.required]]
        });

        this.validateOrderForm = this.fb.group({
            shippingAddress: [null, [Validators.required]],
            searchedProducts: null,
            quantity: null
        });
    }

    getFormControl(name) {
        return this.validateForm.controls[name];
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
                console.log('ressss', sslResponse);
                this.submitting = false;
                this.allShippingAddress = sslResponse.shippingAddress;
                this.customer = sslResponse.customer;
                this._notification.create(
                    'success',
                    'Success',
                    sslResponse.message
                );

                this.foundTransaction = true;

            }, error => {
                this.submitting = false;
                this._notification.create(
                    'error',
                    'Error',
                    error.message
                );
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
        product.orderQuantity = 1;
        this.selectedProducts.push(product);
        this.selectedProductIds.push(product.id);
        console.log('after add', this.selectedProducts);

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

    generateOrder($event, value){
        this.submittingOrderForm = true;
        $event.preventDefault();

        let formData = new FormData();
        formData.append('shippingAddress', value.shippingAddress);
        formData.append('products',JSON.stringify(this.selectedProducts));
        formData.append('customerId',this.customer.id);
        formData.append('ssl_transaction_id', this.ssl_transaction_id);


        this.orderService.generateMissingOrders(formData)
            .subscribe(response => {
                console.log(response);
            })
    }

}
