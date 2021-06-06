exports.userRoutes = {
  'GET /api/v1/user/getUserWithDashboardData/:id': 'UserController.getUserWithDashboardData',
  'PUT /api/v1/user/getUserWithDashboardData/userPasswordUpdate': 'AuthController.userPasswordUpdate',
  'PUT /api/v1/auth/forgetPassword': 'AuthController.customerForgetPassword',
  'POST /api/v1/auth/warehouseSignup': 'AuthController.warehouseSignup',
  'POST /api/v1/user/checkEmail': 'UserController.checkEmail',
  'POST /api/v1/user/checkPhone': 'UserController.checkPhone',
  'POST /api/v1/user/checkUsername': 'UserController.checkUsername',
  'GET /api/v1/user/all-customers': 'UserController.getAllCustomers',
  'GET /api/v1/user/all-shop-users': 'UserController.getAllShopUsers',
  'GET /api/v1/auth/verifyUserPhone': 'AuthController.verifyUserPhone',
  'GET /api/v1/auth/resendVerificationCode': 'AuthController.resendOTPCode',
};
