exports.userRoutes = {
  'GET /api/v1/user/getUserWithDashboardData/:id': 'UserController.getUserWithDashboardData',
  'PUT /api/v1/user/getUserWithDashboardData/userPasswordUpdate': 'AuthController.userPasswordUpdate',
  'PUT /api/v1/auth/forgetPassword': 'AuthController.customerForgetPassword',
};
