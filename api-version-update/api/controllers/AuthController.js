/**
 * AuthController
 *
 * @description :: Server-side logic for managing auths
 * @help        :: See http://links.sailsjs.org/docs/controllers
 */

const bcrypt = require('bcryptjs');
const jwToken = require('../services/jwToken');
const EmailService = require('../services/EmailService');
const {comparePasswords} = require('../../libs/helper');
const {uploadImages} = require('../../libs/helper');

module.exports = {

  // Entry of Auth/login
  //Method called for customer login for frontend
  //Model models/User.js
  login: async (req, res) => {
    let username = req.param('username');
    let password = req.param('password');

    if (!username || !password) {
      return res.json(401, {model: 'userName', message: 'username and password required'});
    }

    try {

      const user = await User.findOne({username: username, deletedAt: null})
        .populate('group_id')
        .populate('warehouse_id');

      if (!user) {
        return res.json(401, {model: 'userName', message: 'Phone number is invalid'});
      }

      const valid = await comparePasswords(password, user.password);

      if (!valid) {
        return res.json(401, {model: 'password', message: 'Password is invalid'});
      }

      if (!user.active) {
        return res.json(401, {model: 'userName', message: 'Not an active user'});
      }

      return res.json({
        user: user,
        token: jwToken.issue({
          id: user.id,
          group_id: user.group_id.name,
          warehouse: user.warehouse_id
        })
      });

    } catch (error) {
      console.log(error);
      return res.json(400, {message: 'Something went wrong!', error});
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
    }

    try {
      let user = await User.findOne({username: username, deletedAt: null})
        .populate('group_id')
        .populate('warehouse_id');

      if (!user) {
        return res.json(401, {model: 'userName', message: 'Phone number or username is invalid'});
      }
      let valid = await bcrypt.compare(password, user.password);

      if (!valid) {
        return res.json(401, {model: 'password', message: 'Password is invalid'});
      }

      if (user.group_id.name === 'customer') {
        return res.json(401, {model: 'userName', message: 'Customer is restricted here.'});
      }

      if (!user.active) {
        return res.json(401, {model: 'userName', message: 'Not an active user'});
      }

      let isWarehouseActivated;
      let accessList;

      if (user.group_id.name === 'owner') {
        if (user.warehouse_id !== null) {
          isWarehouseActivated = (user.warehouse_id.status === 2);
        }
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

      return res.json({
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
    } catch (error) {
      console.log(error);
      return res.json(400, {message: 'Something went wrong!', error});
    }
  },

  // Entry of Auth/login
  //Method called for customer login for frontend
  //Model models/User.js
  customerLogin: async (req, res) => {
    let username = req.param('username');
    let password = req.param('password');

    if (!username || !password) {
      return res.json(401, {err: 'username and password required'});
    }

    try {
      const user = await User.findOne({username: username, deletedAt: null})
        .populate('group_id')
        .populate('warehouse_id');

      if (!user) {
        return res.json(401, {model: 'userName', message: 'Phone number is invalid'});
      }
      const valid = await comparePasswords(password, user.password);
      if (!valid) {
        return res.json(401, {model: 'password', message: 'Password is invalid'});
      }

      if (user.group_id.name !== 'customer') {
        return res.json(403, {err: 'forbidden....'});
      }

      if (!user.active) {
        return res.json(401, {err: 'Not an active user'});
      }

      return res.json({
        user: user.toJSON(),
        token: jwToken.issue({
          id: user.id,
          group_id: user.group_id.name,
          userInfo: user,
          warehouse: user.warehouse_id
        })
      });

    } catch (error) {
      console.log(error);
      return res.json(400, {message: 'Something went wrong!', error});
    }

  },

  // Entry of Auth/signup
  //Method called for vendor signup for backend
  //Model models/User.js
  warehouseSignup: async (req, res) => {

    try {
      if (req.body.hasImage === 'true') {
        const uploaded = await uploadImages(req.file('avatar'));
        if (uploaded.length === 0) {
          return res.badRequest('No file was uploaded');
        }
        const newPath = uploaded[0].fd.split(/[\\//]+/).reverse()[0];
        req.body.avatar = '/' + newPath;
      }

      let user = await User.create(req.body).fetch();
      user = await User.findOne({id: user.id}).populate('group_id').populate('warehouse_id');

      return res.json(200, {user: user, token: jwToken.issue({id: user.id})});

    } catch (error) {
      console.log(error);
      return res.json(400, {message: 'Something went wrong!', error});
    }

  },

  // Entry of Auth/signup
  //Method called for customer signup for frontend
  //Model models/User.js
  signup: async (req, res) => {
    try {
      if (req.body && req.body.dob === '') {
        req.body.dob = null;
      }
      let user = await User.create(req.body).fetch();
      let cart = await Cart.create({
        user_id: user.id,
        ip_address: '',
        total_quantity: 0,
        total_price: 0,
        status: 1
      }).fetch();

      user = await User.findOne({id: user.id}).populate('group_id').populate('warehouse_id');
      try {
        EmailService.sendWelcomeMailCustomer(user);
      } catch (er){
        console.log(er);
      }

      let data = Object.assign({}, cart);
      data.cart_items = [];

      return res.json(200, {user: user, cart: data, token: jwToken.issue({id: user.id})});

    } catch (error) {
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
      console.log(error);
      return res.json(200, {isunique: true});
    }
  },
};
