import {allRouter} from '../api/routes/index';

const prefix = '/api/v1';
module.exports.routes = {

  /***************************************************************************
   *                                                                          *
   * Make the view located at `views/homepage.ejs` (or `views/homepage.jade`, *
   * etc. depending on your default view engine) your home page.              *
   *                                                                          *
   * (Alternatively, remove this and add an `index.html` file in your         *
   * `assets` directory)                                                      *
   *                                                                          *
   ***************************************************************************/

  '/': {
    view: 'homepage'
  },
  // '/images/:param': [
  //   {controller: 'ImageController', action: 'sendImage'}
  // ],


  /***************************************************************************
   *                                                                          *
   * Custom routes here...                                                    *
   *                                                                          *
   * If a request to a URL doesn't match any of the custom routes above, it   *
   * is matched against Sails route blueprints. See `config/blueprints.js`    *
   * for configuration options and examples.                                  *
   *                                                                          *
   ***************************************************************************/
  // U
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

  ...allRouter

};
