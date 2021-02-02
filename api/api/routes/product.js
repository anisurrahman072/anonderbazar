export const productRoute = {
  'GET /api/v1/products': 'ProductsController.index',
  'POST /api/v1/products': 'ProductsController.create',
  'GET /api/v1/products/_id': 'ProductsController.findOne',
  'GET /api/v1/products/:_id/designcombination': 'ProductsController.designCombination',
  'GET /api/v1/products/generate-excel': 'ProductsController.generateExcel',
  'POST /api/v1/products/bulk-upload': 'ProductsController.bulkUpload'
};
