exports.adminUsersRoute = {
  'GET /api/v1/admin-users/getAllAdminUsers': 'AdminUsersController.getAllAdminUsers',
  'POST /api/v1/admin-users/createAdminUser': 'AdminUsersController.createAdminUser',
  'GET /api/v1/admin-users/getAllGroups': 'AdminUsersController.getAllGroups',
  'PUT /api/v1/admin-users/updateAdminUser': 'AdminUsersController.updateAdminUser',
  'GET /api/v1/admin-users/getById': 'AdminUsersController.getById',
};
