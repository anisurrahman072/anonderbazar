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
    'destroy': ['isAuthorized', 'isAdminUser']
  },
  AuthController: {
    '*': true,
  },
  BrandController: {
    '*': false,
    'find': true,
    'findOne': true,
    'getAll': true,
    'uniqueCheckName': ['isAuthorized', 'isAdminUserOrOwner'],
    'create': ['isAuthorized', 'isAdminUserOrOwner', 'checkPermission(\'brand-create\')'],
    'update': ['isAuthorized', 'isAdminUserOrOwner', 'checkPermission(\'brand-edit\')'],
    'destroy': ['isAuthorized', 'isAdminUserOrOwner', 'checkPermission(\'brand-delete\')'],
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
    'destroy': ['isAuthorized', 'isAdminUser', 'checkPermission(\'productcategory-delete\')'],
    'destroyType': ['isAuthorized', 'isAdminUser', 'checkPermission(\'productcategory-delete\')'],
    'destroyProduct': ['isAuthorized', 'isAdminUserOrOwner', 'checkPermission(\'producttype-delete\')'],
    'create': ['isAuthorized', 'isAdminUser', 'checkPermission(\'productcategory-create\')'],
    'createType': ['isAuthorized', 'isAdminUser', 'checkPermission(\'productcategory-create\')'],
    'createProduct': ['isAuthorized', 'isAdminUserOrOwner', 'checkPermission(\'producttype-create\')'],
    'update': ['isAuthorized', 'isAdminUser', 'checkPermission(\'productcategory-edit\')'],
    'updateType': ['isAuthorized', 'isAdminUser', 'checkPermission(\'productcategory-edit\')'],
    'updateProduct': ['isAuthorized', 'isAdminUserOrOwner', 'checkPermission(\'producttype-edit\')'],
    'removeImage': ['isAuthorized', 'isAdminUserOrOwner'],
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
    'byLotteryId': ['isAuthorized', 'isAdminUser', 'checkPermission(\'coupon-lottery-winner-list\', \'coupon-lottery\', \'coupon-lottery-list\', \'coupon-lottery-prizes\')'],
    'getAllWinner': true,
    'makeDraw': ['isAuthorized', 'isCustomer']
  },
  CMSController: {
    '*': false,
    'find': true,
    'findOne': true,
    'byIds': true,
    'getAll': true,
    'destroy': ['isAuthorized', 'isAdminUser'],
    'uploadCarouselImage': ['isAuthorized', 'isAdminUser'],
    'deleteCarouselImage': ['isAuthorized', 'isAdminUser'],
    'offerInsert': ['isAuthorized', 'isAdminUser'],
    'offerProductUpdate': ['isAuthorized', 'isAdminUser'],
    'updateOffer': ['isAuthorized', 'isAdminUser'],
    'customPostInsert': ['isAuthorized', 'isAdminUser'],
    'customPostUpdate': ['isAuthorized', 'isAdminUser'],
    'customInsert': ['isAuthorized', 'isAdminUser'],
    'customUpdate': ['isAuthorized', 'isAdminUser'],
    'customDelete': ['isAuthorized', 'isAdminUser'],
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
    'create': ['isAuthorized', 'isAdminUser', 'checkPermission(\'designcategory-create\')'],
    'withDesignSubcategory': true,
    'update': ['isAuthorized', 'isAdminUser', 'checkPermission(\'designcategory-edit\')'],
    'destroy': ['isAuthorized', 'isAdminUser', 'checkPermission(\'designcategory-delete\')'],
  },
  DesignController: {
    '*': false,
    'find': true,
    'findOne': true,
    'withDesignSubcategory': true,
    'create': ['isAuthorized', 'isAdminUser', 'checkPermission(\'design-create\')'],
    'update': ['isAuthorized', 'isAdminUser', 'checkPermission(\'design-edit\')'],
    'destroy': ['isAuthorized', 'isAdminUser'],
  },
  EventController: {
    '*': false,
    'find': true,
    'findOne': true,
    'create': ['isAuthorized', 'isAdminUser', 'checkPermission(\'event-create\')'],
    'update': ['isAuthorized', 'isAdminUser', 'checkPermission(\'event-edit\')'],
    'destroy': ['isAuthorized', 'isAdminUser', 'checkPermission(\'event-delete\')'],
  },
  EventPriceController: {
    '*': false,
    'find': true,
    'findOne': true,
    'create': ['isAuthorized', 'isAdminUser', 'checkPermission(\'event-price-create\')'],
    'update': ['isAuthorized', 'isAdminUser', 'checkPermission(\'event-price-edit\')'],
    'destroy': ['isAuthorized', 'isAdminUser', 'checkPermission(\'event-price-delete\')'],
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
    'create': ['isAuthorized', 'isAdminUser'],
    'update': ['isAuthorized', 'isAdminUser'],
    'destroy': ['isAuthorized', 'isAdminUser'],
    'updateGlobalConfig': ['isAuthorized', 'isAdminUser'],
    'getShippingCharge': true,
  },

  /*not used*/
  GroupController: {
    '*': false,
    'find': true,
    'findOne': true,
    'create': ['isAuthorized', 'isAdminUser'],
    'update': ['isAuthorized', 'isAdminUser'],
    'destroy': ['isAuthorized', 'isAdminUser'],
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
    'create': ['isAuthorized', 'isAdminUserOrOwner', 'checkPermission(\'product-create\')'],
    'update': ['isAuthorized', 'isAdminUserOrOwner', 'checkPermission(\'product-edit\')'],
    'destroy': ['isAuthorized', 'isAdminUserOrOwner', 'checkPermission(\'product-delete\')'],
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
    'productExcel': ['isAuthorized', 'isAdminUserOrOwner'],
    'bulkUpdate': ['isAuthorized', 'isAdminUserOrOwner'],
    'generateExcel': ['isAuthorized', 'isAdminUserOrOwner'],
    'bulkUpload': ['isAuthorized', 'isAdminUserOrOwner'],
    'getProductsByName': ['isAuthorized', 'isAdminUserOrOwner'],
    'getByCategorySubCategory': ['isAuthorized', 'isAdminUserOrOwner']
  },
  ProductCategoriesController: {
    'getAll': true,
    'withProductSubcategory': true
  },
  ProductVariantController: {
    '*': false,
    'byvariant': true,
    'find': ['isAuthorized', 'isAdminUserOrOwner'],
    'findOne': ['isAuthorized', 'isAdminUserOrOwner'],
    'destroy': ['isAuthorized', 'isAdminUserOrOwner'],
    'create': ['isAuthorized', 'isAdminUserOrOwner']
  },
  PaymentController: {
    '*': false,
    'find': true,
    'findOne': true,
    'create': ['isAuthorized', 'isAdminUser', 'checkPermission(\'payment-create\')'],
    'update': ['isAuthorized', 'isAdminUser', 'checkPermission(\'payment-edit\')'],
    'destroy': ['isAuthorized', 'isAdminUser', 'checkPermission(\'payment-delete\')'],
  },
  PaymentsController: {
    '*': false,
    'getAll': ['isAuthorized'],
    'changeApprovalStatus': ['isAuthorized', 'isAdminUser'],
    'makeAdminPayment': ['isAuthorized', 'isAdminUser']
  },
  OrderPartialPaymentController: {
    '*': ['isAuthorized', 'isCustomer'],
    'refundPayments': ['isAuthorized', 'isAdminUser']
  },
  PRStatusController: {
    '*': false,
    'find': true,
    'findOne': true,
    'getall': true,
    'destroy': ['isAuthorized', 'isAdminUser'],
    'create': ['isAuthorized', 'isAdminUser'],
    'update': ['isAuthorized', 'isAdminUser'],
    'massInsert': ['isAuthorized', 'isAdminUser'],
  },
  ProductDesignController: {
    '*': false,
    'find': true,
    'findOne': true,
    'destroy': ['isAuthorized', 'isAdminUser'],
    'create': ['isAuthorized', 'isAdminUser'],
    'update': ['isAuthorized', 'isAdminUser'],
  },
  ProductImageController: {
    '*': false,
    'find': true,
    'findOne': true,
    'create': ['isAuthorized', 'isAdminUserOrOwner'],
    'update': ['isAuthorized', 'isAdminUserOrOwner'],
    'destroy': ['isAuthorized', 'isAdminUserOrOwner'],
  },
  ProductRatingController: {
    '*': false,
    'find': true,
    'findOne': true,
    'create': ['isAuthorized'],
    'update': ['isAuthorized'],
    'destroy': ['isAuthorized', 'isAdminUserOrOwner'],
  },
  InvestorController: {
    '*': true,
    'updateInvestorStatus': ['isAuthorized', 'isAdminUser', 'checkPermission(\'investor\')'],
    'getAllInvestor': ['isAuthorized', 'isAdminUser', 'checkPermission(\'investor\')']
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
    'update': ['isAuthorized', 'isAdminUser'],
    'updatePaymentStatus': ['isAuthorized', 'isAdminUser'],
    'destroy': ['isAuthorized', 'isAdminUser'],
    'populate': ['isAuthorized', 'isAdminUser'],
    'getAllOrder': ['isAuthorized', 'isAdminUser'],
    'allOrders': ['isAuthorized', 'isAdminUser', 'checkPermission(\'order-list\')'],
    'getCancelledOrder': ['isAuthorized', 'isAdminUser'],
    'refundCancelOrder': ['isAuthorized', 'isAdminUser']
  },
  MissingOrderController: {
    '*': ['isAuthorized', 'isAdminUserOrOwner', 'checkPermission(\'missing-orders\')']
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
    'updatecustom': ['isAuthorized', 'isAdminUserOrOwner'],
    'updatecustomcourier': ['isAuthorized', 'isAdminUserOrOwner'],
    'currentTime': true
  },
  SuborderController: {
    '*': false,
    'find': true,
    'findOne': true,
    'getSuborder': true,
    'getSuborderWithDate': true,
    'getWithFull': true,
    'destroy': ['isAuthorized', 'isAdminUserOrOwner'],
    'create': ['isAuthorized', 'isAdminUserOrOwner'],
    'update': ['isAuthorized', 'isAdminUserOrOwner'],
    'updatebyorderid': ['isAuthorized', 'isAdminUserOrOwner'],
  },
  SubordersController: {
    'getAll': ['isAuthorized', 'isAdminUserOrOwner'],
    'getsuborderwithpr': ['isAuthorized', 'isAdminUserOrOwner'],
  },
  SubOrderItemController: {
    '*': false,
    'find': true,
    'findOne': true,
    'getSuborderItems': true,
    'getByOrderIds': ['isAuthorized', 'isAdminUserOrOwner'],
    'getOrdersByDate': ['isAuthorized', 'isAdminUserOrOwner'],
    'getBySubOrderIds': ['isAuthorized', 'isAdminUserOrOwner'],
    'destroy': ['isAuthorized', 'isAdminUserOrOwner'],
    'create': ['isAuthorized', 'isAdminUserOrOwner'],
    'update': ['isAuthorized', 'isAdminUserOrOwner'],
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
    'getAll': ['isAuthorized', 'isAdminUser', 'checkPermission(\'warehouse\')', 'checkPermission(\'warehouse-read\')'],
    'destroy': ['isAuthorized', 'isAdminUser', 'checkPermission(\'warehouse-delete\')'],
    'createCustom': ['isAuthorized', 'isAdminUser'],
    'updateCustom': ['isAuthorized', 'isAdminUser'],
  },
  VariantController: {
    '*': false,
    'find': true,
    'findOne': true,
    'destroy': ['isAuthorized', 'isAdminUser', 'checkPermission(\'variant-delete\')'],
    'create': ['isAuthorized', 'isAdminUser', 'checkPermission(\'variant-create\')'],
    'update': ['isAuthorized', 'isAdminUser', 'checkPermission(\'variant-edit\')'],
  },
  WarehouseVariantController: {
    '*': false,
    'find': true,
    'findOne': true,
    'destroy': ['isAuthorized', 'isAdminUser'],
    'create': ['isAuthorized', 'isAdminUser', 'checkPermission(\'warehousevariant-create\')'],
    'update': ['isAuthorized', 'isAdminUser', 'checkPermission(\'warehousevariant-edit\')'],
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
    'getAllGroups': ['isAuthorized', 'isAdmin', 'checkPermission(\'role-management\')'],
    'deleteGroup': ['isAuthorized', 'isAdmin', 'checkPermission(\'role-management-delete\')'],
    'getAllGroupsPermissions': ['isAuthorized', 'isAdmin'],
    'groupInsert': ['isAuthorized', 'isAdmin', 'checkPermission(\'role-management-create\')'],
    'getGroupsById': ['isAuthorized', 'isAdmin'],
    'groupUpdate': ['isAuthorized', 'isAdmin', 'checkPermission(\'role-management-edit\')'],
    'checkGroupName': ['isAuthorized', 'isAdmin'],
  },

  AdminUsersController: {
    '*': false,
    'getAllAdminUsers': ['isAuthorized', 'isAdmin', 'checkPermission(\'admin-users\')'],
    'createAdminUser': ['isAuthorized', 'isAdmin', 'checkPermission(\'admin-users-create\')'],
    'getAllGroups': ['isAuthorized', 'isAdmin'],
    'updateAdminUser': ['isAuthorized', 'isAdmin', 'checkPermission(\'admin-users-edit\')'],
    'getById': ['isAuthorized', 'isAdmin'],
  }
};
