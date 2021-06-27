import {Component, OnInit} from '@angular/core';
import {OfferService} from "../../../services";
import {Observable} from 'rxjs/Rx';
import {AppSettings} from "../../../config/app.config";
import {setInterval} from "timers";

@Component({
    selector: 'app-anonder-jhor',
    templateUrl: './anonder-jhor.component.html',
    styleUrls: ['./anonder-jhor.component.scss']
})
export class AnonderJhorComponent implements OnInit {
    anonderJhor;
    anonderJhorOffers;
    IMAGE_ENDPOINT = AppSettings.IMAGE_ENDPOINT;
    banner_name;

    constructor(
        private offerService: OfferService
    ) {
    }

    ngOnInit() {
        this.offerService.getAnonderJhorAndOffers()
            .subscribe(result => {
                console.log('jhor and offers result: ', result);
                if (result && result.data) {
                    if (result.data[0]) {
                        this.anonderJhor = result.data[0];

                        let jhorStartTime = new Date(this.anonderJhor.start_date).getTime();
                        let jhorEndTime = new Date(this.anonderJhor.end_date).getTime();


                        setInterval(function () {
                            let presentTime = new Date().getTime();
                            let timeDifference = jhorEndTime - presentTime;

                            let days = Math.floor(timeDifference / (1000 * 60 * 60 * 24));
                            let hours = Math.floor((timeDifference % (1000 * 60 * 60 * 24)) / (1000 * 60 * 60));
                            let minutes = Math.floor((timeDifference % (1000 * 60 * 60)) / (1000 * 60));
                            let seconds = Math.floor((timeDifference % (1000 * 60)) / 1000);

                            document.getElementById("ends_at").innerHTML = days + "d " + hours + "h "
                                + minutes + "m " + seconds + "s ";
                        }, 1000)

                    }
                    if (result.data[1]) {
                        this.anonderJhorOffers = result.data[1];
                        console.log('anonder jhor offers', this.anonderJhorOffers);

                        this.anonderJhorOffers.forEach(offers => {
                            if (offers.sub_sub_category_id) {
                                offers.banner_name = offers.sub_sub_category_id.name;
                            } else if (offers.sub_category_id) {
                                offers.banner_name = offers.sub_category_id.name;
                            } else if (offers.category_id) {
                                offers.banner_name = offers.category_id.name;
                            }
                        })
                        console.log('banner name added: ', this.anonderJhorOffers);
                    }
                }
            })
    }

}
