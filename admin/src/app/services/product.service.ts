import {Injectable} from '@angular/core';
import {Observable} from 'rxjs';
import {HttpClient, HttpHeaders, HttpParams} from '@angular/common/http';
import {environment} from "../../environments/environment";

@Injectable({
    providedIn: 'root'
})
export class ProductService {
    private EndPoint = `${environment.API_ENDPOINT}/product`;
    private EndPoint2 = `${environment.API_ENDPOINT}/products`;
    private EndPoint3 = `${environment.API_ENDPOINT}/productImage`;

    constructor(private http: HttpClient) {
    }

    getAllProducts(page: number,
                   limit: number,
                   searchTerm: string,
                   typeID: number,
                   categoryId: number,
                   subcategoryId: number,
                   warehouseId: string,
                   sortName: string,
                   sortPrice: String,
                   approvalStatus: string = '',
    ): Observable<any> {
        return this.http.get(
            `${
                this.EndPoint2
            }?page=${page}&limit=${limit}&search_term=${searchTerm}&type_id=${typeID}&category_id=${categoryId}&subcategory_id=${subcategoryId}&warehouse_id=${warehouseId}&sortName=${sortName}&sortPrice=${sortPrice}&approval_status=${approvalStatus}`
        );
    }

    getAllProductsByStatus(status: number,
                           page: number,
                           limit: number,
                           searchCode: string,
                           searchTerm: string,
                           brandId: number,
                           typeId: number,
                           categoryId: number,
                           subcategoryId: number,
                           warehouseId: string,
                           sortCode: string,
                           sortName: string,
                           sortPrice: String,
                           sortQuantity: string,
                           sortUpdatedAt: string = '',
                           approvalStatus: string = '',
                           priceSearchValue: string = ''
    ): Observable<any> {
        return this.http.get(
            `${this.EndPoint2}?status=${status}&page=${page}&limit=${limit}&search_term=${searchTerm}&search_code=${searchCode}&brand_id=${brandId}&price=${priceSearchValue}&type_id=${typeId}&category_id=${categoryId}&subcategory_id=${subcategoryId}&warehouse_id=${warehouseId}&sortCode=${sortCode}&sortName=${sortName}&sortPrice=${sortPrice}&sortQuantity=${sortQuantity}&sortUpdatedAt=${sortUpdatedAt}&approval_status=${approvalStatus}`
        );
    }


    getAll(): Observable<any> {
        return this.http.get(this.EndPoint + `?where={"deletedAt":null}`);
    }

    getAllWithPagination(page = 1, limit = 30): Observable<any> {
        const skip = (page - 1) * limit;
        return this.http.get(this.EndPoint2 + `?where={"deletedAt":null}&page=${page}&skip=${skip}&limit=${limit}`);
    }

    getById(id): Observable<any> {
        // get users from api
        return this.http.get(this.EndPoint + '/' + id);
    }

    getByIdWithPopulate(id): Observable<any> {
        // get users from api
        return this.http.get(this.EndPoint + '/details/' + id);
    }

    insert(data): Observable<any> {
        return this.http.post(this.EndPoint + '/create', data);
    }

    delete(id): Observable<any> {
        // get users from api
        return this.http.delete(`${this.EndPoint}/${id}`);
    }

    approveByAdmin(id): Observable<any> {
        // get users from api
        return this.http.put(this.EndPoint + '/' + id, {approval_status: 2});
    }

    rejectByAdmin(id): Observable<any> {
        // get users from api
        return this.http.put(this.EndPoint + '/' + id, {approval_status: 99});
    }

    deleteProductImage(id): Observable<any> {
        // get users from api
        return this.http.delete(`${this.EndPoint3}/${id}`);
    }

    update(id: number, data: any) {
        return this.http.put(this.EndPoint + '/' + id, data);
    }

    getAllByWarehouseId(id): Observable<any> {
        return this.http.get(
            `${this.EndPoint}?where={"deletedAt":null,"warehouse_id":${id}}`
        );
    }

    getByCategory(id: number): Observable<any> {
        return this.http.get(
            `${this.EndPoint}?where={"deletedAt":null,"category_id":${id}}`
        );
    }

    upload(data): Observable<any> {
        return this.http.post(this.EndPoint + '/upload', data);
    }

    uploadCouponBanners(data): Observable<any> {
        let headers = new HttpHeaders();
        //this is the important step. You need to set content type as null
        headers.set('Content-Type', null);
        headers.set('Accept', "multipart/form-data");
        let params = new HttpParams();
        return this.http.post(this.EndPoint + '/uploadCouponBanners', data, {params, headers});
    }

    getGeneratedExcelFile(): Observable<any> {
        return this.http.get(this.EndPoint2 + '/generate-excel', {responseType: 'blob'});
    }

    submitDataForBulkUpload(data, isApproved = 1): Observable<any> {

        return this.http.post(this.EndPoint2 + '/bulk-upload?isApproved=' + isApproved, data);
    }
}
