import {AfterViewChecked, Component, ElementRef, OnDestroy, OnInit, TemplateRef, ViewChild} from "@angular/core";
import {ActivatedRoute, Router} from "@angular/router";
import {Subscription} from "rxjs/Subscription";
import {Store} from "@ngrx/store";
import {Observable} from "rxjs/Observable";
import {AlertsService} from "@jaspero/ng2-alerts";
import {NgProgress} from "@ngx-progressbar/core";
import {NotificationsService} from "angular2-notifications";
import {FavouriteProduct, Product} from "../../../../models";
import {AppSettings} from "../../../../config/app.config";
import {MatButtonToggleChange, MatDialog} from "@angular/material";
import {
  AuthService,
  CartItemService,
  CartItemVariantService,
  CartService,
  CraftsmanService, FavouriteProductService,
  ProductService,
  ProductVariantService
} from "../../../../services";
import * as fromStore from "../../../../state-management";
import {LoginModalService} from "../../../../services/ui/loginModal.service";
import {ToastrService} from "ngx-toastr";
import {PartService} from "../../../../services/part.service";
import {ChatService} from "../../../../services/chat.service";
import { BsModalService, BsModalRef } from 'ngx-bootstrap/modal';
import {FormBuilder, FormGroup, Validators} from "@angular/forms";
import {DesignimageService} from "../../../../services/designimage.service";
import {LoaderService} from "../../../../services/ui/loader.service";

export interface Food {
  value: string;
  viewValue: string;
}
@Component({
  selector: "page-product-details",
  templateUrl: "./product-details.component.html",
  styleUrls: ["./product-details.component.scss"]
})
export class ProductDetailsComponent implements OnInit, AfterViewChecked, OnDestroy {
  similarProducts;
  objectKeys = Object.keys;
  selectedVariant = [];
  id: any;
  data: Product;
  productVariants: any;
  private sub: Subscription;
  private sub1: Subscription;
  IMAGE_ENDPOINT = AppSettings.IMAGE_ENDPOINT;
  discountBadgeIcon: any;
  cart$: Observable<any>;
  cartId: any;
  //cartId: any=1;
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
  compare$: Observable<any>;
  favourites$: Observable<FavouriteProduct>;
  UnitPrice: any;
  availableDate: any;
  availableDateLoading: boolean = false;
  allTheParts: any;
  variantCalculatedPrice: {
    warehouse_variant_id?;
    product_variant_id?;
    name?;
    price?;
    quantity?;
    variant_name?;
    variant_id?;
  }[] = [];
  variantCalculatedTotalPrice: number = 0;
  clock: any = [9, 10, 11, 12, 13, 14, 15, 16, 17];
  stringClock: { [key: number]: string } = {
    9: "9am",
    10: "10am",
    11: "11am",
    12: "12pm",
    13: "1pm",
    14: "2pm",
    15: "3pm",
    16: "4pm",
    17: "5pm"
  };
  finalprice: any = 0.0;
  unitPrice: any = 0.0;
  days: any;
  hours: any;
  minutes: any;
  counter: number;

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

  designs: any = [
    {
      name: "Design-1"
    },
    {
      name: "Design-2"
    },
    {
      name: "Design-3"
    }
  ];
  selectedIndex: number;
  craftsman_id: any;
  designCombinationData: any;
  designImageCheck: any = [];
  allCraftsmanPrice: any;
  closeResult: string;
  modalRef: BsModalRef;
  design_id: any;
  craftsmanList: any = [];
  part_id: any;
  total: any;
  imagedata: any;
  buffer_time: any;
  foods: Food[] = [
    { value: 'steak-0', viewValue: 'Steak' },
    { value: 'pizza-1', viewValue: 'Pizza' },
    { value: 'tacos-2', viewValue: 'Tacos' }
  ];
  isVisible: boolean = false;
  isVisibleFab: boolean = false;
  listOfMessages: any;
  chatForm: FormGroup;
  currentUserId: any;
  userId: any;
  producttId: any;
  warehouseId: any;
  messageId: any;
  userdata: any;
  @ViewChild('scrollMe') private myScrollContainer: ElementRef;
  fileToUpload: File[] = [];
  createdData: Object;
  recentlyViewedProducts: Observable<any>;
  primaryPicture: string;
  addToCartSuccessProduct:any;
  addToWhishlistSuccessProduct:any;
  constructor(
    private route: ActivatedRoute,
    private chatService: ChatService,
    private _notify: NotificationsService,
    private _alert: AlertsService,
    public _progress: NgProgress,
    private store: Store<fromStore.HomeState>,
    private productVariantService: ProductVariantService,
    private productService: ProductService,
    private cartService: CartService,
    private authService: AuthService,
    private cartItemService: CartItemService,
    private loginModalService: LoginModalService,
    private cartItemVariantService: CartItemVariantService,
    private toastr: ToastrService,
    private designImageService:DesignimageService,
    public dialog: MatDialog,
    private fb: FormBuilder,
    private modalService: BsModalService,
    private craftsmanService: CraftsmanService,
    private partService: PartService, // private localCartService: LocalCartService, // private localCartItemService: LocalCartItemService, // private localStorageMergeService: LocalStorageMergeService
    private router: Router,
    public loaderService: LoaderService,
    private favouriteProductService: FavouriteProductService,
  ) {
    this.chatForm = this.fb.group({
      message: ["", Validators.required],
      files: [""]
    });
    this.discountBadgeIcon = AppSettings.IMAGE_ENDPOINT + '/images/discount-icon.svg'
  }
  //Event method for getting all the data for the page

