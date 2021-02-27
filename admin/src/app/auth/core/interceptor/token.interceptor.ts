import {Injectable} from '@angular/core';
import 'rxjs/add/operator/catch';

import {
    HttpRequest,
    HttpHandler,
    HttpEvent,
    HttpInterceptor, HttpErrorResponse
} from '@angular/common/http';
import {Observable} from 'rxjs';
import {AuthService} from '../../../services/auth.service';
import { throwError } from 'rxjs';

@Injectable()
export class TokenInterceptor implements HttpInterceptor {
    constructor(public authService: AuthService) {
    }

    intercept(request: HttpRequest<any>, next: HttpHandler): Observable<HttpEvent<any>> {

        console.log('intercepted request ... ');
        let authReq = request;
        // Clone the request to add the new header.
        if (!this.authService.isTokenExpired()) {
            const token = this.authService.getToken();
            authReq = request.clone({
                setHeaders: {
                    Authorization: `Bearer ${token}`
                },
            });
        }

        console.log('Sending request with new header now ...');

        //send the newly created request
        return next.handle(authReq).catch((error, caught) => {
            if (error instanceof HttpErrorResponse) {
                if (error.status === 401) {
                    // TODO: logout and Redirect to Login Page
                }
            }
            //intercept the respons error and displace it to the console
            console.log('Error Occurred');
            console.log(error);
            //return the error to the method that called it
            return throwError(error);
        }) as any;
    }
}
