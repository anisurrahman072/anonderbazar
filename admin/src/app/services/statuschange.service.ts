import { HttpClient } from '@angular/common/http';
import { Injectable } from '@angular/core';
import { saveAs } from 'file-saver/src/FileSaver';
import {environment} from "../../environments/environment";
import { AuthService } from './auth.service';

@Injectable({
  providedIn: 'root'
})
export class StatusChangeService {
  private EndPoint = `${environment.API_ENDPOINT}/statuschange`;

  constructor(private http: HttpClient) { }
  updateStatus(data: any) { 
      return this.http.post(`${this.EndPoint}/updatecustom`, data);
  } 
  updateStatusCourier(data: any) { 
    return this.http.post(`${this.EndPoint}/updatecustomcourier`, data);
} 
}
