exports.categoryRoutes = {
  'DELETE /api/v1/category_type/:id': [
    {controller: 'CategoryController', action: 'destroyType'}
  ],
  'DELETE /api/v1/category_product/:id': [
    {controller: 'CategoryController', action: 'destroyProduct'}
  ],
  'GET /api/v1/category_type': [
    {controller: 'CategoryController', action: 'getType'}
  ],
  'GET /api/v1/category_product': [
    {controller: 'CategoryController', action: 'getProduct'}
  ],
  'GET /api/v1/category_type/:id': [
    {controller: 'CategoryController', action: 'getSingleType'}
  ],
  'GET /api/v1/category_product/:id': [
    {controller: 'CategoryController', action: 'getSingleProduct'}
  ],
  'POST /api/v1/category_type': [
    {controller: 'CategoryController', action: 'createType'}
  ],
  'POST /api/v1/category_product': [
    {controller: 'CategoryController', action: 'createProduct'}
  ],
  'PUT /api/v1/category_type/:id': [
    {controller: 'CategoryController', action: 'updateType'}
  ],
  'PUT /api/v1/category_product/:id': [
    {controller: 'CategoryController', action: 'updateProduct'}
  ],
  'DELETE /api/v1/category/remove-image/:id/:type': [
    {controller: 'CategoryController', action: 'removeImage'}
  ],
  'GET /api/v1/category/with-subcategories-v2': [
    {controller: 'CategoryController', action: 'withSubcategoriesV2'}
  ],
  'GET /api/v1/category/all-categories-v2': [
    {controller: 'CategoryController', action: 'allCategories'}
  ],
};
