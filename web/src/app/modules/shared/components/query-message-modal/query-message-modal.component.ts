import {Component, OnInit} from "@angular/core";
import {BsModalRef} from 'ngx-bootstrap/modal';

@Component({
    selector: 'check-modal',
    templateUrl: './query-message-modal.component.html',
    styleUrls: ['./query-message-modal.component.scss']
})
export class QueryMessageModalComponent implements OnInit {
    title: string;
    message: string;

    constructor(public bsModalRef: BsModalRef) {

    }

    ngOnInit() {

    }
}
