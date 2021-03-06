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
const {paymentAddressesRoute} = require('./payment-addresses');
const {CouponLotteryRoute} = require('./couponLottery');
const {warehouseRoute} = require('./warehouse');
const {cmsRoutes} = require('./cms');
const {investorRoute} = require('./investor');
const {missingOrderRoute} = require('./missingOrder');
const {questionsRoute} = require('./questions');
const {offerRoute} = require('./offer');
const {anonderJhorRoute} = require('./anonderJhor');
const {ImageRoute} = require('./image');
const {roleManagementRoute} = require('./roleManagement');
const {adminUsersRoute} = require('./adminUsers');

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
  ...CouponLotteryRoute,
  ...paymentAddressesRoute,
  ...warehouseRoute,
  ...cmsRoutes,
  ...investorRoute,
  ...missingOrderRoute,
  ...questionsRoute,
  ...offerRoute,
  ...anonderJhorRoute,
  ...ImageRoute,
  ...roleManagementRoute,
  ...adminUsersRoute,
};
