/**
 * UserController
 *
 * @description :: Server-side logic for managing users
 * @help        :: See http://sailsjs.org/#!/documentation/concepts/Controllers
 */
const bcrypt = require('bcryptjs');
const SmsService = require('../services/SmsService');
const EmailService = require('../services/EmailService');
const jwToken = require('../services/jwToken');
const {pagination} = require('../../libs/pagination');
const {isResourceOwnerWarehouse} = require('../../libs/check-permissions');
const {uploadImages} = require('../../libs/helper');
const {ORDER_STATUSES} = require('../../libs/orders');
const {getAllUsers} = require('../../libs/users');
const {customer_group_id, shop_group_id} = require('../../libs/groups');

module.exports = {

  authUser: async (req, res) => {
    if (!req.token) {
      return res.status(401).json({err: 'No Authorization header was found'});
    }
    if (req.token.userInfo.group_id.name !== 'customer') {
      return res.status(401).json({err: 'No Authorization header was found'});
    }

    const authUser = req.token.userInfo;

    try {
      const user = await User.findOne({
        id: authUser.id
      })
        .populate('group_id')
        .populate('warehouse_id')
        .populate('upazila_id')
        .populate('zila_id')
        .populate('division_id')
        .populate('couponLotteryCashback');

      if (!user) {
        return res.notFound();
      }
      return res.status(200).json(user);

    } catch (error) {
      if (error.name === 'UsageError') {
        return res.badRequest(error);
      }
      return res.serverError(error);
    }

  },
  findOne: async (req, res) => {

    try {
      const user = await User.findOne({
        id: req.param('id')
      })
        .populate('group_id')
        .populate('warehouse_id')
        .populate('upazila_id')
        .populate('zila_id')
        .populate('division_id');

      const authUser = req.token.userInfo;

      if (authUser.group_id.name === 'customer') {
        // eslint-disable-next-line eqeqeq
        if (!(user && user.id && user.id == authUser.id)) {
          return res.status(401).json({
            success: false,
            message: 'You are not allowed to access this resource'
          });
        }
      }

      return res.status(200).json(user);

    } catch (error) {
      if (error && error.naame === 'UsageError') {
        return res.badRequest(err);
      }
      return res.serverError(err);
    }

  },
  //Method called for deleting a user data
  //Model models/User.js
  destroy: async (req, res) => {
    try {
      const user = await User.findOne({
        id: req.param('id')
      }).populate('group_id');

      const authUser = req.token.userInfo;
      if (authUser.group_id.name === 'customer') {
        // eslint-disable-next-line eqeqeq
        if (!(user && user.id && user.id == authUser.id)) {
          return res.status(401).json({
            success: false,
            message: 'You are not allowed to access this resource'
          });
        }
      }
      if (!isResourceOwnerWarehouse(req.token.userInfo, user)) {
        return res.status(401).json({
          success: false,
          message: 'You are not allowed to access this resource'
        });
      }
      await User.updateOne({id: req.param('id')}).set({deletedAt: new Date()});

      return res.status(202).json(user);
    } catch (error) {
      return res.status(401).json({
        success: false,
        message: 'Problem in deleting the user',
        error
      });
    }

  },
  //Method called for creating a user data
  //Model models/User.js
  create: async (req, res) => {

    // eslint-disable-next-line eqeqeq
    if (req.body.group_id == 4) {
      if (['admin', 'owner'].indexOf(req.token.userInfo.group_id.name) === -1) {
        return res.status(401).json({
          success: false,
          message: 'You are not allowed to access this resource'
        });
      }
      if (['owner'].indexOf(req.token.userInfo.group_id.name) !== -1) {
        // eslint-disable-next-line eqeqeq
        if (req.body.warehouse_id != req.token.userInfo.warehouse_id.id) {
          return res.status(401).json({
            success: false,
            message: 'You are not allowed to access this resource'
          });
        }
      }
    }
    {
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
            return res.json(err.status, {err: err});
          }
        }

        const user = await User.create(req.body).fetch();

        return res.json(200, {user: user, token: jwToken.issue({id: user.id})});

      } catch (error) {
        console.log(error);
        return res.status(400).json({
          success: false,
          message: 'Failed to create user',
          error
        });
      }
    }
  },

  //Method called for updating a user password data
  //Model models/User.js
  updatepassword: async (req, res) => {

    if (!req.param('id')) {
      return res.badRequest('Invalid request');
    }

    try {
      let hash = await bcrypt.hash(req.body.password, 10);
      const user = await User.findOne({
        id: req.param('id')
      });

      if (!user) {
        return res.badRequest('User was not found!');
      }

      await User.update({id: user.id}, {password: hash});

      if (user.phone) {
        try {
          let smsText = 'anonderbazar.com এ আপনার নতুন পাসওয়ার্ডটি হল: ' + req.body.password;
          SmsService.sendingOneSmsToOne([user.phone], smsText);
        } catch (err) {
          console.log(err);
        }
      }

      if (user.email) {
        try {
          EmailService.sendPasswordResetMailUpdated(user, req.body.password);
        } catch (err) {
          console.log(err);
        }
      }

      return res.json(200, {user: user, token: jwToken.issue({id: user.id})});

    } catch (ee) {
      console.log(ee);
      return res.status(400).json({
        success: false,
        message: 'Failed to update password',
        error
      });
    }
  },

  //Method called for updating a user data
  //Model models/User.js
  update: async (req, res) => {
    try {
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

      user = await User.updateOne({id: user.id}).set(req.body);

      return res.json(200, {
        user: user,
        token: jwToken.issue({id: user.id})
      });

    } catch (error) {
      console.log(error);
      res.status(400).json({
        success: false,
        message: 'Failed to update user',
        error
      });
    }

  },

  checkUsername: async (req, res) => {

    try {
      if (!req.body.username) {
        return res.status(422).json({
          success: false,
          isunique: false,
        });
      }
      const where = {
        username: req.body.username,
        deletedAt: null
      };

      if (req.body.exclude_id) {
        where.id = {'!=': req.body.exclude_id};
      }

      const user = await User.find(where);

      if (user && user.length > 0) {
        return res.status(422).json({
          success: false,
          isunique: false,
        });
      }
      return res.status(200).json({
        success: true,
        isunique: true,
      });
    } catch (error) {
      console.log(error);
      return res.status(400).json({
        success: false,
        isunique: false,
        error
      });
    }
  },
  checkPhone: async (req, res) => {

    try {
      if (!req.body.phone) {
        return res.status(422).json({
          success: false,
          isunique: false
        });
      }
      const where = {
        phone: req.body.phone,
        deletedAt: null
      };

      if (req.body.exclude_id) {
        where.id = {'!=': req.body.exclude_id};
      }

      const user = await User.find(where);

      if (user && user.length > 0) {
        return res.status(422).json({
          success: false,
          isunique: false
        });
      }
      return res.status(200).json({
        success: true,
        isunique: true
      });
    } catch (error) {
      console.log(error);
      return res.status(400).json({
        success: false,
        isunique: false,
        error
      });
    }
  },
  checkEmail: async (req, res) => {

    try {
      if (!req.body.email) {
        return res.status(422).json({
          success: false,
          isunique: false,
        });
      }
      const where = {
        email: req.body.email,
        deletedAt: null
      };

      if (req.body.exclude_id) {
        where.id = {'!=': req.body.exclude_id};
      }

      const user = await User.find(where);

      if (user && user.length > 0) {
        return res.status(422).json({
          success: false,
          isunique: false,
        });
      }
      return res.status(200).json({
        success: true,
        isunique: true,
      });
    } catch (error) {
      console.log(error);
      return res.status(400).json({
        success: false,
        isunique: false,
        error
      });
    }
  },
  getAllShopUsers: async (req, res) => {
    try {
      const {
        allCustomer,
        totalCustomers,
        _pagination
      } = await getAllUsers(req, shop_group_id);

      return res.status(200).json({
        success: true,
        total: totalCustomers,
        limit: _pagination.limit,
        skip: _pagination.skip,
        page: _pagination.page,
        message: 'Get all customers with pagination',
        data: allCustomer
      });

    } catch (error) {
      console.log(error);
      let message = 'Error in get all users with pagination';
      return res.status(400).json({
        success: false,
        message,
        error
      });
    }
  },
  //Method called for getting all user data
  //Model models/User.js
  getAllCustomers: async (req, res) => {
    try {

      const {
        allCustomer,
        totalCustomers,
        _pagination
      } = await getAllUsers(req, customer_group_id);

      return res.status(200).json({
        success: true,
        total: totalCustomers,
        limit: _pagination.limit,
        skip: _pagination.skip,
        page: _pagination.page,
        message: 'Get all customers with pagination',
        data: allCustomer
      });

    } catch (error) {
      console.log(error);
      let message = 'Error in get all users with pagination';
      return res.status(400).json({
        success: false,
        message,
        error
      });
    }
  },

  //Method called for getting all user data
  //Model models/User.js
  find: async (req, res) => {
    try {
      let _pagination = pagination(req.query);
      let query = req.query;

      /* WHERE condition for .......START.....................*/
      let _where = {};
      _where.deletedAt = null;
      if (query.group_id) {
        _where.group_id = query.group_id;
      }

      if (query.warehouse_id) {
        _where.warehouse_id = query.warehouse_id;
      }
      if (query.warehouse_id) {
        _where.warehouse_id = query.warehouse_id;
      }
      if (query.username) {
        _where.username = query.username;
      }

      if (query.searchTermPhone && query.searchTermEmail) {
        _where.or = [
          {phone: query.searchTermPhone},
          {email: query.searchTermEmail},
        ];
      } else if (query.searchTermEmail) {
        _where.email = query.searchTermEmail;
      } else if (query.searchTermPhone) {
        _where.phone = query.searchTermPhone;
      }

      if (query.searchTermName) {
        _where.or = [
          {first_name: {like: `%${query.searchTermName}%`}},
          {last_name: {like: `%${query.searchTermName}%`}}
        ];
      }

      if (query.gender) {
        _where.gender = query.gender;
      }

      /* WHERE condition..........END................*/

      /* sort................*/
      let _sort = [];
      if (req.query.sortName) {
        _sort.push({name: req.query.sortName});
      }

      console.log('Users-_where', _where);

      /* .....SORT END.............................. */

      let totalUser = await User.count().where(_where);
      _pagination.limit = _pagination.limit
        ? _pagination.limit
        : totalUser;

      let Users = await User.find({
        where: _where,
        limit: _pagination.limit,
        skip: _pagination.skip,
        sort: _sort
      }).populate('group_id')
        .populate('warehouse_id')
        .populate('zila_id')
        .populate('division_id')
        .populate('upazila_id');

      res.status(200).json({
        success: true,
        total: totalUser,
        limit: _pagination.limit,
        skip: _pagination.skip,
        page: _pagination.page,
        message: 'Get all users with pagination',
        data: Users
      });
    } catch (error) {
      let message = 'Error in get all users with pagination';
      res.status(400).json({
        success: false,
        message,
        error
      });
    }
  },
  //Method called for getting user dashboard data
  //Model models/User.js, models/Order.js
  getAuthCustomerData: async (req, res) => {
    if (!req.token) {
      return res.status(401).json({err: 'No Authorization header was found'});
    }
    if (req.token.userInfo.group_id.name !== 'customer') {
      return res.status(401).json({err: 'No Authorization header was found'});
    }

    const authUser = req.token.userInfo;
    try {
      let _pagination = pagination(req.query);

      let _suborder_where = {
        deletedAt: null,
        user_id: authUser.id
      };

      /*.....SORT END..............................*/
      let totalOrder = await Order.count().where(_suborder_where);
      let totalWishlistItem = await FavouriteProduct.count().where(_suborder_where);
      let totalPendingOrder = 0;
      let totalProcessingOrder = 0;
      let totalDeliveredOrder = 0;
      let totalCancelOrder = 0;
      let totalConfirmedOrder = 0;

      _pagination.limit = _pagination.limit ? _pagination.limit : totalOrder;

      let aUser = await User.findOne({
        id: authUser.id
      }).populate('group_id')
        .populate('upazila_id')
        .populate('zila_id')
        .populate('division_id');

      let orders = await Order.find({
        where: {
          user_id: authUser.id,
          deletedAt: null
        }
      });

      const orderLen = orders.length;
      for (let index = 0; index < orderLen; index++) {
        switch (orders[index].status) {
          case ORDER_STATUSES.pending: {
            totalPendingOrder++;
            break;
          }
          case ORDER_STATUSES.confirmed: {
            totalConfirmedOrder++;
            break;
          }
          case ORDER_STATUSES.processing: {
            totalProcessingOrder++;
            break;
          }
          case ORDER_STATUSES.delivered: {
            totalDeliveredOrder++;
            break;
          }
          case ORDER_STATUSES.canceled: {
            totalCancelOrder++;
            break;
          }
          default: {
            break;
          }
        }
      }
      res.status(200).json({
        success: true,
        totalOrder: totalOrder,
        totalWishlistItem: totalWishlistItem,
        pendingOrder: totalPendingOrder,
        processingOrder: totalProcessingOrder,
        deliveredOrder: totalDeliveredOrder,
        canceledOrder: totalCancelOrder,
        confirmedOrder: totalConfirmedOrder,
        message: 'Get All UserDashboard with pagination',
        data: aUser
      });
    } catch (error) {
      let message = 'Error in Get All UserDashboard with pagination';

      res.status(400).json({
        success: false,
        message,
        error
      });
    }
  },
  //Method called for getting user dashboard data
  //Model models/User.js, models/Order.js
  getUserWithDashboardData: async (req, res) => {

    try {
      const user = User.findOne({
        id: req.param('id')
      });

      if (!user) {
        return res.badRequest('User not found');
      }

      const authUser = req.token.userInfo;
      if (authUser.group_id.name === 'customer') {
        // eslint-disable-next-line eqeqeq
        if (user && user.id && user.id != authUser.id) {
          return res.status(401).json({
            success: false,
            message: 'You are not allowed to access this resource'
          });
        }
      }

      let _pagination = pagination(req.query);

      let _where = {};

      let _suborder_where = {};
      _where.deletedAt = null;
      _suborder_where.deletedAt = null;

      if (req.params.id) {
        _where.id = req.params.id;
      }

      if (req.params.id) {
        _where.id = req.params.id;
      }
      if (req.params.id) {
        _suborder_where.user_id = req.params.id;
      }
      /*.....SORT END..............................*/
      let totalOrder = await Order.count().where(_suborder_where);
      let totalWishlistItem = await FavouriteProduct.count().where(_suborder_where);
      let totalPendingOrder = 0;
      let totalProcessingOrder = 0;
      let totalDeliveredOrder = 0;
      let totalCancelOrder = 0;
      let totalConfirmedOrder = 0;

      _pagination.limit = _pagination.limit ? _pagination.limit : totalOrder;
      let aUser = await User.find({
        where: _where
      }).populate('group_id')
        .populate('upazila_id')
        .populate('zila_id')
        .populate('division_id');

      let orders = await Order.find({
        where: {
          user_id: req.params.id,
          deletedAt: null
        }
      });

      const orderLen = orders.length;
      for (let index = 0; index < orderLen; index++) {
        switch (orders[index].status) {
          case ORDER_STATUSES.pending: {
            totalPendingOrder++;
            break;
          }
          case ORDER_STATUSES.confirmed: {
            totalConfirmedOrder++;
            break;
          }
          case ORDER_STATUSES.processing: {
            totalProcessingOrder++;
            break;
          }
          case ORDER_STATUSES.delivered: {
            totalDeliveredOrder++;
            break;
          }
          case ORDER_STATUSES.canceled: {
            totalCancelOrder++;
            break;
          }
          default: {
            break;
          }
        }
      }

      return res.status(200).json({
        success: true,
        totalOrder: totalOrder,
        totalWishlistItem: totalWishlistItem,
        pendingOrder: totalPendingOrder,
        processingOrder: totalProcessingOrder,
        deliveredOrder: totalDeliveredOrder,
        canceledOrder: totalCancelOrder,
        confirmedOrder: totalConfirmedOrder,
        message: 'Get All User Dashboard with pagination',
        data: aUser
      });
    } catch (error) {
      let message = 'Error in Get All User Dashboard with pagination';

      res.status(400).json({
        success: false,
        message,
        error
      });
    }
  }
};
