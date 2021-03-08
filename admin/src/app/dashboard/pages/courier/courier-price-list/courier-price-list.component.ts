import {Component, OnInit} from '@angular/core';
import {UIService} from '../../../../services/ui/ui.service';
import {FormGroup, FormBuilder, Validators} from '@angular/forms';
import {ActivatedRoute} from '@angular/router';
import {CourierPriceService} from '../../../../services/courier-price.service';
import {CourierService} from '../../../../services/courier.service';
import {NzNotificationService} from "ng-zorro-antd";

@Component({
    selector: 'app-courier-price-list',
    templateUrl: './courier-price-list.component.html',
    styleUrls: ['./courier-price-list.component.css']
})
export class CourierPriceListComponent implements OnInit {
    status: any;
    limit: number = 10;
    page: number = 1;
    total: number;
    data: any = [];
    listOfCourier = [];
    _isSpinning: boolean = true;
    isVisible = false;
    isEditVisible = false;
    isConfirmLoading = false;
    validateForm: FormGroup;
    style: any = {
        height: '500px'
    };
    styleEdit: any = {
        height: '500px'
    };
    editName: string;
    editPrice: number;
    editRemarks: string;
    validateEditForm: FormGroup;
    id: number;
    editCourier_id: any;

    constructor(private route: ActivatedRoute,
                private uiService: UIService,
                private fb: FormBuilder,
                private courierService: CourierService,
                private _notification: NzNotificationService,
                private courierPriceService: CourierPriceService) {

    }

    // init the component
    ngOnInit() {
        this.validateForm = this.fb.group({
            courier_id: ["", [Validators.required]],
            name: ["", [Validators.required]],
            price: [""],
            remarks: [""],
        });

        this.validateEditForm = this.fb.group({
            editCourier_id: ["", [Validators.required]],
            editName: ["", [Validators.required]],
            editPrice: [""],
            editRemarks: [""],
        });
        this.getCourierPriceData();
    }

    getCourierPriceData(): void {
        this.courierPriceService.getAllCourierPrices(this.page, this.limit).subscribe(result => {
            this._isSpinning = false;
            this.data = result.data;
            this.total = result.total;
        });


    }

    //Event method for pagination change
    changePage(page: number, limit: number) {
        this.page = page;
        this.limit = limit;
        this.getCourierPriceData();
        return false;
    }

    //Event method for deleting order price list
    deleteConfirm(i, id) {
        this.courierPriceService.delete(id).subscribe(result => {

            this.getCourierPriceData();
            this._notification.create('warning', 'Delete', 'Price has been removed successfully');

        });
    }

    //Event method for resetting all filters
    resetAllFilter() {
        this.limit = 10;
        this.page = 1;
        this.getCourierPriceData();
    }

    //Event method for submitting the form
    submitForm = ($event, value) => {
        $event.preventDefault();
        for (const key in this.validateForm.controls) {
            this.validateForm.controls[key].markAsDirty();
        }

        const formData: FormData = new FormData();
        formData.append("courier_id", value.courier_id);
        formData.append("weight", value.name);
        formData.append("price", value.price);
        formData.append("remarks", value.remarks);

        this.courierPriceService.insert(formData).subscribe(
            result => {
                if (result.id) {
                    this._notification.create(
                        "success",
                        "New courier price has been successfully added.",
                        result.name
                    );
                }
                this.isVisible = false;
                this.getCourierPriceData();
                this._isSpinning = false;
            },
            error => {
                this._isSpinning = false;
            }
        );
    };
    //Method for showing the modal
    showModal = () => {
        this.isVisible = true;
        this.isEditVisible = false;
        this.courierService.getAllCourier().subscribe(result => {
            this.listOfCourier = result;
        });
    };

    handleOk = (e) => {
        this.isConfirmLoading = true;
        setTimeout(() => {
            this.isVisible = false;
            this.isConfirmLoading = false;
            this.submitForm;
        }, 2000);
    };

    handleCancel = (e) => {
        this.isVisible = false;
    };
    //Event method for submitting the edit form
    submitEditForm = ($event, value) => {
        $event.preventDefault();
        for (const key in this.validateForm.controls) {
            this.validateForm.controls[key].markAsDirty();
        }
        const formData: FormData = new FormData();
        formData.append("courier_id", value.editCourier_id);
        formData.append("weight", value.editName);
        formData.append("price", value.editPrice);
        formData.append("remarks", value.editRemarks);

        this.courierPriceService.update(this.id, formData).subscribe(
            result => {
                if (result.id) {
                    this._notification.create(
                        "success",
                        "Successfully Updated",
                        result.name
                    );
                }
                this.isEditVisible = false;
                this.getCourierPriceData();
                this._isSpinning = false;
            },
            error => {
                this._isSpinning = false;
            }
        );
    };
    //Method for showing the edit modal
    showEditModal = (id: number) => {
        this.isEditVisible = true;
        this.id = id;
        this.courierService.getAllCourier().subscribe(result => {
            this.listOfCourier = result;
        });
        this.courierPriceService.getById(id).subscribe(result => {
            this.validateEditForm.patchValue({
                editCourier_id: result.courier_id,
                editName: result.weight,
                editPrice: result.price,
                editRemarks: result.remarks,
            });
        });
    };

    handleEditOk = (e) => {
        this.isConfirmLoading = true;
        setTimeout(() => {
            this.isEditVisible = false;
            this.isConfirmLoading = false;
            this.submitForm;
        }, 2000);
    };

    handleEditCancel = (e) => {
        this.validateEditForm.reset();
        for (const key in this.validateEditForm.controls) {
            this.validateEditForm.controls[key].markAsPristine();
        }
        this.isEditVisible = false;
    };

    //Event method for setting up form in validation
    getFormControl(name) {
        return this.validateForm.controls[name];
    }

    //Event method for setting up edit form in validation
    getEditFormControl(name) {
        return this.validateEditForm.controls[name];
    }
}
