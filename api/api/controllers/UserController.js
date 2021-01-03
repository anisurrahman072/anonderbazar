/**
 * UserController
 *
 * @description :: Server-side logic for managing users
 * @help        :: See http://sailsjs.org/#!/documentation/concepts/Controllers
 */
import { initLogPlaceholder, pagination } from "../../libs";
import bcrypt from "bcryptjs";


module.exports = {
  //Method called for deleting a user data
  //Model models/User.js
  destroy: function(req, res) {
    User.update({ id: req.param("id") }, { deletedAt: new Date() }).exec(
      function(err, user) {
        if (err) return res.json(err, 400);
        return res.json(user[0]);
      }
    );
  },
  //Method called for creating a user data
  //Model models/User.js
  create: function(req, res) {


    if (req.body.hasImage === "true") {

      req.file("avatar").upload(
        {
          dirname: "../../.tmp/public/images/"
        },
        function(err, uploaded) {
          if (err) {
            return res.json(err.status, { err: err });
          }
          var newPath = uploaded[0].fd.split(/[\\//]+/).reverse()[0];
          if (err) return res.serverError(err);
          req.body.avatar = "/images/" + newPath;


          User.create(req.body).exec(function(err, user) {
            if (err) {
              return res.json(err.status, { err: err });
            }
            if (user) {
              res.json(200, {
                user: user,
                token: jwToken.issue({ id: user.id })
              });
            }
          });
        }
      );
    } else {
      User.create(req.body).exec(function(err, user) {
        if (err) {
          return res.json(err.status, { err: err });
        }
        if (user) {
          res.json(200, { user: user, token: jwToken.issue({ id: user.id }) });
        }
      });
    }
  },
  //Method called for updating a user password data
  //Model models/User.js
  updatepassword: function(req, res) {
    bcrypt.hash(req.body.password, 10, function(err, hash) {
      User.update({ id: req.param("id") }, { password : hash }).exec(function(err, user) {
        if (err) {
          return res.json(err.status, { err: err });
        }
        if (user) {
          EmailService.sendPasswordResetMail(user, req.body.password);
          res.json(200, { user: user, token: jwToken.issue({ id: user.id }) });
        }
      });
    });


  },
  //Method called for updating a user data
  //Model models/User.js
  update: function(req, res) {
    if (req.body.hasImage === "true") {
      req.file("avatar").upload(
        {
          dirname: "../../.tmp/public/images/"
        },
        function(err, uploaded) {
          if (err) {
            return res.json(err.status, { err: err });
          }
          var newPath = uploaded[0].fd.split(/[\\//]+/).reverse()[0];
          if (err) return res.serverError(err);
          req.body.avatar = "/images/" + newPath;
          User.update({ id: req.param("id") }, req.body).exec(function(
            err,
            user
          ) {
            if (err) {
              return res.json(err.status, { err: err });
            }
            if (user) {
              res.json(200, {
                user: user,
                token: jwToken.issue({ id: user.id })
              });
            }
          });
        }
      );
    } else {
      User.update({ id: req.param("id") }, req.body).exec(function(err, user) {
        if (err) {
          return res.json(err.status, { err: err });
        }
        if (user) {
          res.json(200, { user: user, token: jwToken.issue({ id: user.id }) });
        }
      });
    }
  },
  //Method called for getting all user data
  //Model models/User.js
  find: async (req, res) => {
    try {
      initLogPlaceholder(req, "users");


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


      if (query.searchTermEmail) {
        _where.email = { like: `%${query.searchTermEmail}%` };
      }
      if (query.searchTermName) {
        _where.or = [
          { first_name: { like: `%${query.searchTermName}%` } },
          { last_name: { like: `%${query.searchTermName}%` } }
        ];
      }

      if (query.searchTermPhone) {
        _where.phone = { like: `%${query.searchTermPhone}%` };
      }

      if (query.gender) {
        _where.gender = query.gender;
      }

      /* WHERE condition..........END................*/

      /*sort................*/
      let _sort = {};
      if (req.query.sortName) {
        _sort.name = req.query.sortName;
      }

      /*.....SORT END..............................*/

      let totalUser = await User.count().where(_where);
      _pagination.limit = _pagination.limit
        ? _pagination.limit
        : totalCraftsman;
      let Users = await User.find({
        where: _where,
        limit: _pagination.limit,
        skip: _pagination.skip,
        sort: _sort
      }).populateAll();

      res.status(200).json({
        success: true,
        total: totalUser,
        limit: _pagination.limit,
        skip: _pagination.skip,
        page: _pagination.page,
        message: "Get All customer with pagination",
        data: Users
      });
    } catch (error) {
      let message = "Error in Get All customer with pagination";
      res.status(400).json({
        success: false,
        message
      });
    }
  },
  //Method called for getting user dashboard data
  //Model models/User.js, models/Order.js
  getUserWithDashboardData: async(req, res) => {
    try {
      initLogPlaceholder(req, "UserDashboard");
      let _pagination = pagination(req.query);

      /* WHERE condition for .......START.....................*/
      let _where = {};
      let _whereOrder = {};
      let _suborder_where = {};
      _where.deletedAt = null;
      _suborder_where.deletedAt = null;
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
      let totalPendingOrder = 0,
          totalProcessingOrder = 0,
          totalDeliveredOrder = 0,
          totalCancelOrder = 0;


      _pagination.limit = _pagination.limit ? _pagination.limit : totalOrder;
      let aUser = await User.find({
        where: _where
      }).populateAll();
      let orders = await Order.find({
        where:{user_id: req.params.id}
      });

      for (let index = 0; index < orders.length; index++) {
        let pendingOrder = await Order.count().where({
          status:"1",
          id: orders[index].id,
          deletedAt: null
        });

        let processingOrder = await Order.count().where({
          status:"2",
          id: orders[index].id,
          deletedAt: null
        });
        let deliveredOrder = await Order.count().where({
          status:"11",
          id: orders[index].id,
          deletedAt: null
        });
        let canceledOrder = await Order.count().where({
          status:"12",
          id: orders[index].id,
          deletedAt: null
        });
        totalPendingOrder += pendingOrder;
        totalProcessingOrder += processingOrder;
        totalDeliveredOrder += deliveredOrder;
        totalCancelOrder += canceledOrder;
      }
      res.status(200).json({
        success: true,
        totalOrder: totalOrder,
        totalWishlistItem: totalWishlistItem,
        pendingOrder: totalPendingOrder,
        processingOrder: totalProcessingOrder,
        deliveredOrder: totalDeliveredOrder,
        canceledOrder: totalCancelOrder,
        message: "Get All UserDashboard with pagination",
        data:aUser
      });
    } catch (error) {
      let message = "Error in Get All UserDashboard with pagination";

      res.status(400).json({
        success: false,
        message
      });
    }
  }
};