  ngOnInit() {

    this.compare$ = this.store.select<any>(fromStore.getCompare);
    this.favourites$ = this.store.select<any>(fromStore.getFavouriteProduct);
    this.currentUserId = this.authService.getCurrentUserId();
    if (this.currentUserId) {
      this.isVisibleFab = true;
    }
    this.addTofavouriteLoading$ = this.store.select<any>(
      fromStore.getFavouriteProductLoading
    );
    this.partService.getAllParts().subscribe(result => {
      this.allTheParts = result.data;
    });

    this.sub1 = this.addTofavouriteLoading$.subscribe(res => {
      if (res) {
        this._progress.start("mainLoader");
      } else {
        this._progress.complete("mainLoader");
      }
    });
    this.partService
      .getAllCombinationByProductId(this.route.snapshot.params["id"])
      .subscribe(res => {
        this.designCombinationData = res.data;
      });

    this.cart$ = this.store.select<any>(fromStore.getCart);
    this.cart$.subscribe(result => {
      if (result) {
        this.cartId = result.data.id;
        this.cartTotalprice = result.data.total_price;
        this.cartTotalquantity = result.data.total_quantity;
      }
    });

    this.sub = this.route.params.subscribe(params => {
      this.id = +params["id"];

      this.getProductData();
      this.getAllVariant();
    });

    this.getRecentlyViewedProducts();
  }
  //Event method for getting all recently viewed product

  private getRecentlyViewedProducts() {
    this.recentlyViewedProducts = this.productService.getAllHotProducts();
  }

  ngAfterViewChecked() {
    this.scrollToBottom();
  }
  //Method for scroll to bottom

