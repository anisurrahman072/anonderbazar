import { Injectable } from '@angular/core';
import {BehaviorSubject} from "rxjs/BehaviorSubject";

@Injectable()
export class PartialPaymentModalService {

  private partialPaymentInfo= new BehaviorSubject<boolean>(false);
  currentPartialPaymentInfo = this.partialPaymentInfo.asObservable();
  private partialPaymentOrderInfo = new BehaviorSubject<number>(null);
  currentOrderId = this.partialPaymentOrderInfo.asObservable();

  constructor() { }

  showPartialModal(message: boolean, id: number) {
    this.partialPaymentInfo.next(message);
    this.partialPaymentOrderInfo.next(id);
  }

  getPartialModalInfo(){
    return this.currentOrderId;
  }

}
