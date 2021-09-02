/**
 * AdminUsersController
 *
 * @description :: Server-side actions for handling incoming requests.
 * @help        :: See https://sailsjs.com/docs/concepts/actions
 */

const {getAllUsers} = require('../../libs/users');
const {uploadImages} = require('../../libs/helper');
let bcrypt = require('bcryptjs');
const {performance} = require('perf_hooks');

module.exports = {
  /** Method called for getting all admin users data */
  /** Model models/User.js, Group.js */
  getAllAdminUsers: async (req, res) => {
    try {
      const time1 = performance.now();

      const {
        allCustomer,
        totalCustomers,
        _pagination
      } = await getAllUsers(req, 'adminUser');

      const time2 = performance.now();
      sails.log.debug(`Request Uri: ${req.path}  ##########  Time Elapsed: ${(time2 - time1) / 1000} seconds`);

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
      sails.log.error(`Request Uri: ${req.path} ########## ${error}`);
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
      const time1 = performance.now();

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

      const time2 = performance.now();
      sails.log.debug(`Request Uri: ${req.path}  ##########  Time Elapsed: ${(time2 - time1) / 1000} seconds`);

      return res.status(200).json({
        user: user,
        token: jwToken.issue({id: user.id})
      });

    } catch (error) {
      console.log('admin user creation error: ', error);
      sails.log.error(`Request Uri: ${req.path} ########## ${error}`);

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
      const time1 = performance.now();

      let group = await Group.find({deletedAt: null});

      const time2 = performance.now();
      sails.log.debug(`Request Uri: ${req.path}  ##########  Time Elapsed: ${(time2 - time1) / 1000} seconds`);

      return res.status(200).json({
        success: true,
        message: 'Successfully fetched all groups',
        data: group
      });

    } catch (error) {
      console.log(error);
      sails.log.error(`Request Uri: ${req.path} ########## ${error}`);

      return res.status(400).json({
        success: false,
        message: 'Error in getting all Groups',
        error
      });
    }
  },

  /** Method called for updating an admin user data */
  /** Model models/User.js */
  updateAdminUser: async (req, res) => {
    try {
      const time1 = performance.now();

      let user = await User.findOne({
        id: req.param('id')
      }).populate('group_id');

      if (!user) {
        return res.badRequest('User not found');
      }

      const authUser = req.token.userInfo;
      // eslint-disable-next-line eqeqeq
      if (user.group_id.name === 'owner') {
        if (['admin', 'owner'].indexOf(authUser.group_id.name) === -1) {
          return res.status(401).json({
            success: false,
            message: 'You are not allowed to access this resource'
          });
        }
        if (['owner'].indexOf(authUser.group_id.name) !== -1) {
          // eslint-disable-next-line eqeqeq
          if (user.warehouse_id != authUser.warehouse_id.id) {
            return res.status(401).json({
              success: false,
              message: 'You are not allowed to access this resource'
            });
          }
        }
      } else {
        if (authUser.group_id.name === 'customer') {
          // eslint-disable-next-line eqeqeq
          if (!(user && user.id && user.id == authUser.id)) {
            return res.status(401).json({
              success: false,
              message: 'You are not allowed to access this resource'
            });
          }
        }
      }

      if (req.body.hasImage === 'true') {
        const uploaded = await uploadImages(req.file('avatar'));
        if (uploaded.length === 0) {
          return res.badRequest('No file was uploaded');
        }
        const newPath = uploaded[0].fd.split(/[\\//]+/).reverse()[0];
        req.body.avatar = '/' + newPath;
      }

      let newPassword;
      if (req.body.password && req.body.password !== 'undefined') {
        newPassword = req.body.password;
        bcrypt.genSalt(10, (err, salt) => {
          if (err) {
            return next(err);
          }
          bcrypt.hash(req.body.password, 10, (err, hash) => {
            if (err) {
              return next(err);
            }
            req.body.password = hash;
          });
        });
      }

      user = await User.updateOne({id: user.id}).set(req.body);

      if (req.body.password && req.body.password !== 'undefined') {
        if (user.phone) {
          try {
            let smsText = 'In anonderbazar.com your username: ' + user.username + ', password: ' + newPassword;
            SmsService.sendingOneSmsToOne([user.phone], smsText);
          } catch (err) {
            console.log(err);
          }
        }

        if (user.email) {
          try {
            EmailService.sendPasswordResetMailUpdated(user, newPassword);
          } catch (err) {
            console.log(err);
          }
        }
      }

      const time2 = performance.now();
      sails.log.debug(`Request Uri: ${req.path}  ##########  Time Elapsed: ${(time2 - time1) / 1000} seconds`);

      return res.status(200).json({
        success: true,
        message: 'Admin user updated successfully',
        user: user,
        token: jwToken.issue({id: user.id})
      });

    } catch (error) {
      console.log(error);
      sails.log.error(`Request Uri: ${req.path} ########## ${error}`);

      res.status(400).json({
        success: false,
        message: 'Failed to update user',
        error
      });
    }
  },

  /** Method called to find an admin user data */
  /** Model models/User.js */
  getById: async (req, res) => {
    console.log('call here');
    try {
      const time1 = performance.now();

      const user = await User.findOne({
        id: req.query.id
      })
        .populate('group_id')
        .populate('warehouse_id')
        .populate('upazila_id')
        .populate('zila_id')
        .populate('division_id');

      /*console.log('user result: ', user);*/

      const time2 = performance.now();
      sails.log.debug(`Request Uri: ${req.path}  ##########  Time Elapsed: ${(time2 - time1) / 1000} seconds`);

      return res.status(200).json({
        success: true,
        message: 'Successfully fetched data for this admin user',
        data: user
      });

    } catch (error) {
      console.log('getById error: ', error);
      sails.log.error(`Request Uri: ${req.path} ########## ${error}`);

      return res.status(400).json({
        success: false,
        message: 'Failed to get admin user data',
        error
      });
    }
  },

};

