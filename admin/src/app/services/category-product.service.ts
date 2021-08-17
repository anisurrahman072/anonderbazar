import {Injectable} from '@angular/core';
import 'rxjs/add/operator/map';
import {Observable} from 'rxjs';
import {HttpClient} from "@angular/common/http";
import {environment} from "../../environments/environment";


@Injectable({
    providedIn: 'root'
})
export class CategoryProductService {

    private EndPoint = `${environment.API_ENDPOINT}/category`;
    private EndPoint3 = `${environment.API_ENDPOINT}/productcategories/withProductSubcategory`;

    constructor(private http: HttpClient) {
    }

    getAll() {
        return this.http.get(`${this.EndPoint}?where={"type_id":2,"deletedAt":null}`);
    }

    getAllType() {
        return this.http.get(`${this.EndPoint}?where={"type_id":1,"deletedAt":null}`);
    }

    getAllWithSubcategory(
        page: number,
        limit: number,
        nameSearchValue: string,
        codeSearchValue: string,
        idSearchValue: string,
        sortKey: string,
        sortVal: string
    ): Observable<any> {
        return this.http.get(`${this.EndPoint3}?page=${page}&limit=${limit}&id_search=${idSearchValue}&name_search=${nameSearchValue}&code_search=${codeSearchValue}&sortKey=${sortKey}&sortVal=${sortVal}`)
    }

    getById(id) {
        return this.http.get(this.EndPoint + '/' + id);
    }

    insert(data) {
        return this.http.post(this.EndPoint, data);
    }

    delete(id) {

        return this.http.delete(`${this.EndPoint}/${id}`);
    }

    update(id: number, data: any) {
        return this.http.put(this.EndPoint + '/' + id, data);
    }

    removeImages(id: number, imageType: string) {
        return this.http.delete(`${this.EndPoint}/remove-image/${id}/${imageType}`);
    }

    getAllCategory() {
        return this.http.get(`${this.EndPoint}?where={"type_id":2,"deletedAt":null,"parent_id":0}`);
    }

    getSubcategoryByCategoryId(id: string) {
        /*console.log('parent_id', id);*/
        let parentId = parseInt(id, 10);
        if (!parentId) {
            parentId = 0;
        }
        return this.http.get(`${this.EndPoint}?where={"type_id":2,"deletedAt":null,"parent_id":${parentId}}`);
    }
}
