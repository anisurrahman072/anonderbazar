exports.brandRoute = {
  'GET /api/v1/brands': 'BrandsController.index',
  'GET /api/v1/brands/shopbybrand': 'BrandsController.shopbybrand',
  'GET /api/v1/brands/:id': 'BrandsController.findOne',
};
