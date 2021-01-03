import { Component, OnInit } from '@angular/core';

import { AuthService } from '../../../../services/auth.service';
import { NzNotificationService } from 'ng-zorro-antd';
import { FormBuilder, FormGroup, Validators } from "@angular/forms";
import { Subscription } from 'rxjs';
import { UIService } from '../../../../services/ui/ui.service';
import { ActivatedRoute } from "@angular/router";
import { EventPriceService } from '../../../../services/event-price.service';

@Component({
  selector: 'app-event-price-list',
  templateUrl: './event-price-list.component.html',
  styleUrls: ['./event-price-list.component.css']
})
export class EventPriceListComponent implements OnInit {
  status: any;
  limit: number = 10;
  page: number = 1;
  total: number;
  data: any = [];
  _isSpinning: boolean = false;
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
  constructor(private route: ActivatedRoute,
    private uiService: UIService,
    private fb: FormBuilder,
    private _notification: NzNotificationService,
    private eventPriceService: EventPriceService) {
    this.validateForm = this.fb.group({
      name: ["", [Validators.required]],
      price: [""],
      remarks: [""],
    });

    this.validateEditForm = this.fb.group({
      editName: ["", [Validators.required]],
      editPrice: [""],
      editRemarks: [""],
    });
  }
 // init the component
  ngOnInit() {
    this.getEventPriceData();
  }
  //Event method for getting all the data for the page
  getEventPriceData(): void {
    this.eventPriceService
      .getAllEventsByStatus(
        this.page,
        this.limit
      )
      .subscribe(
        result => {
          this.data = result.data;
          this.total = result.total;
          this._isSpinning = false;
          // temporary
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
    this.getEventPriceData();
    return false;
  }

  //Event method for resetting all filters
  resetAllFilter() {
    this.limit = 10;
    this.page = 1;
    this.getEventPriceData();
  }
  //Event method for deleting event price
  deleteConfirm(index, id) {
    this.eventPriceService.delete(id).subscribe(result => {

      this.getEventPriceData();
      this._notification.create(
        'Success',
        'Event price has been removed successfully',
        ''
      );
    });
  }
    //Method for showing the modal
  showModal = () => {
    this.isVisible = true;
    this.isEditVisible = false;
  };
      //Method for showing the edit modal
  showEditModal = (id: number) => {
    this.isEditVisible = true;
    this.id = id;
    this.eventPriceService.getById(id).subscribe(result => {
      this.editName = result.name;
      this.editPrice = result.price;
      this.editRemarks = result.remarks;
    });
  };
  //Event method for submitting the form
  submitForm = ($event, value) => {
    $event.preventDefault();
    for (const key in this.validateForm.controls) {
      this.validateForm.controls[key].markAsDirty();
    }

    const formData: FormData = new FormData();
    formData.append("name", value.name);
    formData.append("price", value.price);
    formData.append("remarks", value.remarks);

    this.eventPriceService.insert(formData).subscribe(
      result => {
        if (result.id) {
          this._notification.create(
            "success",
            "New price has been successfully added.",
            result.name
          );
        }
        this.isVisible = false;
        this.getEventPriceData();
      },
      error => {
        this._isSpinning = false;
      }
    );
  };
  //Event method for submitting the edit form
  submitEditForm = ($event, value) => {
    $event.preventDefault();
    for (const key in this.validateForm.controls) {
      this.validateForm.controls[key].markAsDirty();
    }

    const formData: FormData = new FormData();
    formData.append("name", value.editName);
    formData.append("price", value.editPrice);
    formData.append("remarks", value.editRemarks);

    this.eventPriceService.update(this.id, formData).subscribe(
      result => {
        if (result.id) {
          this._notification.create(
            "success",
            "New event price has been successfully added.",
            result.name
          );
        }
        this.isEditVisible = false;
        this.getEventPriceData();
      },
      error => {
        this._isSpinning = false;
      }
    );
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
  handleEditOk = (e) => {
    this.isConfirmLoading = true;
    setTimeout(() => {
      this.isEditVisible = false;
      this.isConfirmLoading = false;
      this.submitForm;
    }, 2000);
  };

  handleEditCancel = (e) => {
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
