import { Component, OnInit, QueryList, ViewChildren } from '@angular/core';
import { CourierService } from '../../../../services/courier.service';
import { Subscription } from 'rxjs';
import { UIService } from '../../../../services/ui/ui.service';
import { FormGroup, FormBuilder, Validators } from '@angular/forms';
import { ActivatedRoute } from '@angular/router';
import { NzNotificationService } from 'ng-zorro-antd';


@Component({
  selector: 'app-courier',
  templateUrl: './courier.component.html',
  styleUrls: ['./courier.component.css']
})
export class CourierComponent implements OnInit {
  status: any;
  limit: number = 10;
  page: number = 1;
  total: number;
  data: any = [];
  _isSpinning: boolean = true;
  isVisible = false;
  isEditVisible = false;
  isConfirmLoading = false;
  id: number;
  options = [
    { value: 1, label: 'Local' },
    { value: 2, label: 'Origin Country' }, 
  ];
  origins = ['Local', 'Origin Country'];
  validateForm: FormGroup;
  validateEditForm: FormGroup;

  constructor(
    private fb: FormBuilder,
    private courierService: CourierService,
    private _notification: NzNotificationService) {
    this.validateForm = this.fb.group({
      name: ["", [Validators.required]],
      origin_type: ["", [Validators.required]],
    });

    this.validateEditForm = this.fb.group({
      name: ["", [Validators.required]],
      origin_type: ["", [Validators.required]],
    });
   }
  courierOriginChange($event) { 
  }
  // init the component
  ngOnInit() {
   this.getPageData();
  }
  changePage(page: number, limit: number) {
    this.page = page;
    this.limit = limit;
    this.getPageData();
    return false;
  }
  //Event method for getting all the data for the page
  getPageData(){
    this.courierService.getAllCourier()
    .subscribe(result => {this.data = result; this._isSpinning = false;});
  }
  //Event method for deleting courier
  deleteConfirm(id) {
    this.courierService.delete(id).subscribe(result => { 
      this.getPageData(); 
      this._notification.create('warning', 'Delete', 'Courier has been removed successfully');

    });
  }
  //Event method for submitting the form
  submitForm = ($event, value) => {
    $event.preventDefault();
    for (const key in this.validateForm.controls) {
      this.validateForm.controls[key].markAsDirty();
    } 
    const formData: FormData = new FormData();
    formData.append("name", value.name);
    formData.append("origin_type", value.origin_type);
    this.courierService.insertCourier(formData).subscribe(
      result => {
        if (result.id) {
          this._notification.create(
            "success",
            "Courier has been successfully added.",
            result.name
          );
        }
        this.isVisible = false;
        this.getPageData();
        this.resetAllFilter();
      },
      error => {
        this._isSpinning = false;
      }
    );
  };
  //Event method for resetting all filters
  resetAllFilter() {
    this.limit = 10;
    this.page = 1;
    this.getPageData();
  }
  //Method for showing the modal
  showModal = () => {
    this.isVisible = true;
    this.isEditVisible = false;
  };

  handleOk = (e) => {
    this.isConfirmLoading = true;
    setTimeout(() => {
      this.isVisible = false;
      this.isConfirmLoading = false; 
    }, 2000);
  };

  handleCancel = (e) => {
    this.isVisible = false;
    this.validateForm.reset();
    for (const key in this.validateForm.controls) {
      this.validateForm.controls[key].markAsPristine();
    }
  };
  //Event method for setting up form in validation
  getFormControl(name) {
    return this.validateForm.controls[name];
  }

  handleEditOk = (e) => {
    this.isConfirmLoading = true;
    setTimeout(() => {
      this.isEditVisible = false;
      this.isConfirmLoading = false;
      this.submitForm;
    }, 2000);
  };
  //Method for showing the edit modal
  showEditModal = (id: number) => {
    this.isEditVisible = true;
    this.id = id;
    this.courierService.getCourierById(this.id).subscribe(result => {
      this.validateEditForm.patchValue({
        name: result[0].name,
        origin_type: result[0].origin_type,
      });
    });
  };
  //Event method for submitting the edit form
  submitEditForm = ($event, value) => {
    $event.preventDefault();
    for (const key in this.validateForm.controls) {
      this.validateEditForm.controls[key].markAsDirty();
    } 
    const formData: FormData = new FormData();
    formData.append("name", value.name);
    formData.append("origin_type", value.origin_type);

    this.courierService.updateCourier(this.id, formData).subscribe(
      result => {
        if (result.id) {
          this._notification.create(
            "success",
            "Courier has been updated successfully",
            result.name
          );
        }
        this.isEditVisible = false;
        this.getPageData();
      },
      error => {
        this._isSpinning = false;
      }
    );
  };
  handleEditCancel = (e) => {
    this.validateEditForm.reset();
    for (const key in this.validateEditForm.controls) {
      this.validateEditForm.controls[key].markAsPristine();
    }
    this.isEditVisible = false;
  };
//Event method for setting up edit form in validation
  getEditFormControl(name) {
    return this.validateEditForm.controls[name];
  }

}
