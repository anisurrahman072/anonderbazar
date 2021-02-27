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
    'destroy': ['isAuthorized', 'isAdmin']
  },
  WarehouseVariantController: {
    '*': false,
    'find': ['isAuthorized', 'isOwnerOrAdmin'],
    'findOne': ['isAuthorized', 'isOwnerOrAdmin'],
    'create': ['isAuthorized', 'isOwnerOrAdmin'],
    'update': ['isAuthorized', 'isOwnerOrAdmin'],
    'destroy': ['isAuthorized', 'isOwnerOrAdmin'],
  },
  WarehouseController: {
    '*': false,
    'find': ['isAuthorized', 'isOwnerOrAdmin'],
    'findOne': ['isAuthorized', 'isOwnerOrAdmin'],
    'create': ['isAuthorized', 'isOwnerOrAdmin'],
    'update': ['isAuthorized', 'isResourceOwner'],
    'destroy': ['isAuthorized', 'isResourceOwner'],
  },
  VariantController: {
    '*': false,
    'find': ['isAuthorized', 'isOwnerOrAdmin'],
    'findOne': ['isAuthorized', 'isOwnerOrAdmin'],
    'create': ['isAuthorized', 'isResourceOwner'],
    'update': ['isAuthorized', 'isResourceOwner'],
    'destroy': ['isAuthorized', 'isResourceOwner'],
  },
  VariantsController: {
    '*': false,
    'find': ['isAuthorized', 'isOwnerOrAdmin'],
    'findOne': ['isAuthorized', 'isOwnerOrAdmin'],
    'create': ['isAuthorized', 'isResourceOwner'],
    'update': ['isAuthorized', 'isResourceOwner'],
    'destroy': ['isAuthorized', 'isResourceOwner'],
  },
  UserController: {

  }
};
