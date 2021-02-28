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
  ProductController: {
    '*': true,
    'add': false,
    'remove': false,
    'replace': false,
    'create': ['isAuthorized', 'isOwnerOrAdmin'],
    'update': ['isAuthorized', 'isOwnerOrAdmin'],
    'destroy': ['isAuthorized', 'isOwnerOrAdmin'],
  },
  OrderController: {
    '*': ['isAuthorized'],
    'create': false,
    'add': false,
    'remove': false,
    'replace': false,
    'update': ['isAuthorized', 'isAdmin'],
    'destroy': ['isAuthorized', 'isAdmin'],
    'populate': ['isAuthorized', 'isAdmin'],
    'getAllOrder': ['isAuthorized', 'isAdmin'],
  },
  BrandController: {
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
    'destroy': ['isAuthorized', 'isAdmin']
  }
};