  scrollToBottom(): void {
    try {
      this.myScrollContainer.nativeElement.scrollTop = this.myScrollContainer.nativeElement.scrollHeight;
    } catch (err) { }
  }
    //Method for submitting the form
  public submitForm = ($event, value) => {
    let person_status = 0;
    const formData: FormData = new FormData();
    formData.append("message", value.message);
    formData.append("chat_user_id", this.messageId);
    if (this.fileToUpload) {
      formData.append('hasFile', 'true');
      formData.append('fileCounter', this.fileToUpload.length.toString());

      for (let i = 0; i < this.fileToUpload.length; i++) {
        formData.append('file' + i, this.fileToUpload[i], this.fileToUpload[i].name);
      }
    } else {
      formData.append('hasFile', 'false');
    }

    this.chatService.insert(formData).subscribe(
      result => {
        this.createdData = result;
        this.messageId = this.createdData["chat_user_id"];
        this.getChatMessages();
        this.chatForm.reset();
        this.fileToUpload = [];
      },
      error => {
      }
    );

  };
  handleFileInput(files: FileList) {
    this.fileToUpload.push(files.item(0));
  }
  //Method for removing file
  removeFile(index: number) {
    this.fileToUpload.splice(index, 1);
  }
  getChatMessages() {
    this.chatService.getAllChatByUserId(this.messageId).subscribe(result => {
      this.listOfMessages = result.data;
    });
    this.scrollToBottom();
  }
  showChatBox(userId, productId, warehouseId) {
    this.isVisible = true;
    this.userId = userId;
    this.producttId = productId;
    this.warehouseId = warehouseId;

    this.chatService.checkChatUser(this.userId, this.producttId, this.warehouseId).subscribe(result => {
      if (result[0]) {
        this.userdata = result[0];
        this.messageId = result[0].id;
        this.getChatMessages();
      }
      else {
        let person_status = 0;
        const formData: FormData = new FormData();
        formData.append("user_id", this.userId);
        formData.append("product_id", this.producttId);
        formData.append("warehouse_id", this.warehouseId);
        formData.append("person_status", person_status.toString());
        this.chatService.createChatUser(formData)
          .subscribe(result => {
            this.chatService.checkChatUser(this.userId, this.producttId, this.warehouseId).subscribe(result => {
              this.userdata = result[0];
            });

            this.messageId = result.id;
            this.getChatMessages();
          });
      }
    });


    this.isVisibleFab = false;

  }
  closeChatBox() {
    this.isVisible = false;
    this.isVisibleFab = true;
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
  getProductData() {
    this.loaderService.showLoader();
    this.productService.getById(this.id).subscribe(result => {
      this.loaderService.hideLoader();
      this.data = result;

      if (result) {
        let allImages = [];
        this.primaryPicture = this.IMAGE_ENDPOINT + this.data.image;
        if (this.data.image) {
          allImages.push({'image_path': this.data.image});
        }
        if (result.product_images) {
          result.product_images.forEach(element => {
            allImages.push(element);
          });
        }

        result.product_images = allImages;

        this.buffer_time = this.data.warehouse_id.buffer_time;
        this.getProductAvailableDate(this.buffer_time);

        this.mainImg = this.data.image;
        this.tempRating = result.rating;
        if(result.tag!="undefined")
         this.tag = JSON.parse(result.tag);
        this.updateFinalprice();
        this.getSimilarProductData(result.category_id.id, result.id);
      }
    });
  }
  getSimilarProductData(categotyId, productId) {
    this.similarProducts = this.productService.getByCategory(
      categotyId,
      productId
    );
  }

  updateFinalprice() {
    this.unitPrice = this.data.promotion ? this.data.promo_price : this.data.price;
    this.finalprice =
        (this.unitPrice +
            this.variantCalculatedTotalPrice) *
        this.product_quantity;
  }

  getAllVariant() {
    this.loaderService.showLoader();
    this.productVariantService
      .getAllVariantByProductId(this.id)
      .subscribe(result => {
        this.loaderService.hideLoader();
        if (result) {
          this.productVariants = result;
        }
      });
  }

  getVariantData() {
    let sum = 0;
    this.UnitPrice = this.cartVariants.reduce((sum: number, a) => {
      return sum + a.product_id.price;
    }, sum);
  }
  //Method for add to cart

  addProductToCart(product: any, callback?) {
    if (this.productVariants.length !== this.variantCalculatedPrice.length) {
      this.toastr.error('Please select all variant!', 'Note');
      return false;
    }
    if (this.authService.getCurrentUserId()) {
      this._progress.start("mainLoader");
      let product_total_price: number =
        (this.unitPrice +
          this.variantCalculatedTotalPrice) *
        this.product_quantity;

      let variants = [];
      let data = {};
      this.variantCalculatedPrice.forEach(v => {
        variants.push({
          warehouse_variant_id: v.warehouse_variant_id,
          variant_id: v.variant_id,
          product_variant_id: v.product_variant_id
        })
      });
      if(variants.length==0) {
          data = {
              cart_id: this.cartId,
              product_id: this.data.id,
              product_quantity: this.product_quantity,
              product_unit_price: this.unitPrice + this.variantCalculatedTotalPrice,
              product_total_price: product_total_price,
          };
      }else{
          data = {
              cart_id: this.cartId,
              product_id: this.data.id,
              product_quantity: this.product_quantity,
              product_unit_price: this.unitPrice + this.variantCalculatedTotalPrice,
              product_total_price: product_total_price,
              cartItemVariants: variants
          };
      }
      this.cartItemService
        .insert(data)
        .subscribe(
          result => {
            this.store.dispatch(new fromStore.LoadCart());

            this.addToCartSuccessProduct = product;
            setTimeout(()=>{
              this.addToCartSuccessProduct = undefined;
            },5000);

            this._progress.complete("mainLoader");
              this.toastr.success("Product Successfully Added To cart: " + product.name + " - ৳" + product_total_price, 'Note');

            if(callback){
              callback();
            }
          },
          error => {
            this._progress.complete("mainLoader");
            this._notify.error("something went wrong");
          }
        );
    } else {
      this.toastr.success("warning", "Please Login First");
      this.loginModalService.showLoginModal(true);
    }
  }
  //Method for direct buy

  buyNow(product){
    this.addProductToCart(product, ()=>{
      this.router.navigate([`/checkout`]);
    });
  }

  getProductAvailableDate(buffer_time: any) {
    this.availableDateLoading = true;
  }

  setProductAvailableSchedule(aDay, anHour, dayss, miliseconds) {
    this.days = this.replaceNumbers(
      Math.floor(miliseconds / aDay + 1).toString()
    );
    let hour = Math.floor((miliseconds - dayss * aDay) / anHour);
    this.hours = this.replaceNumbers(hour.toString());
    this.minutes = this.replaceNumbers(
      Math.round(
        (miliseconds - dayss * aDay - hour * anHour) / 60000
      ).toString()
    );
  }

  ngOnDestroy(): void {
    this.sub ? this.sub.unsubscribe() : "";
    this.sub1 ? this.sub1.unsubscribe() : "";
  }

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
  //Method for increase product quantity in shopping cart modal

  increaseProduct_quantity() {
    if (this.product_quantity < this.data.quantity) {
      this.product_quantity += 1;
      this.getProductAvailableDate(this.buffer_time);
    } else {
      this.toastr.error('Unable to increase quantity!', 'Sorry!');
      return false;
    }
  }
  //Method for decrese product quantity in shopping cart modal

  decreaseProduct_quantity() {
    if (this.product_quantity > 1) {
      this.product_quantity -= 1;
      this.getProductAvailableDate(this.buffer_time);
    } else {
      this.toastr.error('Unable to decrease quantity!', 'Sorry!');
      return false;
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
      this.addToWhishlistSuccessProduct = product;
      setTimeout(()=>{
        this.addToWhishlistSuccessProduct = undefined;
      },5000);

    } else {
      this._notify.create("warning", "Please Login First");

      this.loginModalService.showLoginModal(true);
    }
  }
  //Method for remove from favourite

  removeFromFavourite(favouriteProduct) {
    let userId = this.authService.getCurrentUserId();
    if (userId) {
      if (favouriteProduct) {
        this.favouriteProductService.delete(favouriteProduct.id).subscribe(res => {
          this.store.dispatch(new fromStore.LoadFavouriteProduct());
          this.toastr.info("Product removed from wishlist successfully.", "Note");
        })
      }
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

  checkSelected(variant){
    return this.variantCalculatedPrice.find(v => v.variant_name == variant.variant_id.name && v.product_variant_id == variant.id);
  }

  onVariantChange(variant){
    let isExist = this.variantCalculatedPrice.find(v=>v.variant_name==variant.variant_id.name);
      if(isExist){
      let index = this.variantCalculatedPrice.indexOf(isExist);
      this.variantCalculatedPrice[index]={
        warehouse_variant_id: variant.warehouses_variant_id.id,
        product_variant_id: variant.id,
        name : variant.name,
        quantity: variant.quantity,
        variant_name: variant.variant_id.name,
        variant_id: variant.variant_id.id
      }
    } else {
      this.variantCalculatedPrice.push({
        warehouse_variant_id: variant.warehouses_variant_id.id,
        product_variant_id: variant.id,
        name : variant.name,
        quantity: variant.quantity,
        variant_name: variant.variant_id.name,
        variant_id: variant.variant_id.id
      });
    }
    this.variantCalculatedTotalPrice = 0;
    this.variantCalculatedPrice.map(vp=> {
      this.variantCalculatedTotalPrice += vp.quantity
    });
    this.updateFinalprice();
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
    //Method for showing the modal
  openModal(template: TemplateRef<any>, id: any,part_id:number,part_name:string) {
    this.craftsman_id = null;

    this.designImageCheck[part_name] = `${part_id}:${id}`;
    let designCombinationObject = Object.assign({}, this.designImageCheck);

    this.designImageService.getImageWithCombination(JSON.stringify(designCombinationObject), this.data.id).subscribe(result=>{
      this.imagedata = result.data.images;
    });
    this.modalRef = this.modalService.show(template);
    this.craftsmanService.getCraftsmanAndPriceById(id).subscribe(result => {

      this.allCraftsmanPrice = result;
    });
  }
  public setRow(_index: number, id: any, craftman_id, design_id, part_id) {
    this.selectedIndex = _index; // don't forget to update the model here
    this.craftsman_id = craftman_id;
    this.design_id = design_id;
    this.part_id = part_id;
    // ... do other stuff here ...
  }
  confirm(): void {

    this.craftsmanService
      .getCraftsmanByBothDesignAndCraftsmanId(
        this.design_id,
        this.craftsman_id,
        this.part_id,
        this.data.id,

      )
      .subscribe(result => {
        if (result.pricedata[0].material_price.length > 0) {
          this.finalprice = result.pricedata[0].material_price[0].price + result.pricedata[0].price + this.finalprice;
          this.total = result.pricedata[0].material_price[0].price + result.pricedata[0].price;
        } else {
          this.finalprice = result.pricedata[0].price + this.finalprice;
          this.total = result.pricedata[0].price + this.total;
        }
        this.craftsmanList.push(result.pricedata[0]);
      });


    this.modalRef.hide();
  }

  decline(): void {
    this.modalRef.hide();
  }

  removeCraftsman(index: number,price:number, materialprice:number) {
    this.craftsmanList.splice(index, 1);
    if (materialprice) {
      this.total = this.total - price - materialprice;
      this.finalprice =this.finalprice - price - materialprice;
    } else {
      this.total = this.total - price;
      this.finalprice = this.finalprice - price;
    }
  }
}
