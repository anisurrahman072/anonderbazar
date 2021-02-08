import { AppSettings } from "../../../../config/app.config";
import { Component, OnInit } from "@angular/core";
import { ActivatedRoute } from "@angular/router";
import { Subscription } from "rxjs/Subscription";
import { Store } from "@ngrx/store";
import { Observable } from "rxjs/Observable";
import { AlertsService } from "@jaspero/ng2-alerts";
import { NgProgress } from "@ngx-progressbar/core";
import { of } from "rxjs/observable/of";
import { NotificationsService } from "angular2-notifications";
import { MatButtonToggleChange } from "@angular/material";
import {ToastrService} from "ngx-toastr";
import { FavouriteProduct, Product } from "../../../../models";
import {
  AuthService,
  CartItemService,
  CartItemVariantService,
  CartService,
  CategoryProductService,
  CmsService,
  ProductService,
  ProductVariantService
} from "../../../../services";
import * as fromStore from "../../../../state-management";
import { LoginModalService } from "../../../../services/ui/loginModal.service";


@Component({
  selector: "home-product-special",
  templateUrl: "./product-special.component.html",
  styleUrls: ["./product-special.component.scss"]
})
export class ProductSpecialComponent implements OnInit {

  data: Product;
  IMAGE_ENDPOINT = AppSettings.IMAGE_ENDPOINT;
  promotionalProducts$: Observable<any>;
  _trialEndsAt;
  private _diff: number;
  private _days: number;
  private _hours: number;
  private _minutes: number;
  private _seconds: number;
  selectedProductVariants: any;
  objectKeys = Object.keys;
  selectedVariant = [];
  id: any;
  productVariants: any;
  private sub: Subscription;
  private sub1: Subscription;
  cart$: Observable<any>;
  cartId: any;
  mainImg: string;
  cartItemId: any;
  cartTotalprice: any;
  cartTotalquantity: any;
  currentUser: Observable<any>;
  product_quantity: any = 1;
  cartVariants: any[] = [];
  tempRating: any;
  overStar: number;
  addTofavouriteLoading$: Observable<boolean>;
  tag: any;
  produce_time: any;
  compare$: Observable<any>;
  favourites$: Observable<FavouriteProduct>;
  UnitPrice: any;
  availableDate: any;
  availableDateLoading: boolean = false;
  variantCalculatedPrice: {
    name;
    price;
    quantity;
    variant_name;
  }[] = [];
  variantCalculatedTotalPrice: number = 0;
  promoCategoey: Observable<any>;
  finalprice: Number = 0.0;
  unitPrice: any = 0.0;
  isOn: "selected";
  counter: any;
  clock: any;
  hours: any;
  minutes: any;
  numbers = {
    0: "0",
    1: "1",
    2: "2",
    3: "3",
    4: "4",
    5: "5",
    6: "6",
    7: "7",
    8: "8",
    9: "9"
  };
  days: string;

  constructor(
    private route: ActivatedRoute,
    private _notify: NotificationsService,
    private _alert: AlertsService,
    public _progress: NgProgress,
    private cmsService: CmsService,
    private store: Store<fromStore.HomeState>,
    private productVariantService: ProductVariantService,
    private productService: ProductService,
    private cartService: CartService,
    private authService: AuthService,
    private cartItemService: CartItemService,
    private loginModalService: LoginModalService,
    private categoryProductService: CategoryProductService,
    private cartItemVariantService: CartItemVariantService,
    private toastr: ToastrService,
  ) {}

  getDays(t) {
    return Math.floor(t / (1000 * 60 * 60 * 24));
  }

  getHours(t) {
    return Math.floor((t / (1000 * 60 * 60)) % 24);
  }

  getMinutes(t) {
    return Math.floor((t / 1000 / 60) % 60);
  }

