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
    anonderJhorOfferProducts: any = [];
    JhorOfferProducts: any = [];
    page: any;
    calculationType;
    discountAmount;
    originalPrice;

    changeStatusN = false;
    changeStatusPr = false;

    changeStatusN_ASC = false;
    changeStatusPr_ASC = false;

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
        let sortData = null;
        if (this.changeStatusN) {
            sortData = {
                code: "newest",
                order: "DESC"
            }
            if (this.changeStatusN_ASC) {
                sortData.order = "ASC";
            }
        } else if (this.changeStatusPr) {
            sortData = {
                code: "price",
                order: "DESC"
            }
            if (this.changeStatusPr_ASC) {
                sortData.order = "ASC";
            }
        }

        if (this.offerId) {
            this.offerService.getWebAnonderJhorOfferById(this.offerId, sortData)
                .subscribe(result => {
                    this.anonderJhorOffer = result.data[0];
                    this.JhorOfferProducts = result.data[1];

                    let presentTime = (new Date(Date.now())).getTime();
                    let startTime = new Date(this.anonderJhorOffer.start_date).getTime();
                    let endTime = new Date(this.anonderJhorOffer.end_date).getTime();

                    /** setting discount to every products exists in this offer*/
                    if (this.anonderJhorOffer && startTime <= presentTime && endTime >= presentTime) {
                        this.JhorOfferProducts.forEach(product => {
                            this.calculationType = product.calculation_type;
                            this.discountAmount = product.discount_amount
                            this.originalPrice = product.product_id.price;

                            product.product_id.offerPrice = this.offerService.calculateOfferPrice(this.calculationType, this.originalPrice, this.discountAmount);

                            product.product_id.calculationType = this.calculationType;
                            product.product_id.discountAmount = this.discountAmount;
                            this.anonderJhorOfferProducts.push(product.product_id);
                        })
                        this.anonderJhorOfferProducts.sort((a, b) => (a.frontend_position > b.frontend_position) ? 1 : -1);
                    } else if (!this.JhorOfferProducts || this.JhorOfferProducts.length < 0) {
                        this.toastr.error('There is no products in this offer', 'No Products');
                    } else {
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

    /*onPageChange(event) {
        window.scroll(0, 0);
        let query: any = {};
        query.page = event;

        this.router.navigate(['/offers/anonder-jhor-detail', this.route.snapshot.params], {queryParams: query});
        this.page = event;
    }*/

    showNewest() {
        this.changeStatusN = true;
        this.changeStatusPr = false;

        this.changeStatusN_ASC = !this.changeStatusN_ASC;
        this.changeStatusPr_ASC = false;
        this.getAnonderJhorOfferById();
    }

    showPrice() {
        this.changeStatusN = false;
        this.changeStatusPr = true;

        this.changeStatusN_ASC = false;
        this.changeStatusPr_ASC = !this.changeStatusPr_ASC;
        this.getAnonderJhorOfferById();
    }

}
