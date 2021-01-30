import {Injectable} from '@angular/core';
import 'rxjs/add/operator/map';
import {Observable} from 'rxjs';
import {AuthService} from './auth.service';
import {HttpClient} from "@angular/common/http";
import {environment} from "../../environments/environment";


@Injectable({
    providedIn: 'root'
})
export class CategoryProductService {

    private EndPoint = `${environment.API_ENDPOINT}/category`;
    private EndPoint2 = `${environment.API_ENDPOINT}/productcategories`;
    private EndPoint3 = `${environment.API_ENDPOINT}/productcategories/withProductSubcategory`;

    constructor(private http: HttpClient,
                private authenticationService: AuthService) {
    }

    getAll() {
        return this.http.get(`${this.EndPoint}?where={"type_id":2,"deletedAt":null}`);
    }
    getAllType() {
        return this.http.get(`${this.EndPoint}?where={"type_id":1,"deletedAt":null}`);
    }

    getAllWithSubcategory(page: number, limit: number, searchTerm: string,
                  categoryId: number,
                  subcategoryId: number,
                  sortName: string,
                  sortPrice: String): Observable<any> {
        return this.http.get(`${this.EndPoint3
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

        return this.http.get(this.EndPoint + '/' + id);
    }

    insert(categoryType) {

        return this.http.post(this.EndPoint, categoryType);
    }

    delete(id) {

        return this.http.delete(`${this.EndPoint}/${id}`);
    }

    update(id: number, data: any) {
        return this.http.put(this.EndPoint + '/' + id, data);
    }

    getAllCategory() {
        return this.http.get(`${this.EndPoint
        }?where={"type_id":2,"deletedAt":null,"parent_id":0}`);
    }

    getSubcategoryByCategoryId(id: string) {
        return this.http.get(`${this.EndPoint
        }?where={"type_id":2,"deletedAt":null,"parent_id":${id}}`);
    }
}
