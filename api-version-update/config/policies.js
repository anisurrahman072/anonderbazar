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
    'getAll': true,
    'uniqueCheckName': ['isAuthorized', 'isOwnerOrAdmin'],
    'create': ['isAuthorized', 'isOwnerOrAdmin'],
    'update': ['isAuthorized', 'isOwnerOrAdmin'],
    'destroy': ['isAuthorized', 'isOwnerOrAdmin'],
  },
  BrandsController: {
    '*': true,
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
    'removeImage': ['isAuthorized', 'isAdmin'],
    'getType': true,
    'withSubcategoriesforSpecific': true,
    'getProduct': true,
    'getSingleType': true,
    'allCategories': true,
    'getSingleProduct': true,
    'withSubcategories': true,
    'withProductSubcategory': true,
    'withSubcategoriesV2': true,
  },
  CraftmanPricesController: {
    'getAll': true
  },
  CouponLotteryDrawController: {
    '*': false,
    'byLotteryId': ['isAuthorized', 'isAdmin'],
    'getAllWinner': true,
    'makeDraw': ['isAuthorized', 'isCustomer']
  },
  CMSController: {
    '*': false,
    'find': true,
    'findOne': true,
    'byIds': true,
    'getAll': true,
    'destroy': ['isAuthorized', 'isAdmin'],
    'uploadCarouselImage': ['isAuthorized', 'isAdmin'],
    'deleteCarouselImage': ['isAuthorized', 'isAdmin'],
    'offerInsert': ['isAuthorized', 'isAdmin'],
    'offerProductUpdate': ['isAuthorized', 'isAdmin'],
    'updateOffer': ['isAuthorized', 'isAdmin'],
    'customPostInsert': ['isAuthorized', 'isAdmin'],
    'customPostUpdate': ['isAuthorized', 'isAdmin'],
    'customInsert': ['isAuthorized', 'isAdmin'],
    'customUpdate': ['isAuthorized', 'isAdmin'],
    'customDelete': ['isAuthorized', 'isAdmin'],
  },
  Cms2Controller: {
    'byPageNSection': true,
    'byPageNSectionNSubsection': true,
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
    'destroy': ['isAuthorized'],
    'deleteAll': ['isAuthorized'],
    'byAuthUser': ['isAuthorized', 'isCustomer'],
    'byUser': ['isAuthorized'],
  },
  GlobalConfigsController: {
    '*': false,
    'find': true,
    'findOne': true,
    'getGlobalConfig': true,
    'create': ['isAuthorized', 'isAdmin'],
    'update': ['isAuthorized', 'isAdmin'],
    'destroy': ['isAuthorized', 'isAdmin'],
    'updateGlobalConfig': ['isAuthorized', 'isAdmin'],
    'getShippingCharge': true,
  },
  GroupController: {
    '*': false,
    'find': true,
    'findOne': true,
    'create': ['isAuthorized', 'isAdmin'],
    'update': ['isAuthorized', 'isAdmin'],
    'destroy': ['isAuthorized', 'isAdmin'],
  },
  ImageController: {
    '*': true
  },
  PaymentAddressController: {
    '*': false,
    'find': ['isAuthorized'],
    'authUserAddresses': ['isAuthorized', 'isCustomer'],
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
  QuestionsController: {
    '*': true
  },
  ProductsController: {
    'index': true,
    'findOne': true,
    'designCombination': true,
    'search': true,
    'getBySearchTerm': true,
    'productExcel': ['isAuthorized', 'isOwnerOrAdmin'],
    'bulkUpdate': ['isAuthorized', 'isOwnerOrAdmin'],
    'generateExcel': ['isAuthorized', 'isOwnerOrAdmin'],
    'bulkUpload': ['isAuthorized', 'isOwnerOrAdmin'],
    'getProductsByName': ['isAuthorized', 'isOwnerOrAdmin'],
    'getByCategorySubCategory': ['isAuthorized', 'isOwnerOrAdmin']
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
    'getAll': ['isAuthorized'],
    'changeApprovalStatus': ['isAuthorized', 'isAdmin'],
    'makeAdminPayment': ['isAuthorized', 'isAdmin']
  },
  OrderPartialPaymentController: {
    '*': ['isAuthorized', 'isCustomer'],
    'refundPayments': ['isAuthorized', 'isAdmin']
  },
  PRStatusController: {
    '*': false,
    'find': true,
    'findOne': true,
    'getall': true,
    'destroy': ['isAuthorized', 'isAdmin'],
    'create': ['isAuthorized', 'isAdmin'],
    'update': ['isAuthorized', 'isAdmin'],
    'massInsert': ['isAuthorized', 'isAdmin'],
  },
  ProductDesignController: {
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
  InvestorController: {
    '*': true,
    'updateInvestorStatus': ['isAuthorized', 'isAdmin'],
    'getAllInvestor': ['isAuthorized', 'isAdmin']
  },
  OrderController: {
    '*': ['isAuthorized'],
    'deleteOrder': true,
    'sslcommerzsuccess': true,
    'sslcommerzfail': true,
    'sslcommerzerror': true,
    'create': false,
    'add': false,
    'remove': false,
    'replace': false,
    'getOrderInvoiceData': ['isAuthorized'],
    'findOne': ['isAuthorized'],
    'update': ['isAuthorized', 'isAdmin'],
    'updatePaymentStatus': ['isAuthorized', 'isAdmin'],
    'destroy': ['isAuthorized', 'isAdmin'],
    'populate': ['isAuthorized', 'isAdmin'],
    'getAllOrder': ['isAuthorized', 'isAdmin'],
    'allOrders': ['isAuthorized', 'isAdmin'],
    'getCancelledOrder': ['isAuthorized', 'isAdmin'],
    'refundCancelOrder': ['isAuthorized', 'isAdmin']
  },
  MissingOrderController: {
    '*': ['isAuthorized', 'isOwnerOrAdmin']
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
    'currentTime': true
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
    'getByOrderIds': ['isAuthorized', 'isOwnerOrAdmin'],
    'getOrdersByDate': ['isAuthorized', 'isOwnerOrAdmin'],
    'getBySubOrderIds': ['isAuthorized', 'isOwnerOrAdmin'],
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
    'destroy': ['isAuthorized', 'isAdminUser'],
    'findOne': ['isAuthorized'],
    'find': ['isAuthorized', 'isAdminUser'],
    'getAllCustomers': ['isAuthorized', 'isAdminUser'],
    'getAllShopUsers': ['isAuthorized', 'isAdminUser'],
    'create': ['isAuthorized'],
    'update': ['isAuthorized'],
    'getAuthCustomerData': ['isAuthorized'],
    'authUser': ['isAuthorized', 'isCustomer'],
    'getUserWithDashboardData': ['isAuthorized']
  },
  WarehouseController: {
    '*': false,
    'updateUserStatus': true,
    'find': true,
    'findOne': true,
    'getAll': ['isAuthorized'],
    'destroy': ['isAuthorized', 'isAdminUser'],
    'createCustom': ['isAuthorized', 'isAdminUser'],
    'updateCustom': ['isAuthorized', 'isAdminUser'],
  },
  VariantController: {
    '*': false,
    'find': true,
    'findOne': true,
    'destroy': ['isAuthorized', 'isAdminUser'],
    'create': ['isAuthorized', 'isAdminUser'],
    'update': ['isAuthorized', 'isAdminUser'],
  },
  WarehouseVariantController: {
    '*': false,
    'find': true,
    'findOne': true,
    'destroy': ['isAuthorized', 'isAdminUser'],
    'create': ['isAuthorized', 'isAdminUser'],
    'update': ['isAuthorized', 'isAdminUser'],
  },
  WarehouseVariantsController: {
    '*': false,
    'getAll': true
  },
  BkashPaymentController: {
    'authUserWallets': ['isAuthorized', 'isCustomer'],
    'grandToken': ['isAuthorized', 'isCustomer'],
    'createAgreement': ['isAuthorized', 'isCustomer'],
    'cancelAgreement': ['isAuthorized', 'isCustomer'],
    'agreementCallback': true,
    'paymentCallback': true,
  },
  SslCommerzController: {
    '*': true
  },
  OfferController: {
    '*': true
  },

  RoleManagementController: {
    '*': false,
    'getAllGroups': ['isAuthorized', 'isAdmin'],
    'deleteGroup': ['isAuthorized', 'isAdmin'],
    'getAllGroupsPermissions': ['isAuthorized', 'isAdmin'],
    'groupInsert': ['isAuthorized', 'isAdmin'],
    'getGroupsById': ['isAuthorized', 'isAdmin'],
    'groupUpdate': ['isAuthorized', 'isAdmin'],
    'checkGroupName': ['isAuthorized', 'isAdmin'],
  },

  AdminUsersController: {
    '*': false,
    'getAllAdminUsers': ['isAuthorized', 'isAdmin'],
    'createAdminUser': ['isAuthorized', 'isAdmin'],
    'getAllGroups': ['isAuthorized', 'isAdmin'],
    'updateAdminUser': ['isAuthorized', 'isAdmin'],
    'getById': ['isAuthorized', 'isAdmin'],
  }
};
