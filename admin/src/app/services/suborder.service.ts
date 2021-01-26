import { Injectable } from "@angular/core";
import { Observable } from "rxjs";
import { AuthService } from "./auth.service";
import { HttpClient } from "@angular/common/http";
import {environment} from "../../environments/environment";

@Injectable({
  providedIn: 'root'
})
export class SuborderService {
  private EndPoint = `${environment.API_ENDPOINT}/suborder`;
  private EndPoint2 = `${environment.API_ENDPOINT}/suborders`;

  constructor(
    private http: HttpClient,
    private authenticationService: AuthService
  ) {}

  getAll(): Observable<any> {
    return this.http.get(this.EndPoint + '?where={"deletedAt":null}');
  }
  getSuborder(
    warehouseId: string,
    status: number,
    sortPrice: String
  ): Observable<any> {
    if (warehouseId == null || warehouseId == "" ) {
      return this.http.get(
        `${this.EndPoint +
          "/getSuborder"}?status=${status}&sortPrice=${sortPrice}`
      );
    } else {
      return this.http.get(
        `${this.EndPoint +
          "/getSuborder"}?warehouse_id=${warehouseId}&status=${status}&sortPrice=${sortPrice}`
      );
    }
  }

  getSuborderWithDate(
    warehouseId: string,
    status: number,
    date: string,
    sortPrice: String
  ): Observable<any> {
      return this.http.get(
        `${this.EndPoint +
          "/getSuborderWithDate"}?warehouse_id=${warehouseId}&status=${status}&date=${date}&sortPrice=${sortPrice}`
      );
  }

  getAllsuborder(
    warehouseId:number,
    page: number,
    limit: number,
    suborderNumberSearchValue: number,
    orderNumberSearchValue: string,
    suborderIdValue: string,
    quantitySearchValue: string,
    totalPriceSearchValue: string,
    dateSearchValue: any,
    statusSearchValue: string,
    categoryId: number,
    subcategoryId: number,
    sortName: string,
    sortPrice: String
  ): Observable<any> {
    return this.http.get(
      `${
        this.EndPoint2
      }?warehouse_id=${warehouseId}&page=${page}&limit=${limit}&suborderNumberSearchValue=${suborderNumberSearchValue}&orderNumberSearchValue=${orderNumberSearchValue}&suborderIdValue=${suborderIdValue}&quantitySearchValue=${quantitySearchValue}&totalPriceSearchValue=${totalPriceSearchValue}&dateSearchValue=${dateSearchValue}&statusSearchValue=${statusSearchValue}&category_id=${categoryId}&subcategory_id=${subcategoryId}&sortName=${sortName}&sortPrice=${sortPrice}`
    );
  }

  getAllSuborderWithPR(
    warehouseId:number,
    page: number,
    limit: number,
    suborderNumberSearchValue: number,
    orderNumberSearchValue: string,
    suborderIdValue: string,
    quantitySearchValue: string,
    totalPriceSearchValue: string,
    dateSearchValue: any,
    statusSearchValue: string,
    categoryId: number,
    subcategoryId: number,
    sortName: string,
    sortPrice: String
  ): Observable<any> {

    return this.http.get(
      `${
        this.EndPoint2
      }?PR_status=0&warehouse_id=${warehouseId}&page=${page}&limit=${limit}&suborderNumberSearchValue=${suborderNumberSearchValue}&orderNumberSearchValue=${orderNumberSearchValue}&suborderIdValue=${suborderIdValue}&quantitySearchValue=${quantitySearchValue}&totalPriceSearchValue=${totalPriceSearchValue}&dateSearchValue=${dateSearchValue}&statusSearchValue=${statusSearchValue}&category_id=${categoryId}&subcategory_id=${subcategoryId}&sortName=${sortName}&sortPrice=${sortPrice}`
    );

  }

  getAllByOrderId(id): Observable<any> {
    return this.http.get(
      `${this.EndPoint}?where={"deletedAt":null,"product_order_id":${id}}`
    );
  }

  getById(id): Observable<any> {
    return this.http.get(this.EndPoint + "/getWithFull/" + id);
  }

  insert(data): Observable<any> {
    return this.http.post(this.EndPoint, data);
  }

  delete(id): Observable<any> {
    // get users from api
    return this.http.delete(`${this.EndPoint}/${id}`);
  }

  update(id: number, data: any) {
    return this.http.put(`${this.EndPoint}/${id}`, data);
  }

  updateByOrderId(id: number, data: any) {
    return this.http.put(`${this.EndPoint}/updatebyorderid/${id}`, data);
  }
}
