/**
 * Policy Mappings
 * (sails.config.policies)
 *
 * Policies are simple functions which run **before** your actions.
 *
 * For more information on configuring policies, check out:
 * https://sailsjs.com/docs/concepts/policies
 */

module.exports.policies = {

  /***************************************************************************
   *                                                                          *
   * Default policy for all controllers and actions, unless overridden.       *
   * (`true` allows public access)                                            *
   *                                                                          *
   ***************************************************************************/
  AreaController: {
    '*': false,
    'find': true,
    'findOne': true,
    'destroy': ['isAuthorized', 'isAdmin']
  },
  AuthController: {
    '*': true,
  },
  BrandController: {
    '*': false,
    'find': true,
    'findOne': true,
    'create': ['isAuthorized', 'isOwnerOrAdmin'],
    'update': ['isAuthorized', 'isOwnerOrAdmin'],
    'destroy': ['isAuthorized', 'isOwnerOrAdmin'],
  },
  CartController: {
    '*': false,
    'find': ['isAuthorized', 'isCustomer'],
    'findOne': ['isAuthorized', 'isCustomer'],
    'destroy': ['isAuthorized', 'isCustomer'],
    'authUserCart': ['isAuthorized', 'isCustomer'],
    'findwithcartItems': ['isAuthorized', 'isCustomer'],
  },
  CartItemController: {
    '*': false,
    'destroy': ['isAuthorized', 'isCustomer'],
    'bycartid': ['isAuthorized', 'isCustomer'],
    'create': ['isAuthorized', 'isCustomer'],
    'update': ['isAuthorized', 'isCustomer'],
  },
  CartItemVariantController: {
    '*': false,
    'destroy': ['isAuthorized', 'isCustomer'],
  },
  CategoryController: {
    '*': false,
    'findOne': true,
    'find': true,
    'destroy': ['isAuthorized', 'isAdmin'],
    'destroyType': ['isAuthorized', 'isAdmin'],
    'destroyProduct': ['isAuthorized', 'isAdmin'],
    'create': ['isAuthorized', 'isAdmin'],
    'createType': ['isAuthorized', 'isAdmin'],
    'createProduct': ['isAuthorized', 'isAdmin'],
    'update': ['isAuthorized', 'isAdmin'],
    'updateType': ['isAuthorized', 'isAdmin'],
    'updateProduct': ['isAuthorized', 'isAdmin'],
    'getType': true,
    'getProduct': true,
    'getSingleType': true,
    'getSingleProduct': true,
    'withSubcategories': true,
    'withProductSubcategory': true,
  },
  CraftmanPricesController: {
    'getAll': true
  },
  CMSController: {
    '*': false,
    'find': true,
    'findOne': true,
    'destroy': ['isAuthorized', 'isAdmin'],
    'offerInsert': ['isAuthorized', 'isAdmin'],
    'offerProductUpdate': ['isAuthorized', 'isAdmin'],
    'updateOffer': ['isAuthorized', 'isAdmin'],
    'customPostInsert': ['isAuthorized', 'isAdmin'],
    'customPostUpdate': ['isAuthorized', 'isAdmin'],
    'customInsert': ['isAuthorized', 'isAdmin'],
    'customUpdate': ['isAuthorized', 'isAdmin'],
    'customDelete': ['isAuthorized', 'isAdmin'],
  },
  DesignCategoriesController: {
    '*': false,
    'getAll': true,
    'withDesignSubcategory': true
  },
  DesignCategoryController: {
    '*': false,
    'find': true,
    'findOne': true,
    'create': ['isAuthorized', 'isAdmin'],
    'withDesignSubcategory': true,
    'update': ['isAuthorized', 'isAdmin'],
    'destroy': ['isAuthorized', 'isAdmin'],
  },
  DesignController: {
    '*': false,
    'find': true,
    'findOne': true,
    'withDesignSubcategory': true,
    'create': ['isAuthorized', 'isAdmin'],
    'update': ['isAuthorized', 'isAdmin'],
    'destroy': ['isAuthorized', 'isAdmin'],
  },
  EventController: {
    '*': false,
    'find': true,
    'findOne': true,
    'create': ['isAuthorized', 'isAdmin'],
    'update': ['isAuthorized', 'isAdmin'],
    'destroy': ['isAuthorized', 'isAdmin'],
  },
  EventPriceController: {
    '*': false,
    'find': true,
    'findOne': true,
    'create': ['isAuthorized', 'isAdmin'],
    'update': ['isAuthorized', 'isAdmin'],
    'destroy': ['isAuthorized', 'isAdmin'],
  },
  EventPricesController: {
    '*': false,
    'index': true,
    'getPriceByIds': true
  },
  EventRegistrationController: {
    '*': false,
    'find': true,
    'findOne': true,
    'create': ['isAuthorized'],
    'update': ['isAuthorized'],
    'destroy': ['isAuthorized'],
  },
  FavouriteProductController: {
    '*': false,
    'find': true,
    'findOne': true,
    'create': ['isAuthorized'],
    'update': ['isAuthorized'],
    'destroy':['isAuthorized'],
    'deleteAll': ['isAuthorized'],
    'byAuthUser': ['isAuthorized', 'isCustomer'],
    'byUser': ['isAuthorized'],
  },
  GlobalConfigsController: {
    '*': false,
    'find': true,
    'findOne': true,
    'create': ['isAuthorized', 'isAdmin'],
    'update': ['isAuthorized', 'isAdmin'],
    'destroy': ['isAuthorized', 'isAdmin'],
  },
  GroupController: {
    '*': false,
    'find': true,
    'findOne': true,
    'create': ['isAuthorized', 'isAdmin'],
    'update': ['isAuthorized', 'isAdmin'],
    'destroy': ['isAuthorized', 'isAdmin'],
  },
  PaymentAddressController: {
    '*': false,
    'find': ['isAuthorized'],
    'findOne': ['isAuthorized'],
    'create': ['isAuthorized'],
    'update': ['isAuthorized'],
    'destroy': ['isAuthorized'],
  },
  ProductController: {
    '*': true,
    'add': false,
    'remove': false,
    'replace': false,
    'create': ['isAuthorized', 'isOwnerOrAdmin'],
    'update': ['isAuthorized', 'isOwnerOrAdmin'],
    'destroy': ['isAuthorized', 'isOwnerOrAdmin'],
  },
  ProductsController: {
    'index': true,
    'findOne': true,
    'designCombination': true,
    'search': true,
    'getBySearchTerm': true,
    'generateExcel': ['isAuthorized', 'isOwnerOrAdmin'],
    'bulkUpload': ['isAuthorized', 'isOwnerOrAdmin'],
  },
  ProductCategoriesController: {
    'getAll': true,
    'withProductSubcategory': true
  },
  ProductVariantController: {
    '*': false,
    'byvariant': true,
    'find': ['isAuthorized', 'isOwnerOrAdmin'],
    'findOne': ['isAuthorized', 'isOwnerOrAdmin'],
    'destroy': ['isAuthorized', 'isOwnerOrAdmin'],
    'create': ['isAuthorized', 'isOwnerOrAdmin']
  },
  PaymentController: {
    '*': false,
    'find': true,
    'findOne': true,
    'create': true,
    'update': ['isAuthorized', 'isAdmin'],
    'destroy': ['isAuthorized', 'isAdmin'],
  },
  PaymentsController: {
    '*': false,
    'getAll': ['isAuthorized']
  },
  PRStatusController: {
    '*': false,
    'find': true,
    'findOne': true,
    'destroy': ['isAuthorized', 'isAdmin'],
    'create': ['isAuthorized', 'isAdmin'],
    'update': ['isAuthorized', 'isAdmin'],
    'massInsert': ['isAuthorized', 'isAdmin'],
  },
  ProductDesignController:{
    '*': false,
    'find': true,
    'findOne': true,
    'destroy': ['isAuthorized', 'isAdmin'],
    'create': ['isAuthorized', 'isAdmin'],
    'update': ['isAuthorized', 'isAdmin'],
  },
  ProductImageController: {
    '*': false,
    'find': true,
    'findOne': true,
    'create': ['isAuthorized', 'isOwnerOrAdmin'],
    'update': ['isAuthorized', 'isOwnerOrAdmin'],
    'destroy': ['isAuthorized', 'isOwnerOrAdmin'],
  },
  ProductRatingController: {
    '*': false,
    'find': true,
    'findOne': true,
    'create': ['isAuthorized'],
    'update': ['isAuthorized'],
    'destroy': ['isAuthorized', 'isOwnerOrAdmin'],
  },
  OrderController: {
    '*': ['isAuthorized'],
    'sslcommerzsuccess': true,
    'sslcommerzfail': true,
    'sslcommerzerror': true,
    'create': false,
    'add': false,
    'remove': false,
    'replace': false,
    'findOne': ['isAuthorized'],
    'update': ['isAuthorized', 'isAdmin'],
    'destroy': ['isAuthorized', 'isAdmin'],
    'populate': ['isAuthorized', 'isAdmin'],
    'getAllOrder': ['isAuthorized', 'isAdmin'],
    'allOrders': ['isAuthorized', 'isAdmin'],
  },
  ShippingAddressController: {
    '*': false,
    'find': true,
    'findOne': true,
    'destroy': ['isAuthorized'],
    'create': ['isAuthorized'],
    'update': ['isAuthorized'],
  },
  StatusChangeController: {
    'updatecustom': ['isAuthorized', 'isOwnerOrAdmin'],
    'updatecustomcourier': ['isAuthorized', 'isOwnerOrAdmin'],
  },
  SuborderController: {
    '*': false,
    'find': true,
    'findOne': true,
    'getSuborder': true,
    'getSuborderWithDate': true,
    'getWithFull': true,
    'destroy': ['isAuthorized', 'isOwnerOrAdmin'],
    'create': ['isAuthorized', 'isOwnerOrAdmin'],
    'update': ['isAuthorized', 'isOwnerOrAdmin'],
    'updatebyorderid': ['isAuthorized', 'isOwnerOrAdmin'],
  },
  SubordersController: {
    'getAll': ['isAuthorized', 'isOwnerOrAdmin'],
    'getsuborderwithpr': ['isAuthorized', 'isOwnerOrAdmin'],
  },
  SubOrderItemController: {
    '*': false,
    'find': true,
    'findOne': true,
    'getSuborderItems': true,
    'destroy': ['isAuthorized', 'isOwnerOrAdmin'],
    'create': ['isAuthorized', 'isOwnerOrAdmin'],
    'update': ['isAuthorized', 'isOwnerOrAdmin'],
  },
  UserController: {
    '*': false,
    'updatepassword': true,
    'checkUsername': true,
    'checkEmail': true,
    'checkPhone': true,
    'destroy': ['isAuthorized', 'isOwnerOrAdmin'],
    'findOne': ['isAuthorized'],
    'find': ['isAuthorized', 'isOwnerOrAdmin'],
    'create': ['isAuthorized'],
    'update': ['isAuthorized'],
    'getAuthCustomerData': ['isAuthorized'],
    'authUser': ['isAuthorized', 'isCustomer'],
    'getUserWithDashboardData': ['isAuthorized']
  },
  WarehouseController: {
    '*': false,
    'find': true,
    'findOne': true,
    'getAll': ['isAuthorized'],
    'destroy': ['isAuthorized', 'isAdmin'],
    'create': ['isAuthorized', 'isAdmin'],
    'update': ['isAuthorized', 'isOwnerOrAdmin'],
  },
  VariantController: {
    '*': false,
    'find': true,
    'findOne': true,
    'destroy': ['isAuthorized', 'isOwnerOrAdmin'],
    'create': ['isAuthorized', 'isOwnerOrAdmin'],
    'update': ['isAuthorized', 'isOwnerOrAdmin'],
  },
  WarehouseVariantController: {
    '*': false,
    'find': true,
    'findOne': true,
    'destroy': ['isAuthorized', 'isOwnerOrAdmin'],
    'create': ['isAuthorized', 'isOwnerOrAdmin'],
    'update': ['isAuthorized', 'isOwnerOrAdmin'],
  },
  WarehouseVariantsController: {
    '*': false,
    'getAll': true
  }
};
