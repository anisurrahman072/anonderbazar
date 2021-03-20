import {HttpErrorResponse, HttpEvent, HttpHandler, HttpInterceptor, HttpRequest} from "@angular/common/http";
import {Injectable} from "@angular/core";
import {Observable} from "rxjs/Rx";
import {Store} from "@ngrx/store";
import * as fromStore from "../state-management";
import {NotificationsService} from "angular2-notifications";
import {JwtHelper} from "angular2-jwt";

@Injectable()
export class JwtTokenInterceptor implements HttpInterceptor {
    public token: string;

    constructor(
        private store: Store<fromStore.HomeState>,
        private jwtHelper: JwtHelper,
        private _notify: NotificationsService) {
    }

    getToken() {
        const token = localStorage.getItem('token');
        if (token) {
            return token;
        }
        return '';
    }


    isTokenExpired() {
        const token = this.getToken();
        if (token) {
            return this.jwtHelper.isTokenExpired(token);
        } else {
            return true;
        }
    }

    logout(): void {
        // clear token remove user from local storage to log user out
        this.token = '';
        localStorage.removeItem('currentUser');
        localStorage.removeItem('token');
    }

    intercept(
        req: HttpRequest<any>,
        next: HttpHandler
    ): Observable<HttpEvent<any>> {
        let authReq = req;
        // Clone the request to add the new header.
        if (!this.isTokenExpired()) {
            const token = this.getToken();
            authReq = req.clone({
                setHeaders: {
                    Authorization: `Bearer ${token}`
                },
            });
        }

        //send the newly created request
        return next.handle(authReq).catch((error, caught) => {
            if (error instanceof HttpErrorResponse) {
                if (error.status === 401) {
                    this.logout();
                }
            }
            //intercept the respons error and displace it to the console
            console.log('Error Occurred');
            console.log(error);
            //return the error to the method that called it
            return Observable.throw(error);
        }) as any;
    }
}
