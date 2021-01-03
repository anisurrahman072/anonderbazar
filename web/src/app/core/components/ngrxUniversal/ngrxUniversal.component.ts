import {isPlatformBrowser} from '@angular/common';
import {Component, ElementRef} from "@angular/core";
import {Observable} from "rxjs/Observable";
import {Store} from "@ngrx/store";
import {of} from "rxjs/observable/of";

@Component({
    selector:'app-state-unx',
    template: `
        {{ state$ | json }}
    `
})
export class NgrxUniversalComponent {
    state$: Observable<any>;
    
    constructor(private elementRef: ElementRef, private store: Store<any>) {
        if (isPlatformBrowser) {
            this.startRehydration();
        }
        else {
            this.startSerialization();
        }
    }
    
    startRehydration() {
        try {
            const state = JSON.parse(this.elementRef.nativeElement.innerText);
            this.store.dispatch({type: 'REHYDRATE', state});
            this.state$ = of();
        } catch (e) {
        }
    }
    
    startSerialization() {
        this.state$ = this.store;
    }
}