  getSeconds(t) {
    return Math.floor((t / 1000) % 60);
  }
  //Event method for getting all the data for the page
  ngOnInit() {
    this.compare$ = this.store.select<any>(fromStore.getCompare);
    this.favourites$ = this.store.select<any>(fromStore.getFavouriteProduct);

    this.addTofavouriteLoading$ = this.store.select<any>(
      fromStore.getFavouriteProductLoading
    );

    this.sub1 = this.addTofavouriteLoading$.subscribe(res => {
      if (res) {
        this._progress.start("mainLoader");
      } else {
        this._progress.complete("mainLoader");
      }
    });

    this.cart$ = this.store.select<any>(fromStore.getCart);
    this.cart$.subscribe(result => {
      if (result) {
        this.cartId = result.id;
        this.cartTotalprice = result.total_price;
        this.cartTotalquantity = result.total_quantity;
      }
    });
    this.getPromoCategoey();

  }
  //Event method for getting all promo category
  private getPromoCategoey(){
    this.cmsService
        .getBySubSectionName('POST', 'HOME', 'CATEGORY')
        .subscribe(result => {
            this.promoCategoey = result;
            this.promoCategoey.forEach(element => {
              this.categoryProductService.getById(element.data_value[0].category_id).subscribe(category => {
                element.data_value[0].category_id = category;
              });

            });
        });

  }
  //Event method for getting all product data
  getProductData(id) {
    this.productService.getById(id).subscribe(result => {
      if (result) {
        this.data = result;
        this.getProductAvailableDate();

        this.mainImg = this.data.image;
        this.tempRating = result.rating;

          if(result.tag!="undefined")
              this.tag = JSON.parse(result.tag);
        this.updateFinalprice();
      }
    });
  }
  //Event method for getting selected product
  selectProduct(selectProduct) {
    this.data = selectProduct;
    this.getProductData(this.data.id);
    this.getAllVariant(this.data.id);
    this.product_quantity = 1;
    this._trialEndsAt = this.data.last_order_completed_date;
    this.produce_time = this.data.produce_time;
    this.updateProductOrderTime();
  }
  //Event method for update final price by product
  updateFinalprice() {
      this.unitPrice = this.data.promotion ? this.data.promo_price : this.data.price;

      this.finalprice =
      (this.unitPrice +
        this.data.craftsman_price +
        this.variantCalculatedTotalPrice) *
      this.product_quantity;
  }
  //Event method for getting all variant
  getAllVariant(id) {
    this.productVariantService
      .getAllVariantByProductId(id)
      .subscribe(result => {
        if (result) {
          this.productVariants = result;
        }
      });
  }
  //Event method for getting a variant data
  getVariantData() {
    let sum = 0;
    this.UnitPrice = this.cartVariants.reduce((sum: number, a) => {
      return sum + a.product_id.price;
    }, sum);
  }
  //Method for add to cart
  addProductToCart() {
    this._progress.start("mainLoader");
    let product_total_price=this.finalprice;
      const cartItemData={
          cart_id:  this.cartId,
          product_id: this.data.id,
          product_quantity: 1,
          product_total_price: product_total_price,
      };
    this.cartItemService
      .insert(cartItemData)
      .mergeMap((result: any) => {
        if (result) {
          let _cartVariants = this.cartVariants.map(e => {
            e.cart_item_id = result.id;
            return e;
          });
          if (_cartVariants.length)
            return this.cartItemVariantService.insert(_cartVariants);
          else {
            return of(null);
          }
        }
      })
      .subscribe(
        result => {
          this.store.dispatch(new fromStore.LoadCart());
          this._progress.complete("mainLoader");
          this.toastr.success("add to cart succeeded", 'Note');
        },
        error => {
          this._progress.complete("mainLoader");
          this._notify.error("something went wrong");
        }
      );
  }
  //Event method for getting delivery date
  getProductAvailableDate() {
    this.availableDateLoading = true;
  }

  setProductAvailableSchedule(aDay, anHour, dayss, miliseconds) {
    this.days = this.replaceNumbers(
      Math.floor(miliseconds / aDay + 1).toString()
    );
    let hour = Math.floor((miliseconds - dayss * aDay) / anHour);
    this.hours = this.replaceNumbers(hour.toString());
    this.minutes = this.replaceNumbers(Math.round(
      (miliseconds - dayss * aDay - hour * anHour) / 60000
    ).toString());
  }

