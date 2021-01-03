import { Component, OnInit, AfterViewChecked, ElementRef, ViewChild } from '@angular/core';

import { AuthService } from '../../../../services/auth.service';
import { ChatService } from '../../../../services/chat.service';
import { UIService } from '../../../../services/ui/ui.service';
import { NzNotificationService } from 'ng-zorro-antd';
import { Subscription } from 'rxjs';
import { FormBuilder, FormGroup, Validators } from '@angular/forms';
import { PaymentAddressService } from '../../../../services/payment-address.service';
import { OrderService } from '../../../../services/order.service';
import {environment} from "../../../../../environments/environment";

@Component({
  selector: 'app-message-client',
  templateUrl: './message-client.component.html',
  styleUrls: ['./message-client.component.css']
})
export class MessageClientComponent implements OnInit, AfterViewChecked {

  @ViewChild('scrollMe') private myScrollContainer: ElementRef;

  listOfUser = [];
  IMAGE_ENDPOINT = environment.IMAGE_ENDPOINT;
  currentWarehouseSubscriprtion: Subscription;
  currentWarehouseId: any;
  listofmessage = [];
  userfullname: string = "Name";
  product: any;
  chatForm: FormGroup;
  currentUserId: any;
  userId: any;
  producttId: any;
  warehouseId: any;
  user: any;
  chatuser: any;
  selectUser: boolean = false;
  fileToUpload: File[] = [];
  isVisible = false;
  style: any = {
    width: '500px'
  };
  validateForm: FormGroup;
  listOfAddresses = [];
  totalPrice: number;
  constructor(private chatService: ChatService,
    private orderService: OrderService,
    private uiService: UIService,
    private _notification: NzNotificationService,
    private paymentAddressService: PaymentAddressService,
    private fb: FormBuilder,
    private authService: AuthService) {
    this.chatForm = this.fb.group({
      message: ["", Validators.required],
      files: [""]
    });

    this.validateForm = this.fb.group({
      product_name: ['', [Validators.required]],
      product_price: ['', [Validators.required]],
      product_quantity: ['', [Validators.required]],
      user_name: ['', [Validators.required]],
      payment_address_id: ['', [Validators.required]]
    })
  }

  ngOnInit() {
    this.currentWarehouseSubscriprtion = this.uiService.currentSelectedWarehouseInfo.subscribe(
      warehouseId => {
        this.currentWarehouseId = warehouseId || '';
      }
    );
    this.getChatUsers();
  }

  ngAfterViewChecked() {
    this.scrollToBottom();
  }

  scrollToBottom(): void {
    try {
      this.myScrollContainer.nativeElement.scrollTop = this.myScrollContainer.nativeElement.scrollHeight;
    } catch (err) { }
  }
  public submitForm = ($event, value) => {
    let person_status = 1;
    const formData: FormData = new FormData();
    formData.append("message", value.message);
    formData.append("person_status", person_status.toString());
    formData.append("chat_user_id", this.chatuser.id);
    if (this.fileToUpload) {
      formData.append('hasFile', 'true');
      formData.append('fileCounter', this.fileToUpload.length.toString());

      for (let i = 0; i < this.fileToUpload.length; i++) {
        formData.append('file' + i, this.fileToUpload[i], this.fileToUpload[i].name);
      }
    } else {
      formData.append('hasFile', 'false');
    }
    this.chatService.insert(formData).subscribe(
      result => {
       
        this.getChatMessages();
        this.chatForm.reset();
        this.fileToUpload = [];
      },
      error => {
      }
    );
  }
  public submitOrderForm = ($event, value) => {
    const formData: FormData = new FormData();
    formData.append("product_id", this.product.id);
    formData.append("price", value.product_price);
    formData.append("quantity", value.product_quantity);
    formData.append("user_id", this.user.id);
    formData.append("payment_address_id", value.payment_address_id);
    formData.append("warehouse_id", this.currentWarehouseId);
    formData.append("current_date", new Date().toDateString());

    this.orderService.customOrder(formData).subscribe(result=>{
      if (result.id) {
          this._notification.create(
            "success",
            "Messaging has been successfully added.",
            result.name
          );
        }
        this.isVisible = false;
    });

  }
  handleFileInput(files: FileList) {
    this.fileToUpload.push(files.item(0));
  }

  removeFile(index: number) {
    this.fileToUpload.splice(index, 1);
  }

  setTotalPrice($event) {
    this.totalPrice = this.product.price * $event.target.value;
    this.validateForm.patchValue({
      product_price: this.totalPrice,
    });
  }
  getChatUsers(): any {
    this.chatService.getAllUser(this.currentWarehouseId).subscribe(result => {
      this.listOfUser = result
    });
  };

  showMessageData(obj: any) {
    console.log(obj);
    this.selectUser = true;
    this.chatuser = obj;
    this.user = obj.user_id;
    this.product = obj.product_id;
    this.userfullname = obj.user_id.first_name + " " + obj.user_id.last_name;
    this.getChatMessages();
  };

  getChatMessages(): any {
    this.chatService.getMessages(this.chatuser.id).subscribe(result => {
      this.listofmessage = result.data;
    });
  }

  showModal(): void {
    this.isVisible = true;
    this.paymentAddressService.getpaymentaddress(this.user.id).subscribe(
      result => {
        this.listOfAddresses = result;
      }
    );

    this.validateForm.patchValue({
      product_name: this.product.name,
      product_price: this.product.price,
      user_name: this.userfullname,
    });
  }

  handleOk(): void {
    console.log('Button ok clicked!');
    this.isVisible = false;
    this.submitOrderForm;
  }

  handleCancel(): void {
    console.log('Button cancel clicked!');
    this.isVisible = false;
  }

  getFormControl(name) {
    return this.validateForm.controls[name];
  }
  resetForm($event: MouseEvent) {
    $event.preventDefault();
    this.validateForm.reset();
    for (const key in this.validateForm.controls) {
      this.validateForm.controls[key].markAsPristine();
    }
  }

}
