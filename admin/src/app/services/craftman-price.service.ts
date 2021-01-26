import { Injectable } from '@angular/core';
import { Observable } from 'rxjs';
import { AuthService } from './auth.service';
import { HttpClient } from '@angular/common/http';
import {environment} from "../../environments/environment";

@Injectable({
  providedIn: 'root'
})
export class CraftmanPriceService {
  private EndPoint = `${environment.API_ENDPOINT}/craftmanprice`;
  private EndPoint2 = `${environment.API_ENDPOINT}/craftmanprices`;

  constructor(
    private http: HttpClient,
    private authenticationService: AuthService
  ) {}

  getAll(): Observable<any> {
    return this.http.get(this.EndPoint + '?where={"deletedAt":null}');
  }

  getById(id): Observable<any> {
    return this.http.get(this.EndPoint + '/' + id);
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

  getByCraftmanId(id) {
    return this.http.get(
      `${this.EndPoint}?where={"craftman_id": ${id}, "deletedAt":null}`
    );
  }

  getAllCraftmanPrice(
    page: number,
    limit: number,
    nameSearchValue: number,
    productClassSearchValue: string,
    categorySearchValue: string,
    subCategorySearchValue: string,
    partSearchValue: string,
    genreSearchValue: string,
    designCategorySearchValue: string,
    designSubcategorySearchValue: string,
    designSearchValue: string,
    priceSearchValue: string,
    timeSearchValue: string,
    categoryId: number,
    subcategoryId: number,
    sortName: string,
    sortPrice: String
  ): Observable<any> {
    return this.http.get(
      `${
        this.EndPoint2
      }?page=${page}&limit=${limit}&nameSearchValue=${nameSearchValue}&productClassSearchValue=${productClassSearchValue}&categorySearchValue=${categorySearchValue}&subCategorySearchValue=${subCategorySearchValue}&partSearchValue=${partSearchValue}&genreSearchValue=${genreSearchValue}&designCategorySearchValue=${designCategorySearchValue}&designSubcategorySearchValue=${designSubcategorySearchValue}&designSearchValue=${designSearchValue}&priceSearchValue=${priceSearchValue}&timeSearchValue=${timeSearchValue}&category_id=${categoryId}&subcategory_id=${subcategoryId}&sortName=${sortName}&sortPrice=${sortPrice}`
    );
  }
  getAllCraftmanPriceByCraftsmanId(
    warehouseId: number,
    page: number,
    limit: number,
    nameSearchValue: number,
    productClassSearchValue: string,
    categorySearchValue: string,
    subCategorySearchValue: string,
    partSearchValue: string,
    genreSearchValue: string,
    designCategorySearchValue: string,
    designSubcategorySearchValue: string,
    designSearchValue: string,
    priceSearchValue: string,
    timeSearchValue: string,
    categoryId: number,
    subcategoryId: number,
    sortName: string,
    sortPrice: String
  ): Observable<any> {
    return this.http.get(
      `${
        this.EndPoint2
      }?warehouse_id=${warehouseId}&page=${page}&limit=${limit}&nameSearchValue=${nameSearchValue}&productClassSearchValue=${productClassSearchValue}&categorySearchValue=${categorySearchValue}&subCategorySearchValue=${subCategorySearchValue}&partSearchValue=${partSearchValue}&genreSearchValue=${genreSearchValue}&designCategorySearchValue=${designCategorySearchValue}&designSubcategorySearchValue=${designSubcategorySearchValue}&designSearchValue=${designSearchValue}&priceSearchValue=${priceSearchValue}&timeSearchValue=${timeSearchValue}&category_id=${categoryId}&subcategory_id=${subcategoryId}&sortName=${sortName}&sortPrice=${sortPrice}`
    );
  }
}
