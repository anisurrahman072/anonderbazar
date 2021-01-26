import {Injectable} from '@angular/core';
import {Observable} from 'rxjs';
import {AuthService} from './auth.service';
import {HttpClient} from '@angular/common/http';
import {environment} from "../../environments/environment";

@Injectable({
    providedIn: 'root'
})
export class DesignCategoryService {

    private EndPoint = `${environment.API_ENDPOINT}/designcategory`;
    private EndPoint2 = `${environment.API_ENDPOINT}/designcategories/withDesignSubcategory`;

    constructor(private http: HttpClient,
                private authenticationService: AuthService) {
    }

    getAll(): Observable<any> {
        // get users from api
        return this.http.get(`${this.EndPoint}?where={"deletedAt":null}`)
            ;
    }

    getAllWithDesignSubcategory(): Observable<any> {
        // get users from api
        return this.http.get(`${this.EndPoint}/withDesignSubcategory`)
            ;
    }
    getAlldesigncategories(page: number, limit: number,
                 searchTermName: string,
                 categoryId: number,
                 subcategoryId: number,
                 sortName: string): Observable<any> {


        return this.http.get(`${this.EndPoint2
            }?page=${page
            }&limit=${limit
            }&searchTermName=${searchTermName
            }&category_id=${categoryId
            }&subcategory_id=${subcategoryId
            }&sortName=${sortName}`
        )
    }

    getById(id): Observable<any> {
        // get users from api
        return this.http.get(this.EndPoint + '/' + id)
            ;
    }

    insert(designCategory): Observable<any> {
        return this.http.post(this.EndPoint, designCategory)
            ;
    }


    delete(id): Observable<any> {
        // get users from api
        return this.http.delete(`${this.EndPoint}/${id}`)
            ;
    }

    update(id: number, data: any) {
        return this.http.put(this.EndPoint + '/' + id, data)
            ;
    }


    getAllDesignCategory(): Observable<any> {
        return this.http.get(`${this.EndPoint}?where={"deletedAt":null,"parent_id":"0"}`)
            ;
    }

    getDesignSubcategoryByDesignCategoryId(id: string) {
        return this.http.get(`${this.EndPoint}?where={"deletedAt":null,"parent_id":${id}}`)
            ;
    }
}
