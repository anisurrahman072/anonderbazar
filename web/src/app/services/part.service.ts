import {Injectable} from '@angular/core';
import 'rxjs/add/operator/map';
import {Observable} from 'rxjs/Observable';
import {AppSettings} from '../config/app.config';
import {HttpClient} from '@angular/common/http';
import {Cart} from "../models";
import {catchError} from "rxjs/operators";

@Injectable()
export class PartService {
  
  private EndPoint = `${AppSettings.API_ENDPOINT}/parts`;
  private EndPoint2 = `${AppSettings.API_ENDPOINT}/designimages`;

  constructor(private http: HttpClient) { }

  getAllParts():Observable<any>{
    return this.http.get(this.EndPoint + '/getAll?where={"deletedAt":null}')
            .map((response) => response);
  }

  getAllCombinationByProductId(id: any): any {
    return this.http.get(`${this.EndPoint2}/getAllByProductId/${id}`);
  }

}
