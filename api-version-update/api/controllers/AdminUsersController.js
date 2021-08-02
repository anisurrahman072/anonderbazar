/**
 * AdminUsersController
 *
 * @description :: Server-side actions for handling incoming requests.
 * @help        :: See https://sailsjs.com/docs/concepts/actions
 */

const {getAllUsers} = require('../../libs/users');
const {uploadImages} = require('../../libs/helper');

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

  /** Method called for creating an admin user data */
  /** Model models/User.js */
  createAdminUser: async (req, res) => {
    try {
      if (req.body.hasImage === 'true') {
        try {
          const uploaded = await uploadImages(req.file('avatar'));
          if (uploaded.length === 0) {
            return res.badRequest('No image was uploaded');
          }
          const newPath = uploaded[0].fd.split(/[\\//]+/).reverse()[0];

          req.body.avatar = '/' + newPath;

        } catch (err) {
          console.log('err', err);
          return res.status(err.status).json({err: err});
        }
      }

      const user = await User.create(req.body).fetch();

      return res.status(200).json({
        user: user,
        token: jwToken.issue({id: user.id})
      });

    } catch (error) {
      console.log('admin user creation error: ', error);
      return res.status(400).json({
        success: false,
        message: 'Failed to create admin user',
        error
      });
    }
  },

  /** Method called to get all user groups */
  /** Model: Group.js */
  getAllGroups: async (req, res) => {
    try {
      let group = await Group.find({deletedAt: null});

      return res.status(200).json({
        success: true,
        message: 'Successfully fetched all groups',
        data: group
      });

    } catch (error) {
      console.log(error);
      return res.status(400).json({
        success: false,
        message: 'Error in getting all Groups',
        error
      });
    }
  },

};

