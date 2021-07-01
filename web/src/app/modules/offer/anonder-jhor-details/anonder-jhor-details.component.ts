import {Component, OnInit} from '@angular/core';
import {ActivatedRoute, Router} from "@angular/router";
import {Title} from "@angular/platform-browser";
import {OfferService} from "../../../services";
import * as moment from "moment";
import {ToastrService} from "ngx-toastr";

@Component({
    selector: 'app-anonder-jhor-details',
    templateUrl: './anonder-jhor-details.component.html',
    styleUrls: ['./anonder-jhor-details.component.scss']
})
export class AnonderJhorDetailsComponent implements OnInit {
    offerId: any;
    anonderJhorOffer;
    anonderJhorOfferProducts;
    page: any;
    calculationType;
    discountAmount;
    originalPrice;

    constructor(
        private route: ActivatedRoute,
        private title: Title,
        private offerService: OfferService,
        private router: Router,
        private toastr: ToastrService
    ) {
    }

    ngOnInit() {
        this.route.params.subscribe(params => {
            this.offerId = +params['id'];
            this.getAnonderJhorOfferById();
        });
    }

    getAnonderJhorOfferById() {
        if (this.offerId) {
            this.offerService.getWebAnonderJhorOfferById(this.offerId)
                .subscribe(result => {
                    console.log('getWebAnonderJhorOfferById result: ', result);
                    this.anonderJhorOffer = result.data[0];
                    this.anonderJhorOfferProducts = result.data[1];
                    console.log("anonderJhorOfferProducts.category_id.name: ", this.anonderJhorOfferProducts);
                    console.log('time: ', this.anonderJhorOffer.start_date <= moment());
                    console.log('time: ', this.anonderJhorOffer.end_date <= moment());

                    /** setting discount to every products exists in this offer*/
                    if (this.anonderJhorOffer && this.anonderJhorOffer.length > 0 && this.anonderJhorOffer.start_date <= moment() && this.anonderJhorOffer.end_date >= moment()) {
                        this.anonderJhorOfferProducts.forEach(product => {
                            this.calculationType = this.anonderJhorOffer.calculation_type;
                            this.discountAmount = this.anonderJhorOffer.discount_amount;
                            this.originalPrice = product.price;

                            product.offerPrice = this.offerService.calculateOfferPrice(this.calculationType, this.originalPrice, this.discountAmount);

                            product.calculationType = this.calculationType;
                            product.discountAmount = this.discountAmount;
                        })
                    } else if (!this.anonderJhorOfferProducts || this.anonderJhorOfferProducts.length < 0) {
                        this.toastr.error('There is no products in this offer', 'No Products');
                    } else if(this.anonderJhorOfferProducts && this.anonderJhorOfferProducts.length < 0){
                        this.toastr.error('Please wait for the offer to start or reload the page', 'Wait please');
                    }

                    if (!(this.anonderJhorOfferProducts && Array.isArray(this.anonderJhorOfferProducts) && this.anonderJhorOfferProducts.length > 0)) {
                        return false;
                    }

                    this.addPageTitle();
                })
        }
    }

    private addPageTitle() {
        if (this.anonderJhorOfferProducts && this.anonderJhorOfferProducts.length > 0) {
            if (this.anonderJhorOffer && this.anonderJhorOffer.category_id) {
                this.title.setTitle(this.anonderJhorOffer.category_id.name + ' - Anonder Jhor Offer');
            } else {
                this.title.setTitle('Offer Detail - Anonderbazar');
            }
        } else {
            this.title.setTitle('Offer Detail - Anonderbazar');
        }
    }

    onPageChange(event) {
        window.scroll(0, 0);
        let query: any = {};
        query.page = event;

        this.router.navigate(['/offers/anonder-jhor-detail', this.route.snapshot.params], {queryParams: query});
        this.page = event;
    }

}
