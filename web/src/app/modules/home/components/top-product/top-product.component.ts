import {
  ChangeDetectionStrategy,
  Component,
  Input,
  OnInit
} from "@angular/core";
import { Observable } from "rxjs/Observable";
import { ProductService } from "../../../../services/product.service";
import { NguCarousel } from "@ngu/carousel";

@Component({
  selector: "home-top-product",
  templateUrl: "./top-product.component.html",
  styleUrls: ["./top-product.component.scss"],
  changeDetection: ChangeDetectionStrategy.OnPush
})
export class TopProductComponent implements OnInit {
  public carouselTile: NguCarousel = {
    grid: { xs: 1, sm: 1, md: 3, lg: 3, all: 0 },
    slide: 2,
    speed: 600,
    animation: "lazy",
    point: {
      visible: false
    },
    loop: true,
    load: 3,
    touch: true,
    easing: "ease"
  };
  limit: number;
  dataCustom: Observable<any>;
  dataReady: Observable<any>;

  constructor(private productService: ProductService) { }
// init the component
  ngOnInit() {
    this.limit = 3;
    this.getTopReadyProducts();
    this.getTopCustomProducts();
  }
  //Event method for getting all top custom product data for the page
  private getTopCustomProducts() {
    this.dataCustom = this.productService.getAllFeatureProducts();
  }
  //Event method for getting all the top ready product data for the page
  private getTopReadyProducts() {
    this.dataReady = this.productService.getAllFeatureProducts();
  }
}
