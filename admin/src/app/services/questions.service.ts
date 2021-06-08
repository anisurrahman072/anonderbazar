import {Injectable} from '@angular/core';
import {Observable} from "rxjs";
import {HttpClient, HttpHeaders, HttpParams} from '@angular/common/http';
import {environment} from "../../environments/environment";


@Injectable({
    providedIn: 'root'
})

export class QuestionsService {
    private EndPoint = `${environment.API_ENDPOINT}/questions`;


    constructor(private http: HttpClient) {
    }

    /*Method for getting all questioned Products*/
    getAllQuestionedProducts(page: number, limit: number, warehouseId?: number): Observable<any> {
        return this.http.get(
            `${this.EndPoint}/getAllQuestionedProducts?page=${page}&limit=${limit}&warehouseId=${warehouseId}`
        )
    }

    deleteQuestion(id): Observable<any> {
        return this.http.delete(`${this.EndPoint}/deleteQuestion/${id}`);
    }

    getById(id): Observable<any> {
        return this.http.get(`${this.EndPoint}/read/${id}`);
    }

    update(id: number, answerData: object) {
        return this.http.put(`${this.EndPoint}/addAnswer/${id}`, answerData);
    }

}
