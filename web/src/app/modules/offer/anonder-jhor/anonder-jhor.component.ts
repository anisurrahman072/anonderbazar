import {Component, OnInit} from '@angular/core';
import {OfferService} from "../../../services";
import { Observable } from 'rxjs/Rx';
import {AppSettings} from "../../../config/app.config";
import {GLOBAL_CONFIGS} from "../../../../environments/global_config";

@Component({
    selector: 'app-anonder-jhor',
    templateUrl: './anonder-jhor.component.html',
    styleUrls: ['./anonder-jhor.component.scss']
})
export class AnonderJhorComponent implements OnInit {
    anonderJhor;
    anonderJhorOffers;
    IMAGE_ENDPOINT = AppSettings.IMAGE_ENDPOINT;

    constructor(
        private offerService: OfferService
    ) {
    }

    ngOnInit() {
        this.offerService.getAnonderJhorAndOffers()
            .subscribe(result => {
                console.log('jhor and offers result: ', result);
                if(result && result.data) {
                    if(result.data[0]) {
                        this.anonderJhor = result.data[0];
                    }
                    if(result.data[1]) {
                        this.anonderJhorOffers = result.data[1];
                        console.log('anonder jhor offers', this.anonderJhorOffers);
                    }
                }
            })
    }

}
