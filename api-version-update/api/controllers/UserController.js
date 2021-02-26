/**
 * UserController
 *
 * @description :: Server-side logic for managing users
 * @help        :: See http://sailsjs.org/#!/documentation/concepts/Controllers
 */
const {initLogPlaceholder, pagination} = require('../../libs');
const bcrypt = require('bcryptjs');
const {imageUploadConfig} = require('../../libs/helper');
const SmsService = require('../services/SmsService');
const EmailService = require('../services/EmailService');
const {uploadImages} = require('../../libs/helper');
const {ORDER_STATUSES} = require('../../libs/orders');

module.exports = {

  authUser: async (req, res) => {
    if (!req.token) {
      return res.status(401).json({err: 'No Authorization header was found'});
    }
    if (req.token.userInfo.group_id.name !== 'customer') {
      return res.status(401).json({err: 'No Authorization header was found'});
    }

    const authUser = req.token.userInfo;

    User.findOne({
      id: authUser.id
    })
      .populate('group_id')
      .populate('warehouse_id')
      .populate('upazila_id')
      .populate('zila_id')
      .populate('division_id')
      .then(function (user) {
        if (!user) {
          return res.notFound();
        }
        return res.json(user);
      })
      // If there was some kind of usage / validation error
      .catch({name: 'UsageError'}, function (err) {
        return res.badRequest(err);
      })
      // If something completely unexpected happened.
      .catch(function (err) {
        return res.serverError(err);
      });
  },
  findOne: async (req, res) => {
    User.findOne({
      id: req.param('id')
    })
      .populate('group_id')
      .populate('warehouse_id')
      .populate('upazila_id')
      .populate('zila_id')
      .populate('division_id')
      .then(function (user) {
        if (!user) {
          return res.notFound();
        }
        return res.json(user);
      })
      // If there was some kind of usage / validation error
      .catch({name: 'UsageError'}, function (err) {
        return res.badRequest(err);
      })
      // If something completely unexpected happened.
      .catch(function (err) {
        return res.serverError(err);
      });
  },
  //Method called for deleting a user data
  //Model models/User.js
  destroy: function (req, res) {
    User.update({id: req.param('id')}, {deletedAt: new Date()}).exec(
      (err, user) => {
        if (err) {
          return res.json(err, 400);
        }
        return res.json(user[0]);
      }
    );
  },
  //Method called for creating a user data
  //Model models/User.js
  create: function (req, res) {

    if (req.body.hasImage === 'true') {

      req.file('avatar').upload(imageUploadConfig(),
        (err, uploaded) => {
          if (err) {
            return res.json(err.status, {err: err});
          }
          const newPath = uploaded[0].fd.split(/[\\//]+/).reverse()[0];
          if (err) {
            return res.serverError(err);
          }
          req.body.avatar = '/' + newPath;


          User.create(req.body).exec((err, user) => {
            if (err) {
              return res.json(err.status, {err: err});
            }
            if (user) {
              res.json(200, {
                user: user,
                token: jwToken.issue({id: user.id})
              });
            }
          });
        }
      );
    } else {
      User.create(req.body).exec((err, user) => {
        if (err) {
          return res.json(err.status, {err: err});
        }
        if (user) {
          res.json(200, {user: user, token: jwToken.issue({id: user.id})});
        }
      });
    }
  },
  //Method called for updating a user password data
  //Model models/User.js
  updatepassword: async (req, res) => {

    if (!req.param('id')) {
      return res.badRequest('No file was uploaded');
    }
    try {
      let hash = await bcrypt.hash(req.body.password, 10);
      const user = await User.findOne({
        id: req.param('id')
      });

      console.log('hash-req.body.password', req.body.password, hash);
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
      return res.badRequest('There was a problem in processing the request.');
    }
  },
  //Method called for updating a user data
  //Model models/User.js
  update: async (req, res) => {
    try {
      const user = User.findOne({
        id: req.param('id')
      });
      if (!user) {
        return res.badRequest('User not found');
      }
      if (req.body.hasImage === 'true') {
        const uploaded = await uploadImages(req.file('avatar'));
        if (uploaded.length === 0) {
          return res.badRequest('No file was uploaded');
        }
        const newPath = uploaded[0].fd.split(/[\\//]+/).reverse()[0];
        req.body.avatar = '/' + newPath;
      }

      await User.update({id: user.id}).set(req.body);

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
  //Method called for getting all user data
  //Model models/User.js
  find: async (req, res) => {
    try {

      console.log('user-find', req.query);

      initLogPlaceholder(req, 'users');

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
      let _sort = {};
      if (req.query.sortName) {
        _sort.name = req.query.sortName;
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
        message: 'Get All customer with pagination',
        data: Users
      });
    } catch (error) {
      let message = 'Error in Get All customer with pagination';
      res.status(400).json({
        success: false,
        message
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
        message
      });
    }
  },
  //Method called for getting user dashboard data
  //Model models/User.js, models/Order.js
  getUserWithDashboardData: async (req, res) => {
    console.log('getUserWithDashboardData', req);

    try {
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
        message: 'Get All UserDashboard with pagination',
        data: aUser
      });
    } catch (error) {
      let message = 'Error in Get All UserDashboard with pagination';

      res.status(400).json({
        success: false,
        message
      });
    }
  }
};
