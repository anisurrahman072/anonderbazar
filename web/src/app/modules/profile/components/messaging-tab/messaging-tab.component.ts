import { Component, OnInit,AfterViewChecked, ElementRef, ViewChild } from '@angular/core';
import { AppSettings } from '../../../../config/app.config';
import { ChatService } from '../../../../services/chat.service';
import { AuthService } from '../../../../services';
import { FormGroup, FormBuilder, Validators } from '@angular/forms';

@Component({
  selector: "Messaging-tab",
  templateUrl: "./messaging-tab.component.html",
  styleUrls: ["./messaging-tab.component.scss"]
})
/*
* This component is for messaging with vendor
* This part is not added but implimented
*/
export class MessagingTabComponent implements OnInit, AfterViewChecked {
  IMAGE_ENDPOINT: string = AppSettings.IMAGE_ENDPOINT;
  listOfUser = [];
  currentUserId: any;
  user: any;
  product: any;
  warehouse: any;
  listofmessage= [];
  chatForm: FormGroup;
  fileToUpload: File[] = [];

  chatuser: any;
  @ViewChild('scrollMe') private myScrollContainer: ElementRef;
  selectUser: boolean = false;

  constructor(private chatService: ChatService,
    private fb: FormBuilder,
    private authService:AuthService) { 
      this.chatForm = this.fb.group({
        message: ["", Validators.required],
        files: [""]
      });
    }

  ngOnInit() {
    this.currentUserId = this.authService.getCurrentUserId(); 
    this.getAllWarehouse();
  
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
    let person_status = 0; 
    const formData: FormData = new FormData();
    formData.append("message", value.message);
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
    
  };
  handleFileInput(files: FileList) {
    this.fileToUpload.push(files.item(0)); 
  }
  removeFile(index: number) { 
    this.fileToUpload.splice(index, 1);
  }
  getAllWarehouse(){
    this.chatService.getAllWarehouse(this.currentUserId).subscribe(result =>{ 
      this.listOfUser = result
    });
  }

  showMessageData(obj: any) { 
    this.selectUser = true;
    this.chatuser = obj;
    this.user = obj.user_id;
    this.product = obj.product_id;
    this.warehouse = obj.warehouse_id;
    this.getChatMessages();
  }
  getChatMessages(): any {
    this.chatService.getMessages(this.chatuser.id).subscribe(result => { 
      this.listofmessage = result.data;
    });
  }
;
}
