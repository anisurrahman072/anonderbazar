import {Injectable} from '@angular/core';
import 'rxjs/add/operator/map';
import {Observable} from 'rxjs/Observable';
import {AppSettings} from '../config/app.config';
import {HttpClient} from '@angular/common/http';
import {DatePipe} from '@angular/common';
import {response} from "express";

@Injectable()
export class ProductService {
    private EndPoint = `${AppSettings.API_ENDPOINT}/product`;
    private EndPoint2 = `${AppSettings.API_ENDPOINT}/products`;
    private allFlashDealsProducts = null;

    constructor(private http: HttpClient) {
        this.getFlashDealsProducts();
    }

    filter_result(searchTerm: string, typeList: number[], categoryList: number[], warehouses: number[], craftsmanList: number[], subcategoryList: number[], brandList: number[], subsubcategoryList: number[], priceRange: number[], sortTitle: string, sortTerm: String, pageno: number, limit: number, isFeatured: any = null): Observable<any> {

        const searchTermEncoded = encodeURIComponent(searchTerm);

        /*console.log('searchTerm', searchTermEncoded);*/
        let url = `${this.EndPoint2}/search?filters={"searchTerm":"${searchTermEncoded}", "approval_status": 2, "typeList":[${categoryList}],"categoryList":[${subcategoryList}], "brandList":[${brandList}], "warehousesList":[${warehouses}],"subcategoryList":[${subsubcategoryList}], "craftsmanList":[${craftsmanList}], "priceRange":[${priceRange}]}&sortTitle=${sortTitle}&sortTerm=${sortTerm}&limit=${limit}&page=${pageno}`;
        if (isFeatured !== null) {
            url = `${this.EndPoint2}/search?filters={"searchTerm":"${searchTermEncoded}", "approval_status": 2, "featured": ${isFeatured}, "typeList":[${categoryList}], "categoryList":[${subcategoryList}], "brandList":[${brandList}], "warehousesList":[${warehouses}],"subcategoryList":[${subsubcategoryList}], "craftsmanList":[${craftsmanList}], "priceRange":[${priceRange}]}&sortTitle=${sortTitle}&sortTerm=${sortTerm}&limit=${limit}&page=${pageno}`;
        }
        return this.http.get(url);
    }

    getAllPromotionProduct(): Observable<any> {
        let pipe = new DatePipe('en-US'); // Use your own locale
        const now = Date.now();
        const date = pipe.transform(now, 'yyyy-MM-dd');
        return this.http
            .get(this.EndPoint + '?where={"deletedAt":null, "approval_status": 2 ,"promotion":1,"end_date":{">=":"' + date + '"}}&sort=createdAt%20DESC&populate=false')
            .map(response => response);
    }

    getById(id): Observable<any> {
        return this.http.get(this.EndPoint + '/' + id + '?populate=false').map(response => response);
    }

    getByIds(ids): Observable<any> {
        const url = `${this.EndPoint}/byIds?ids=${JSON.stringify(ids)}&populate=false`;
        // console.log('getByIds', url);

        return this.http.get(url).map(response => response);
    }

    getByIdWithPopulate(id): Observable<any> {
        return this.http.get(this.EndPoint + '/' + id).map(response => response);
    }

    getByIdWithDetails(id): Observable<any> {
        return this.http.get(this.EndPoint + '/details/' + id).map(response => response);
    }

    insert(data): Observable<any> {
        return this.http.post(this.EndPoint, data).map(response => response);
    }

    delete(id): Observable<any> {
        // get users from api
        return this.http.delete(`${this.EndPoint}/${id}`).map(response => response);
    }

    update(id: number, data: any) {
        return this.http
            .put(this.EndPoint + '/' + id, data)
            .map(response => response);
    }

    canRateProduct(userID, productID): Observable<any> {
        return this.http.get(this.EndPoint + `/canRateProduct?userID=${userID}&productID=${productID}`)
            .map(response => response);
    }

    getAllByWarehouseId(id): Observable<any> {
        return this.http
            .get(`${this.EndPoint}?where={"deletedAt":null,"warehouse_id":${id}, "approval_status": 2 }&sort=createdAt%20DESC`)
            .map(response => response);
    }

    getAllFeatureProducts(): Observable<any> {
        return this.http
            .get(this.EndPoint + '?where={"deletedAt":null, "featured":1, "approval_status": 2 }&sort=createdAt%20DESC')
            .map(response => response);
    }

