const {warehousevariantRoute} = require('./warehousevariant');
const {designcategoriesRoute} = require('./designcategories');
const {productCategoryRoute} = require('./productCategory');
const {typeCategoryRoute} = require('./typeCategory');
const {craftsmanRoute} = require('./craftsman');
const {productRoute} = require('./product');
const {variantRoute} = require('./variant');
const {designRoute} = require('./design');
const {genreRoute} = require('./genre');
const {partsRoute} = require('./part');
const {suborderRoute} = require('./suborder');
const {PaymentsRoute} = require('./payment');
const {craftsmanPriceRoute} = require('./craftmenprice');
const {designImageRoute} = require('./designImage');
const {favouriteproductRoute} = require('./favouriteProduct');
const {userRoutes} = require('./user');

exports.allRouter = {
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
  ...favouriteproductRoute,
  ...userRoutes
};
