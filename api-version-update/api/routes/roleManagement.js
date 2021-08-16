exports.roleManagementRoute = {
  'GET /api/v1/role-management/getAllGroups': 'RoleManagementController.getAllGroups',
  'DELETE /api/v1/role-management/deleteGroup': 'RoleManagementController.deleteGroup',
  'GET /api/v1/role-management/getAllGroupsPermissions': 'RoleManagementController.getAllGroupsPermissions',
  'POST /api/v1/role-management/groupInsert': 'RoleManagementController.groupInsert',
  'GET /api/v1/role-management/getGroupsById': 'RoleManagementController.getGroupsById',
  'POST /api/v1/role-management/groupUpdate': 'RoleManagementController.groupUpdate',
  'POST /api/v1/role-management/checkGroupName': 'RoleManagementController.checkGroupName',
};
