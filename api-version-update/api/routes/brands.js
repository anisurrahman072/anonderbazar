exports.brandRoute = {
  'POST /api/v1/brand/unique-check-name/:name': 'BrandController.uniqueCheckName',
  'GET /api/v1/brands': 'BrandsController.index',
  'GET /api/v1/brands/shopbybrand': 'BrandsController.shopbybrand',
  'GET /api/v1/brands/:id': 'BrandsController.findOne',
};
