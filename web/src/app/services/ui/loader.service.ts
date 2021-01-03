import { Injectable } from '@angular/core';
import {Subject} from "rxjs";

@Injectable()
export class LoaderService {
  loadingSubject: Subject<boolean>;
  constructor() {
    this.loadingSubject = new Subject<boolean>();
  }
  showLoader() { 
    this.loadingSubject.next(true);
  }
  hideLoader() { 
    this.loadingSubject.next(false);
  }
}
