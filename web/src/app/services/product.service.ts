import {Injectable} from '@angular/core';
import 'rxjs/add/operator/map';
import {Observable} from 'rxjs/Observable';
import {AppSettings} from '../config/app.config';
import {HttpClient} from '@angular/common/http';
import {DatePipe} from '@angular/common';

@Injectable()
export class ProductService {
    private EndPoint = `${AppSettings.API_ENDPOINT}/product`;
    private EndPoint2 = `${AppSettings.API_ENDPOINT}/products`;

    constructor(private http: HttpClient) {
    }

    getAll(
        option: {
            status?: number;
        } = {}
    ): Observable<any> {
        let status = option.status ? `status=${option.status}&approval_status=2&sort=createdAt%20DESC` : `approval_status=2&sort=createdAt%20DESC`;

        return this.http.get(this.EndPoint2 + '?' + status);
    }

    filter_result(searchTerm: string, typeList: number[], categoryList: number[], warehouses: number[], craftsmanList: number[], subcategoryList: number[], brandList: number[], subsubcategoryList: number[], priceRange: number[], sortTitle: string, sortTerm: String, pageno: number, isFeatured: any = null): Observable<any> {

        const searchTermEncoded = encodeURI(searchTerm);

        let url = `${this.EndPoint2}/search?filters={"searchTerm":"${searchTermEncoded}", "approval_status": 2, "typeList":[${categoryList}],"categoryList":[${subcategoryList}], "brandList":[${brandList}], "warehousesList":[${warehouses}],"subcategoryList":[${subsubcategoryList}], "craftsmanList":[${craftsmanList}], "priceRange":[${priceRange}]}&sortTitle=${sortTitle}&sortTerm=${sortTerm}&limit=500&page=${pageno}`;
        if (isFeatured !== null) {
            url = `${this.EndPoint2}/search?filters={"searchTerm":"${searchTermEncoded}", "approval_status": 2, "featured": ${isFeatured}, "typeList":[${categoryList}], "categoryList":[${subcategoryList}], "brandList":[${brandList}], "warehousesList":[${warehouses}],"subcategoryList":[${subsubcategoryList}], "craftsmanList":[${craftsmanList}], "priceRange":[${priceRange}]}&sortTitle=${sortTitle}&sortTerm=${sortTerm}&limit=500&page=${pageno}`;
        }
        return this.http.get(url);
    }

    getAllPromotionProduct(): Observable<any> {
        let pipe = new DatePipe('en-US'); // Use your own locale
        const now = Date.now();
        const date = pipe.transform(now, 'yyyy-MM-dd');
        return this.http
            .get(this.EndPoint + '?where={"deletedAt":null, "approval_status": 2 ,"promotion":1,"end_date":{">=":"' + date + '"}}&sort=createdAt%20DESC')
            .map(response => response);
    }

    getAllRatingProduct(): Observable<any> {
        return this.http
            .get(this.EndPoint + '?where={"deletedAt":null, "approval_status": 2 }&limit=3&sort="rating%20DESC"')
            .map(response => response);
    }

    getById(id): Observable<any> {
        return this.http.get(this.EndPoint + '/' + id).map(response => response);
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

    getAllByWarehouseId(id): Observable<any> {
        return this.http
            .get(`${this.EndPoint}?where={"deletedAt":null,"warehouse_id":${id}, "approval_status": 2 }&sort=createdAt%20DESC`)
            .map(response => response);
    }

    getAllByCategoryId(id): Observable<any> {
        return this.http
            .get(`${this.EndPoint}?where={"deletedAt":null,"category_id":${id}, "approval_status": 2 }&sort=createdAt%20DESC`)
            .map(response => response);
    }

    getAllFeatureProducts(): Observable<any> {
        return this.http
            .get(this.EndPoint + '?where={"deletedAt":null, "featured":1, "approval_status": 2 }&sort=createdAt%20DESC')
            .map(response => response);
    }

    getFlashDealsProducts(): Observable<any> {
        return this.http
            .get(this.EndPoint + '?where={"deletedAt":null, "featured":1, "approval_status": 2 }&limit=4&sort=createdAt%20DESC')
            .map(response => response);
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
            .get(this.EndPoint + '?where={"deletedAt":null, "approval_status": 2 }&limit=4&sort=rating%20DESC')
            .map(response => response);
    }

    getNewProducts(): Observable<any> {
        return this.http
            .get(this.EndPoint + '?where={ "deletedAt":null, "featured":0, "approval_status": 2 }&limit=4&sort=createdAt%20DESC')
            .map(response => response);
    }

    getRecommendedProducts(limit, offset): Observable<any> {
        return this.http
            .get(`${this.EndPoint}?where={"deletedAt":null, "approval_status": 2 }&limit=${limit}&skip=${offset}&sort=createdAt%20DESC`)
            .map(response => response);
    }

    getAllHotProducts(): Observable<any> {
        return this.http
            .get(this.EndPoint + '?where={"deletedAt":null, "approval_status": 2 }&sort=createdAt%20DESC')
            .map(response => response);
    }

    getByCategory(catId: number, productID: number): Observable<any> {
        return this.http
            .get(`${this.EndPoint}?where={"deletedAt":null, "approval_status": 2,"id":{"!":${productID}},"category_id":${catId}}&sort=createdAt%20DESC`)
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
            .post(`${this.EndPoint}/${data.productId}`, data)
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
}
