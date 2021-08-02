/**
 * AdminUsersController
 *
 * @description :: Server-side actions for handling incoming requests.
 * @help        :: See https://sailsjs.com/docs/concepts/actions
 */

const {getAllUsers} = require('../../libs/users');

module.exports = {
  /** Method called for getting all admin users data */
  /** Model models/User.js, Group.js */
  getAllAdminUsers: async (req, res) => {
    try {
      const {
        allCustomer,
        totalCustomers,
        _pagination
      } = await getAllUsers(req, 'adminUser');

      return res.status(200).json({
        success: true,
        total: totalCustomers,
        limit: _pagination.limit,
        skip: _pagination.skip,
        page: _pagination.page,
        message: 'Get all Admin Users with pagination',
        data: allCustomer
      });

    } catch (error) {
      console.log(error);
      let message = 'Error in getting all admin users with pagination';
      return res.status(400).json({
        success: false,
        message,
        error
      });
    }
  },
};

