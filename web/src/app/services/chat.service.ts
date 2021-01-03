import {Injectable} from '@angular/core';
import {Http, Headers, RequestOptions, Response} from '@angular/http';
import 'rxjs/add/operator/map';
import {Observable} from 'rxjs/Observable';
import {AuthService} from './auth.service';
import {AppSettings} from '../config/app.config';
import {HttpClient} from '@angular/common/http';

@Injectable()
export class ChatService {
  private EndPoint1 = `${AppSettings.API_ENDPOINT}/chat`;
  private EndPoint2 = `${AppSettings.API_ENDPOINT}/chats`;
  private EndPoint3 = `${AppSettings.API_ENDPOINT}/chatuser`;

  constructor(private http: HttpClient,
    private authenticationService: AuthService) { }

    getAllChatByUserId(messageid):Observable<any>{ 
      return this.http.get(`${this.EndPoint2}/getAllMessages?deletedAt=null&chat_user_id=${messageid}`);
    }
    getAllWithUserId(currentUserId: any): any {
      return this.http.get(`${this.EndPoint1}?where={"deletedAt":null,"notification_view_status":1,"user_id":${currentUserId}}`);
    }
    getAllWarehouse(currentUserId: any): any {
      return this.http.get(`${this.EndPoint3}?where={"deletedAt":null,"user_id":${currentUserId}}`);
    }
    getAllUserWithWarehouseId(currentWarehouseId: number): Observable<any> {
      return this.http.get(`${this.EndPoint1}?where={"deletedAt":null,"notification_view_status":1,"warehouse_id":${currentWarehouseId}}`); 
    }

    getMessages(chat_user_id: any): any {
      return this.http.get(`${this.EndPoint2}/getAllMessages?deletedAt=null&chat_user_id=${chat_user_id}`); 
    }

    checkChatUser(userId: any, producttId: any, warehouseId: any): any {
      return this.http.get(`${this.EndPoint3}?where={"deletedAt":null,"user_id":${userId},"product_id":${producttId},"warehouse_id":${warehouseId}}`);
    }
    createChatUser(formData:FormData): any {
      return this.http.post(this.EndPoint3, formData)
      .map((response) => response);
    }
    insert(formData:FormData){
      return this.http.post(this.EndPoint1, formData)
      .map((response) => response);
    }
}
