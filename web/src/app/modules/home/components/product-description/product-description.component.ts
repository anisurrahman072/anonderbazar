import {Component, EventEmitter, Input, OnInit, Output} from '@angular/core';
import {AppSettings} from "../../../../config/app.config";
import {PaymentAddressService} from "../../../../services/payment-address.service";
import {AuthService} from "../../../../services";

@Component({
    selector: 'app-product-description',
    templateUrl: './product-description.component.html',
    styleUrls: ['./product-description.component.scss']
})
export class ProductDescriptionComponent implements OnInit {
    @Input() data = {};
    @Output() onRatingChange = new EventEmitter<any>();
    IMAGE_ENDPOINT = AppSettings.IMAGE_ENDPOINT;
    address: any;
    constructor(private paymentAddressService: PaymentAddressService,
                private authService: AuthService) {
    }

    //Event method for getting all the data for the page
    ngOnInit() {
        let userId = this.authService.getCurrentUserId();
        this.paymentAddressService.getPaymentaddressWithoutOrderid(userId).subscribe(result => {
            this.address = result[0];
        });
    }

    //Method called in rating changes
    ratingChange(event){
        this.onRatingChange.emit(event);
    }

}
