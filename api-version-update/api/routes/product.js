exports.productRoute = {
  'GET /api/v1/products': 'ProductsController.index',
  'GET /api/v1/product/details/:id': 'ProductController.details',
  'GET /api/v1/product/unique-check-code/:code': 'ProductController.uniqueCheckCode',
  'GET /api/v1/products/:_id': 'ProductsController.findOne',
  'GET /api/v1/products/getbysearchterm': 'ProductsController.getBySearchTerm',
  'GET /api/v1/products/search': 'ProductsController.search',
  'GET /api/v1/products/:_id/designcombination': 'ProductsController.designCombination',
  'GET /api/v1/products/generate-excel': 'ProductsController.generateExcel',
  'GET /api/v1/products/product-excel': 'ProductsController.productExcel',
  'GET /api/v1/products/getCountByBrandIds': 'ProductsController.getCountByBrandIds',
  'POST /api/v1/products/bulk-upload': 'ProductsController.bulkUpload',
  'PUT /api/v1/products/bulk-update': 'ProductsController.bulkUpdate',
};