    getFlashDealsProducts(): Observable<any> {
        return this.http.get(this.EndPoint + '?where={"deletedAt":null, "featured":1, "approval_status": 2 }&sort=createdAt%20DESC');
    }

    getRewardProducts(): Observable<any> {
        return this.http
            .get(this.EndPoint + '?where={"deletedAt":null, "approval_status": 2 }&limit=4&sort=createdAt%20DESC')
            .map(response => response);
    }

    getWholeSaleProducts(): Observable<any> {
        return this.http
            .get(this.EndPoint + '?where={"deletedAt":null, "approval_status": 2 }&limit=4&sort=createdAt%20DESC')
            .map(response => response);
    }

    getFeedbackProducts(): Observable<any> {
        return this.http
            .get(this.EndPoint + '/getFeedbackProducts?approval_status=2&limit=4')
            .map(response => response);
    }

    getTopSellProducts(from, pagination = {page: null, limit: null}): Observable<any> {
        let _url = `${this.EndPoint}/getTopSellProducts?from=${from}`;
        if (pagination.page && pagination.limit) {
            _url += `&page=${pagination.page}&limit=${pagination.limit}`;
        }
        return this.http.get(_url);
    }

    getNewProducts(): Observable<any> {
        return this.http
            .get(this.EndPoint + '/getNewProducts?featured=0&approval_status=2')
            .map(response => response);
    }

    getRecommendedProducts(limit, offset): Observable<any> {
        return this.http
            .get(`${this.EndPoint}/getRecommendedProducts?approval_status=2&limit=${limit}&skip=${offset}`)
            .map(response => response);
    }

    getAllHotProducts(): Observable<any> {
        return this.http
            .get(this.EndPoint + '?where={"deletedAt":null, "approval_status": 2 }&sort=createdAt%20DESC')
            .map(response => response);
    }

    getByCategory(catId: number, subCatID: number, limit: number, page: number): Observable<any> {
        return this.http
            /*.get(`${this.EndPoint}?where={"deletedAt":null, "approval_status": 2,"category_id":${catId},"subcategory_id":${subCatID}}&sort=createdAt%20DESC&limit=${limit}&page=${page}`)*/
            .get(`${this.EndPoint}/getByCategory?category_id=${catId}&subcategory_id=${subCatID}&limit=${limit}&page=${page}`)
            .map(response => response);
    }

    getByType(): Observable<any> {
        return this.http.get(this.EndPoint + '/withproducttype').map(response => response);
    }

    getByMostSellingWarehouse(): Observable<any> {
        return this.http.get(this.EndPoint + '/mostSellingWarehouse').map(response => response);
    }

    getByMostSellingProduct(): Observable<any> {
        return this.http.get(this.EndPoint + '/mostSellingProduct').map(response => response);
    }

    getMinPrice(): Observable<any> {
        return this.http.get(`${this.EndPoint}/minPrice`).map(response => response);
    }

    getMaxPrice(): Observable<any> {
        return this.http.get(`${this.EndPoint}/maxPrice`).map(response => response);
    }

    sendRating(data): Observable<any> {
        return this.http
            .post(`${this.EndPoint}/saveRating?product_id=${data.productId}&rating=${data.rating}&review=${data.review}&userId=${data.userId}`, data)
            .map(response => response);
    }

    sendQuestion(data): Observable<any> {
        return this.http
            .post(`${this.EndPoint}/saveQuestion?userId=${data.userId}&product_id=${data.productId}&question=${data.question}`, data)
            .map(response => response);
    }

    serach_result(data: any): Observable<any> {

        const searchTerm = encodeURIComponent(data);
        return this.http
            .get(`${this.EndPoint2}/getbysearchterm?searchterm=${searchTerm}`)
            .map(response => response);
    }

    getAvailableDate(product: any, quantity: number): Observable<any> {
        return this.http
            .post(`${this.EndPoint}/getAvailableDate`, {
                product: product,
                quantity: quantity
            })
            .map(response => response);
    }

    getAllByBrandId(brand_id: number): Observable<any> {
        return this.http
            .get(`${this.EndPoint}/getAllByBrandId?brand_id=${brand_id}`)
            .map(response => response);
    }

    getCountByBrandIds(requestFrom, brand_ids: number[]): Observable<any> {
        return this.http
            .get(`${this.EndPoint}/getCountByBrandIds?brand_ids=${brand_ids}&requestFrom=${requestFrom}`)
            .map(response => response);
    }
}
