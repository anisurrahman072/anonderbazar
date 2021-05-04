exports.warehouseRoute = {
  'POST /api/v1/warehouses/create-custom': 'WarehouseController.createCustom',
  'PUT /api/v1/warehouse/update-custom/:id': 'WarehouseController.updateCustom',
  'PUT /api/v1/warehouse/updateUserStatus/:id': 'WarehouseController.updateUserStatus',
};
