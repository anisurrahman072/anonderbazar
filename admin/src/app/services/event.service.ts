import {Injectable} from '@angular/core';
import {Observable} from 'rxjs';
import {AuthService} from './auth.service';
import {HttpClient} from '@angular/common/http';
import {environment} from "../../environments/environment";

@Injectable({
  providedIn: 'root'
})
export class EventService {
  private EndPoint = `${environment.API_ENDPOINT}/event`;
  private EndPoint2 = `${environment.API_ENDPOINT}/events`;

  constructor(private http: HttpClient, private authenticationService: AuthService) { }

  insert(data): Observable<any> {
      return this.http.post(this.EndPoint + '/create', data);
  }

  getAllEventsByStatus(userId:number,status: number, page: number, limit: number): any {
    return this.http.get(`${this.EndPoint2}?userId=${userId}&status=${status}&page=${page}&limit=${limit}`);
  }

  getById(id: any): any {
    return this.http.get(this.EndPoint + '/findOne/' + id);
  }
  update(id:number, data: FormData): any {
    return this.http.put(this.EndPoint + '/update/' + id, data);
  }
  delete(id: any): any {
    return this.http.delete(this.EndPoint + '/destroy/' + id);
  }

}
