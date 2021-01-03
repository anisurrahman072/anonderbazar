import { Injectable } from '@angular/core';
import { Http, Headers, RequestOptions, Response } from '@angular/http';


import { Observable } from 'rxjs';
import { AuthService } from './auth.service';
import { HttpClient } from '@angular/common/http';
import {environment} from "../../environments/environment";

@Injectable({
  providedIn: 'root'
})
export class ChatService {

  private EndPoint1 = `${environment.API_ENDPOINT}/chat`;
  private EndPoint2 = `${environment.API_ENDPOINT}/chats`;
  private EndPoint3 = `${environment.API_ENDPOINT}/chatuser`;
  constructor(private http: HttpClient,
    private authenticationService: AuthService) { }

  getAllChatByWarehouse(currentWarehouseId: number): Observable<any> {
    return this.http.get(`${this.EndPoint3}/getNotification?deletedAt=null&warehouse_id=${currentWarehouseId}`);
  }
  getAllUserWithWarehouseId(currentWarehouseId: number): Observable<any> {
    return this.http.get(`${this.EndPoint1}?where={"deletedAt":null,"notification_view_status":1,"warehouse_id":${currentWarehouseId}}`);
  }
  getAllUser(currentWarehouseId: number): Observable<any> {
    return this.http.get(`${this.EndPoint3}?where={"deletedAt":null,"warehouse_id":${currentWarehouseId}}`);
  }

  getMessages(chat_user_id: number): Observable<any> {
    return this.http.get(`${this.EndPoint2}/getAllMessages?deletedAt=null&chat_user_id=${chat_user_id}`);

  }
  checkChatUser(userId: any, producttId: any, warehouseId: any): any {
    return this.http.get(`${this.EndPoint3}?where={"deletedAt":null,"user_id":${userId},"product_id":${producttId},"warehouse_id":${warehouseId}}`);
  }
  createChatUser(formData: FormData): any {
    return this.http.post(this.EndPoint3, formData)
      .map((response) => response);
  }
  
  insert(formData: FormData): Observable<any> {
    return this.http.post(this.EndPoint1, formData)
      .map((response) => response);
  }
}
