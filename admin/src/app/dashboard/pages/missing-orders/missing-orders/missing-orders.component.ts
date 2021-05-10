import { Component, OnInit } from '@angular/core';
import {FormBuilder, FormGroup, Validators} from "@angular/forms";
import {OrderService} from "../../../../services/order.service";

@Component({
  selector: 'app-missing-orders',
  templateUrl: './missing-orders.component.html',
  styleUrls: ['./missing-orders.component.css']
})
export class MissingOrdersComponent implements OnInit {

  validateForm: FormGroup;
  foundTransaction: boolean = false;
  submitting: boolean = false;

  constructor(private fb: FormBuilder,
              private orderService: OrderService
              ) { }

  ngOnInit() {
    this.validateForm = this.fb.group({
      username: ['', [Validators.required]],
      ssl_transaction_id: ['', [Validators.required]]
    });
  }

  getFormControl(name) {
    return this.validateForm.controls[name];
  }

  submitForm($event, value) {
    this.submitting = true;
    $event.preventDefault();
    let formData = new FormData();
    formData.append('username', value.username);
    formData.append('ssl_transaction_id', value.ssl_transaction_id);
    this.orderService.findSSLTransaction(formData)
        .subscribe(sslResponse => {
          console.log('Anis', sslResponse);
        })
  }

}
