import {forwardRef, Inject, Injectable} from '@angular/core';
import {
  HttpRequest,
  HttpHandler,
  HttpEvent,
  HttpInterceptor
} from '@angular/common/http';

import {Observable} from 'rxjs';
import {AuthService} from '../../../services/auth.service';


@Injectable()
export class TokenInterceptor implements HttpInterceptor {
    constructor(public auth: AuthService) {
    }
  //   constructor(@Inject(forwardRef(() => AuthService)) private auth: AuthService) {}
    
    
    intercept(request: HttpRequest<any>, next: HttpHandler): Observable<HttpEvent<any>> {

    request = request.clone({
      setHeaders: {
        Authorization: `Bearer ${this.auth.getToken()}`
      }
    });
    return next.handle(request);
  }
}
