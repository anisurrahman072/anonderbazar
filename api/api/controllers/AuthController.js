/**
 * AuthController
 *
 * @description :: Server-side logic for managing auths
 * @help        :: See http://links.sailsjs.org/docs/controllers
 */

import bcrypt from "bcryptjs";
import {imageUploadConfig} from "../../libs/helper";

module.exports = {

  // Entry of Auth/0
  index: function (req, res) {
    const username = req.param('username');
    let password = req.param('password');


    bcrypt.genSalt(10, function (err, salt) {
      if (err) return next(err);
      bcrypt.hash(password, 10, function (err, hash) {
        if (err) return next(err);
        password = hash;
      })
    })

  },

  // Entry of Auth/login
  //Method called for customer login for frontend
  //Model models/User.js
  login: async (req, res) => {
    let username = req.param('username');
    let password = req.param('password');

    if (!username || !password) {
      return res.json(401, {model: 'userName', message: 'username and password required'});
    } else {

      User.findOne({username: username}).populate(['group_id', 'warehouse_id']).exec(function (err, user) {
        if (!user) {
          return res.json(401, {model: 'userName', message: 'Phone number is invalid'});
        }
        User.comparePassword(password, user.password, function (err, valid) {
          if (err) {
            return res.json(401, {model: 'userName', message: 'forbidden.'});
          }
          if (!valid) {
            return res.json(401, {model: 'password', message: 'Password is invalid'});
          } else {

            if (!user.active) {
              return res.json(401, {model: 'userName', message: 'Not an active user'});
            }
            res.json({
              user: user.toJSON(),
              token: jwToken.issue({
                id: user.id,
                group_id: user.group_id.name,
                warehouse: user.warehouse_id
              })
            });
          }
        });
      })
    }
  },

  // Entry of Auth/login
  //Method called for vendor/admin login for backend
  //Model models/User.js
  dashboardLogin: async (req, res) => {
    let username = req.param('username');
    let password = req.param('password');
    if (!username || !password) {
      return res.json(401, {model: 'userName', message: 'username and password required'});
    } else {

      let user = await User.findOne({username: username}).populate(['group_id', 'warehouse_id'])
      if (!user) {
        return res.json(401, {model: 'userName', message: 'Phone number or username is invalid'});
      }
      let valid = await bcrypt.compare(password, user.password);

      if (!valid) {
        return res.json(401, {model: 'password', message: 'Password is invalid'});
      } else {
        if (user.group_id.id === 2) {
          return res.json(401, {model: 'userName', message: 'Customer is restricted here.'});
        }
        if (!user.active) {
          return res.json(401, {model: 'userName', message: 'Not an active user'});
        }
        let isWarehouseActivated, accessList, group;
        if (user.group_id.name === 'owner') {
          if (user.warehouse_id != null)
            isWarehouseActivated = (user.warehouse_id.status === 2);
          accessList = {};
          accessList.list = (await Group.findOne({name: 'owner'})).accessList;
        } else if (user.group_id.name === 'admin') {
          accessList = {};
          accessList.list = (await Group.findOne({name: 'admin'})).accessList;
        } else if (user.group_id.name === 'craftsman') {
          accessList = {};
          accessList.list = (await Group.findOne({name: 'craftsman'})).accessList;
        } else {
          accessList = {};
          accessList.list = [];
        }
        res.json({
          user: user.toJSON(),
          token: jwToken.issue({
            id: user.id,
            userInfo: user,
            group_id: user.group_id.name,
            warehouse: user.warehouse_id,
            isWarehouseActivated
          }),
          accessControlList: jwToken.issue(accessList)
        });
      }
    }
  },

  // Entry of Auth/login
  //Method called for customer login for frontend
  //Model models/User.js
  CustomerLogin: async (req, res) => {
    let username = req.param('username');
    let password = req.param('password');

    if (!username || !password) {
      return res.json(401, {err: 'username and password required'});
    } else {

      User.findOne({username: username}).populate(['group_id', 'warehouse_id']).exec(function (err, user) {
        if (!user) {
          return res.json(401, {model: 'userName', message: 'Phone number is invalid'});
        }
        User.comparePassword(password, user.password, function (err, valid) {
          if (err) {
            return res.json(403, {err: 'forbidden'});
          }
          if (!valid) {
            return res.json(401, {model: 'password', message: 'Password is invalid'});
          } else {
            if (user.group_id.id !== 2) {
              return res.json(403, {err: 'forbidden....'});
            }
            if (!user.active) {
              return res.json(401, {err: 'Not an active user'});
            }
            res.json({
              user: user.toJSON(),
              token: jwToken.issue({
                id: user.id,
                group_id: user.group_id.name,
                info: user,
                warehouse: user.warehouse_id
              })
            });
          }
        });
      })
    }
  },

  // Entry of Auth/signup
  //Method called for vendor signup for backend
  //Model models/User.js
  warehouseSignup: function (req, res) {

    if (req.body.hasImage === 'true') {
      req.file('avatar').upload(imageUploadConfig(), function (err, uploaded) {

        if (err) {
          return res.json(err.status, {err: err});
        }

        req.body.avatar =  uploaded[0].fd.split(/[\\//]+/).reverse()[0];

        User.create(req.body).exec(function (err, user) {

          if (err) {
            return res.json(err.status, {err: err});
          }
          if (user) {
            EmailService.sendWelcomeMailVendor(user);

            res.json(200, {user: user, token: jwToken.issue({id: user.id})});
          }
        });
      });
    } else {
      User.create(req.body).exec(function (err, user) {

        if (err) {
          return res.json(err.status, {err: err});
        }

        if (user) {
          res.json(200, {user: user, token: jwToken.issue({id: user.id})});
        }
      });
    }
  },

  // Entry of Auth/signup
  //Method called for customer signup for frontend
  //Model models/User.js
  signup: async (req, res) => {
    try {
      if(req.body && req.body.dob === ''){
        req.body.dob = null;
      }
      let user = await User.create(req.body);
      let cart = await Cart.create({
        user_id: user.id,
        ip_address: '',
        total_quantity: 0,
        total_price: 0,
        status: 1
      });

      EmailService.sendWelcomeMailCustomer(user);

      let data = Object.assign({}, cart);
      data.cart_items = [];
      if (user) {
        return res.json(200, {user: user, cart: data, token: jwToken.issue({id: user.id})});
      }

      return res.badRequest('User was not created successfully');

    } catch (error){
      return res.status(400).json({
        success: false,
        message: 'error in user registration',
        error
      });
    }

  },
  //Method called for user unique check for frontend
  //Model models/User.js
  usernameUnique: async (req, res) => {
    try {
      let user = await User.find({username: req.body.username});
      if (user[0].username === req.body.username) {
        return res.json(200, {isunique: false});
      } else {
        return res.json(200, {isunique: true});
      }
    } catch (error) {
      return res.json(200, {isunique: true});
    }
  },
};
