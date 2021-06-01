import {Component, Input, OnInit} from '@angular/core';
import {AppSettings} from "../../../../config/app.config";
import {PaymentAddressService} from "../../../../services/payment-address.service";
import {AuthService, ProductService} from "../../../../services";
import {FormControl, FormGroup, Validators} from "@angular/forms";
import {NgProgress} from "@ngx-progressbar/core";
import {NotificationsService} from "angular2-notifications";
import {LoginModalService} from "../../../../services/ui/loginModal.service";
import * as ___ from "lodash";

@Component({
    selector: 'app-product-description',
    templateUrl: './product-description.component.html',
    styleUrls: ['./product-description.component.scss']
})
export class ProductDescriptionComponent implements OnInit {
    @Input() productDescriptionData;
    @Input() private productId;
    @Input() private currentUserId;
    page;
    nextPage;
    /** data: [product, questions.rows, rating.rows] */

    productRatingDetail: {
        totalNumberOfRatings: number;
        averageRating: number;
        fiveStar: number;
        fourStar: number;
        threeStar: number;
        twoStar: number;
        oneStar: number;
    } = {
        totalNumberOfRatings: 0,
        averageRating: 0,
        fiveStar: 0,
        fourStar: 0,
        threeStar: 0,
        twoStar: 0,
        oneStar: 0,
    };


    IMAGE_ENDPOINT = AppSettings.IMAGE_ENDPOINT;
    address: any;

    pageLoaded: boolean = false;

    rating: any = null;
    review: string = null;
    question: string = null;
    reviewSection: boolean = false;
    reviewButton: boolean = true;
    reviewBox: boolean = false;
    questionButton: boolean = true;
    questionBox: boolean = false;
    averageRatingStarsWidth: number;
    userStarsWidth: number;

    data: any = null;

    ratingForm = new FormGroup({
        review: new FormControl('', [Validators.required]),
        rating: new FormControl('', [Validators.required])
    });

    questionForm = new FormGroup({
        question: new FormControl('', [Validators.required]),
    });


    constructor(private paymentAddressService: PaymentAddressService,
                private authService: AuthService,
                public _progress: NgProgress,
                private productService: ProductService,
                private _notify: NotificationsService,
                private loginModalService: LoginModalService,
    ) {
    }

    //Event method for getting all the data for the page
    ngOnInit() {
        this.productRatingDetail.averageRating = 0;
        this.paymentAddressService.getPaymentaddressWithoutOrderid(this.currentUserId).subscribe(result => {
            this.address = result[0];
        });
        this.data = this.productDescriptionData;
        this.setRatingData(this.data[2]);

        this.canRateProduct(this.currentUserId, this.productId);
    }

    /*Method called on Rating and Review Submit*/
    onRatingAndReviewSubmit(): any {
        if (this.ratingForm.invalid) {
            return;
        }

        this.review = this.ratingForm.controls.review.value;
        this.rating = this.ratingForm.controls.rating.value;

        /*method called to save data to the database*/
        this.ratingChange(this.rating, this.review);

        this.ratingForm.reset();
        this.getProductData();
    }

    /**this method is called in onRatingAndReviewSubmit() method, while submitting a rating and review*/
    ratingChange(rating, review): void {
        if (this.currentUserId) {
            this._progress.start("mainLoader");
            this.productService
                .sendRating({
                    productId: this.data[0].id,
                    rating: rating,
                    review: review,
                    userId: this.currentUserId,
                })
                .subscribe(res => {
                    this._progress.complete("mainLoader");
                    this._notify.success("success", "Thank you for your feedback...");
                });
        } else {
            this._notify.create("warning", "Please Login First");
            this.loginModalService.showLoginModal(true);

            this.rating = this.data[0].rating;
        }
    }

    /**shows or hide the review button and input box*/
    reviewButtonClicked() {
        this.reviewBox = !this.reviewBox;
        this.reviewButton = !this.reviewButton;
    }

    /**shows or hide the question button and input box*/
    questionButtonClicked() {
        this.questionBox = !this.questionBox;
        this.questionButton = !this.questionButton;
    }

    /**Method called on Question Submit in the html question form */
    onQuestionSubmit(): any {

        if (this.questionForm.invalid) {
            return;
        }

        this.question = this.questionForm.controls.question.value;


        /*method called to save data to the database*/
        this.sendQuestion(this.question);

        this.questionForm.reset();
        this.getProductData();
    }

    /**Method Called in onQuestionSubmit() method*/
    sendQuestion(question): void {

        if (this.currentUserId) {
            this._progress.start("mainLoader");
            this.productService
                .sendQuestion({
                    userId: this.currentUserId,
                    productId: this.data[0].id,
                    question: question,
                })
                .subscribe(res => {
                    this._progress.complete("mainLoader");
                    this._notify.success("success", "We'll be back to you, very soon...Thank you!");
                });
        } else {
            this._notify.create("warning", "Please Login First");
            this.loginModalService.showLoginModal(true);

            this.rating = this.data[0].rating;
        }
    }

    /**api call to get related data of a specific product*/
    getProductData() {
        this.productService.getByIdWithDetails(this.productId).subscribe(result => {
            this.data = [result.data[0], result.data[1], result.data[2]]
            this.setRatingData(result.data[2]);
        }, (error) => {
            this._notify.error('Problem!', "Problem in loading the product");
        });
    }

    /**method called in ngOnInit() and getProductData() to set product rating data*/
    setRatingData(result) {
        this.productRatingDetail.totalNumberOfRatings = result.length;

        let totalRating = 0;
        for (let i = 0; i < result.length; i++) {
            totalRating += result[i].rating;

            if (result[i].rating === 5) {
                this.productRatingDetail.fiveStar += 1;
            }
            if (result[i].rating === 4) {
                this.productRatingDetail.fourStar += 1;
            }
            if (result[i].rating === 3) {
                this.productRatingDetail.threeStar += 1;
            }
            if (result[i].rating === 2) {
                this.productRatingDetail.twoStar += 1;
            }
            if (result[i].rating === 1) {
                this.productRatingDetail.oneStar += 1;
            }
        }
        if (totalRating !== 0) {
            const num = totalRating / this.productRatingDetail.totalNumberOfRatings;
            this.productRatingDetail.averageRating = Number((Math.round(num * 100) / 100).toFixed(2));
        } else {
            this.productRatingDetail.averageRating = 0;

        }
        this.averageRatingStarsWidth = ((this.productRatingDetail.averageRating / 5) * 215)
        this.userStarsWidth = ((this.productRatingDetail.averageRating / 5) * 90)
    }

    //Event method for pagination change
    onPageChange(event) {
        window.scroll(0, 0);
        this.page = event;
    }

    //Event method for pagination change
    onQuestionPageChange(event) {
        window.scroll(1, 1);
        this.nextPage = event;
    }

    /**decide whether a user can rate a product or not, NB: a user who has bought the product can rate only*/
    private canRateProduct(userID, productID) {
        this.productService.canRateProduct(userID, productID)
            .subscribe(result => {
                console.log('canRateProduct', result.canRateProduct);
                if (!___.isUndefined(result) && !___.isUndefined(result.canRateProduct) && ___.isArray(result.canRateProduct) && result.canRateProduct.length >= 1) {
                    this.reviewSection = true;
                }
            })
    }

}
