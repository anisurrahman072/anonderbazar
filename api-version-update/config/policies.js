/**
 * Policy Mappings
 * (sails.config.policies)
 *
 * Policies are simple functions which run **before** your actions.
 *
 * For more information on configuring policies, check out:
 * https://sailsjs.com/docs/concepts/policies
 */

module.exports.policies = {

  /***************************************************************************
   *                                                                          *
   * Default policy for all controllers and actions, unless overridden.       *
   * (`true` allows public access)                                            *
   *                                                                          *
   ***************************************************************************/

  // '*': true,
  UserController: {
    '*': true
  },
  OrderController: {
    '*': ['isAuthorized', 'isCustomer'],
    'getAllOrder': ['isAuthorized', 'isAdmin'],
  },
  BranController: {
    '*': false,
    'find': true,
    'findOne': true,
    'create': ['isAuthorized', 'isAdmin'],
    'update': ['isAuthorized', 'isAdmin'],
    'destroy': ['isAuthorized', 'isAdmin'],
  },
  AreaController: {
    '*': false,
    'find': true,
    'findOne': true,
    'create': true,
    'update': true,
    'destroy': ['isAuthorized', 'isAdmin']
  },
  AuthController: {
    '*': false,
    'login': true,
    'index': true,
    'dashboardLogin': true,
    'CustomerLogin': true,
    'warehouseSignup': true,
    'signup': true,
    'usernameUnique': true
  },
  CategoryController: {
    '*': false,
    'find': true,
    'create': ['isAuthorized', 'isAdmin'],
    'destroy': ['isAuthorized', 'isAdmin'],
    'getType': true,
    'getProduct': true,
    'getSingleType': true,
    'getSingleProduct': true,
    'createType': ['isAuthorized', 'isAdmin'],
    'createProduct': ['isAuthorized', 'isAdmin'],
    'update': ['isAuthorized', 'isAdmin'],
    'updateType': ['isAuthorized', 'isAdmin'],
    'updateProduct': ['isAuthorized', 'isAdmin'],
    'withSubcategories': true,
    'withProductSubcategory': true
  }
};
