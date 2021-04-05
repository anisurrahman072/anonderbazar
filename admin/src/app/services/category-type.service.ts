import {Injectable} from '@angular/core';
import {Observable} from 'rxjs';

import {HttpClient} from '@angular/common/http';
import {environment} from "../../environments/environment";

@Injectable({
    providedIn: 'root'
})
export class CategoryTypeService {


    private EndPoint = `${environment.API_ENDPOINT}/category`;
    private EndPoint2 = `${environment.API_ENDPOINT}/typecategories`;

    constructor(private http: HttpClient) {
    }

    getAll():any {

        return this.http.get(`${this.EndPoint}?where={"type_id":1,"deletedAt":null}`)

    }

    getAllCategories(page: number, limit: number, searchTerm: string,
                     categoryId: number,
                     subcategoryId: number,
                     sortName: string,
                     sortPrice: String) {
        return this.http.get(`${this.EndPoint2
            }?page=${page
            }&limit=${limit
            }&search_term=${searchTerm
            }&category_id=${categoryId
            }&subcategory_id=${subcategoryId
            }&sortName=${sortName
            }&sortPrice=${sortPrice}`
        )

    }


    getById(id) {

        return this.http.get(this.EndPoint + '/' + id)

    }

    insert(categoryType): Observable<any> {

        return this.http.post(this.EndPoint, categoryType)

    }


    delete(id) {

        return this.http.delete(`${this.EndPoint}/${id}`)

    }

    update(id: number, data: any) {
        return this.http.put(this.EndPoint + '/' + id, data)

    }
}
