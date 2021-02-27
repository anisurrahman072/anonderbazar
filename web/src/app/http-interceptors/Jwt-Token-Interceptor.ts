import {HttpErrorResponse, HttpEvent, HttpHandler, HttpInterceptor, HttpRequest} from "@angular/common/http";
import {Injectable} from "@angular/core";
import {Observable} from "rxjs/Rx";
import {AuthService} from "../services";
import {Store} from "@ngrx/store";
import * as fromStore from "../state-management";
import {NotificationsService} from "angular2-notifications";

@Injectable()
export class JwtTokenInterceptor implements HttpInterceptor {
    constructor(
        private store: Store<fromStore.HomeState>,
        private authService: AuthService,
        private _notify: NotificationsService) {
    }

    intercept(
        req: HttpRequest<any>,
        next: HttpHandler
    ): Observable<HttpEvent<any>> {
        console.log('intercepted request ... ');
        let authReq = req;
        // Clone the request to add the new header.
        if (!this.authService.isTokenExpired()) {
            const token = this.authService.getToken();
            authReq = req.clone({
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
                    this.authService.logout();
                    this.store.dispatch(new fromStore.LoadCurrentUserSuccess(null));
                    this.store.dispatch(new fromStore.LoadCartSuccess(null));
                    this.store.dispatch(new fromStore.LoadFavouriteProductSuccess([]));
                    this._notify.error("Session Expired. Please login again.");
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
