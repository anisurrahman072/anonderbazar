import {ErrorHandler, Injectable} from '@angular/core';
import {NotificationsService} from "angular2-notifications";
import {NgProgress} from "@ngx-progressbar/core";

@Injectable()
export class GlobalErrorHandler implements ErrorHandler {
    constructor(private _notify: NotificationsService, public progress: NgProgress,) {
    }
    
    handleError(error) {
        this.progress.complete('mainLoader');
        const message = error.message ? error.message : error.toString();
        this._notify.error(message);
        // IMPORTANT: Rethrow the error otherwise it gets swallowed
        throw error;
    }
    
}