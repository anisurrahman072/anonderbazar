import {warehousevariantRoute} from "./warehousevariant";
import {designcategoriesRoute} from "./designcategories";
import {productCategoryRoute} from "./productCategory";
import {typeCategoryRoute} from "./typeCategory";
import {craftsmanRoute} from "./craftsman";
import {productRoute} from './product';
import {variantRoute} from "./variant";
import {designRoute} from "./design";
import {genreRoute} from "./genre";
import {partsRoute} from "./part";
import {suborderRoute} from "./suborder";
import {PaymentsRoute} from "./payment";
import {craftsmanPriceRoute} from "./craftmenprice";
import {designImageRoute} from "./designImage";
import {favouriteproductRoute} from "./favouriteProduct";

export const allRouter = {
  ...warehousevariantRoute,
  ...designcategoriesRoute,
  ...productCategoryRoute,
  ...typeCategoryRoute,
  ...craftsmanPriceRoute,
  ...craftsmanRoute,
  ...variantRoute,
  ...productRoute,
  ...designRoute,
  ...genreRoute,
  ...partsRoute,
  ...suborderRoute,
  ...PaymentsRoute,
  ...designImageRoute,
  ...favouriteproductRoute

};
