const {categoryRoutes} = require('./category');
const {eventsRoutes} = require('./events');
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
const {brandRoute} = require('./brands');
const {orderRoutes} = require('./orders');
const {courierPricesRoute} = require('./courierprices');
const {paymentGatewayRoutes} = require('./payment_gateway');
const {lotteryRoutes} = require('./lottery');

exports.allRouter = {
  ...categoryRoutes,
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
  ...userRoutes,
  ...eventsRoutes,
  ...brandRoute,
  ...orderRoutes,
  ...courierPricesRoute,
  ...paymentGatewayRoutes,
  ...lotteryRoutes
};