  replaceNumbers(input) {
    let output = [];
    for (let i = 0; i < input.length; ++i) {
      if (this.numbers.hasOwnProperty(input[i])) {
        output.push(this.numbers[input[i]]);
      } else {
        output.push(input[i]);
      }
    }
    return output.join("");
  }

  ngOnDestroy(): void {
    this.sub ? this.sub.unsubscribe() : "";
    this.sub1 ? this.sub1.unsubscribe() : "";
  }
  //Method for rating change product item view
  ratingChange(newValue): void {
    /*ready for serve*/
    let userId = this.authService.getCurrentUserId();
    if (userId) {
      this._progress.start("mainLoader");
      this.productService
        .sendRating({ productId: this.data.id, rating: this.tempRating })
        .subscribe(res => {
          this._progress.complete("mainLoader");
          this._notify.success("success", "rating...");
        });
    } else {
      this._notify.create("warning", "Please Login First");

      this.loginModalService.showLoginModal(true);

      setTimeout(() => {
        this.tempRating = this.data.rating;
      });
    }
  }
  updateProductOrderTime() {
    if (
      Date.parse(this._trialEndsAt) - 24 * 60 * 60 * 1000 >
      Date.parse(new Date().toString())
    ) {
      this._diff =
        Date.parse(this._trialEndsAt) +
        this.product_quantity * this.produce_time * 60 * 1000 -
        Date.parse(Date().toString());
    } else {
      this._diff =
        24 * 60 * 60 * 1000 +
        this.product_quantity * this.produce_time * 60 * 1000;
    }

    this._days = this.getDays(this._diff);
    this._hours = this.getHours(this._diff);
    this._minutes = this.getMinutes(this._diff);
    this._seconds = this.getSeconds(this._diff);
  }
  //Method for increase product quantity in shopping cart modal
  increaseProduct_quantity() {
    if (this.product_quantity < this.data.quantity) {
      this.product_quantity += 1;
      this.getProductAvailableDate();
      this.updateProductOrderTime();
    }
  }
  //Method for decrease product quantity in shopping cart modal
  decreaseProduct_quantity() {
    if (this.product_quantity > 1) {
      this.product_quantity -= 1;
      this.getProductAvailableDate();
      this.updateProductOrderTime();
    }
  }
  //Method for add to favourite
  addToFavourite(product: Product) {
    let userId = this.authService.getCurrentUserId();
    if (userId) {
      let f = {
        product_id: product.id,
        user_id: userId
      };

      this.store.dispatch(new fromStore.AddToFavouriteProduct(f));
      this.toastr.success("add to Whishlist succeeded", 'Note');
    } else {
      this._notify.create("warning", "Please Login First");

      this.loginModalService.showLoginModal(true);
    }
  }
  //Method for add to compare
  addToCompare(product: Product) {
    this.store.dispatch(new fromStore.AddToCompare(product));
    this._notify.success("add to compare succeeded");
  }

  erroralert() {
    this._notify.error("compare list is full, delete first!!!");
  }
  //Method for totol quantity check
  quantityCheck() {
    setTimeout(() => {
      this.product_quantity =
        this.product_quantity > this.data.quantity
          ? this.data.quantity
          : this.product_quantity < 1
          ? 1
          : this.product_quantity;
    }, 2000);
  }

  variantChange(type, $event: MatButtonToggleChange) {
    if (type == 0) return;

    this.variantCalculatedTotalPrice = 0;
    this.variantCalculatedPrice = [];
    this.cartVariants.map(cv => {
      if (cv.variant_type == 1) {
        this.variantCalculatedPrice.push({
          name: cv.warehouse_variant_name,
          price: cv.variant_price,
          quantity: cv.variant_quantity,
          variant_name: cv.variant_name
        });
        this.variantCalculatedTotalPrice +=
          cv.variant_price * cv.variant_quantity;
      }
    });
    this.updateFinalprice();
  }
}
