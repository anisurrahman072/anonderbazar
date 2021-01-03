import { Observable } from 'rxjs/Observable';
import { observable } from 'rxjs/symbol/observable';
import {ChangeDetectionStrategy, Component, Input, OnInit} from '@angular/core';

@Component({
    selector: 'app-similar-item',
    templateUrl: './similar-product.component.html',
    styleUrls: ['./similar-product.component.scss'],
    changeDetection: ChangeDetectionStrategy.OnPush
})
export class SimilarProductComponent implements OnInit {
    @Input() products:any;
    constructor() {
    }

    ngOnInit() {
    }

}
