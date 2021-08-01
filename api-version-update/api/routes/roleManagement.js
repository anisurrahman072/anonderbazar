exports.roleManagementRoute = {
  'GET /api/v1/role-management/getAllGroups': 'RoleManagementController.getAllGroups',
  'DELETE /api/v1/role-management/deleteGroup': 'RoleManagementController.deleteGroup',
  'GET /api/v1/role-management/getAllGroupsPermissions': 'RoleManagementController.getAllGroupsPermissions',
  'POST /api/v1/role-management/groupInsert': 'RoleManagementController.groupInsert',
};
