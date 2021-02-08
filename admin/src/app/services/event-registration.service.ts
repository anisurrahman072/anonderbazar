import {Injectable} from '@angular/core';
import {Observable} from 'rxjs';
import {AuthService} from './auth.service';
import {HttpClient} from '@angular/common/http';
import {environment} from "../../environments/environment";

@Injectable({
  providedIn: 'root'
})
export class EventRegistrationService {
  private EndPoint = `${environment.API_ENDPOINT}/eventregistration`;
  private EndPoint2 = `${environment.API_ENDPOINT}/eventregistrations`;
  constructor(private http: HttpClient, private authenticationService: AuthService) { }

  insert(data): Observable<any> {
    return this.http.post(this.EndPoint + '/create', data);
}
}
