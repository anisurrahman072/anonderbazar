exports.productRoute = {
  'GET /api/v1/products': 'ProductsController.index',
  'GET /api/v1/products/:_id': 'ProductsController.findOne',
  'GET /api/v1/products/getbysearchterm': 'ProductsController.getBySearchTerm',
  'GET /api/v1/products/search': 'ProductsController.search',
  'GET /api/v1/products/:_id/designcombination': 'ProductsController.designCombination',
  'GET /api/v1/products/generate-excel': 'ProductsController.generateExcel',
  'POST /api/v1/products/bulk-upload': 'ProductsController.bulkUpload'
};
