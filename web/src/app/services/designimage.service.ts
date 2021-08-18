import { Injectable } from "@angular/core";

import "rxjs/add/operator/map";

import { Observable } from "rxjs/Observable";
import { AuthService } from "./auth.service";
import { AppSettings } from "../config/app.config";
import { HttpClient } from "@angular/common/http";
@Injectable()
export class DesignimageService {
  private EndPoint = `${AppSettings.API_ENDPOINT}/designimage`;
  private EndPoint2 = `${AppSettings.API_ENDPOINT}/designimages`;
  private EndPoint3 = `${AppSettings.API_ENDPOINT}/image`;
  constructor(
    private http: HttpClient,
    private authenticationService: AuthService
  ) { }

  getImageWithCombination(combination:string,product_id:number):Observable<any>{
    return this.http.get(`${this.EndPoint2}/getSingleByProductId/${product_id}?combination=${combination}`)
  }

  insertImage(data): Observable<any> {
    return this.http.put(`${this.EndPoint3}/insert-image`, data);
  }

  deleteImage(data): Observable<any> {
    return this.http.put(`${this.EndPoint3}/delete-image`, data);
  }

}
