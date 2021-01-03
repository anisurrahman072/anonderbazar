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
  constructor(
    private http: HttpClient,
    private authenticationService: AuthService
  ) { }

  getImageWithCombination(combination:string,product_id:number):Observable<any>{ 
    return this.http.get(`${this.EndPoint2}/getSingleByProductId/${product_id}?combination=${combination}`) 
  }

}
