/**
 * AuthController
 *
 * @description :: Server-side logic for managing auths
 * @help        :: See http://links.sailsjs.org/docs/controllers
 */

const bcrypt = require('bcryptjs');
const jwToken = require('../services/jwToken');
const EmailService = require('../services/EmailService');
const SmsService = require('../services/SmsService');
const {comparePasswords} = require('../../libs/helper');
const {uploadImages} = require('../../libs/helper');


module.exports = {

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
          userInfo: user,
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
      return res.json(422, {err: 'username and password required'});
    }

    try {
      const user = await User.findOne({username: username, deletedAt: null})
        .populate('group_id')
        .populate('warehouse_id');

      if (!user) {
        return res.json(422, {model: 'userName', message: 'Phone number is invalid'});
      }

      const valid = await comparePasswords(password, user.password);

      if (!valid) {
        return res.json(422, {model: 'password', message: 'Password is invalid'});
      }

      if (user.group_id.name !== 'customer') {
        return res.json(403, {err: 'forbidden....'});
      }

      if (!user.active) {
        return res.json(403, {err: 'Not an active user'});
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
    console.log(req.body);
    try {
      let postBody = {...req.body};
      try {
        postBody.userdata = JSON.parse(postBody.userdata);
      } catch (__) {
        return res.status(422).json({
          success: false,
          message: 'Invalid User data'
        });
      }
      console.log(postBody);
      let userData = postBody.userdata;
      delete postBody.userdata;

      const {
        warehouse,
        user
      } = await sails.getDatastore()
        .transaction(async (db) => {
          if (postBody.hasLogo === 'true') {
            const uploaded = await uploadImages(req.file('logo'));
            if (uploaded.length === 0) {
              return res.badRequest('No logo image was uploaded');
            }
            const newPath = uploaded[0].fd.split(/[\\//]+/).reverse()[0];
            postBody.logo = '/' + newPath;
          }

          postBody.status = 0;
          const warehouse = await Warehouse.create(postBody).fetch().usingConnection(db);

          if (userData.hasImage === 'true') {
            const uploaded = await uploadImages(req.file('user_avatar'));
            if (uploaded.length === 0) {
              return res.badRequest('No user avatar was uploaded');
            }
            const newPath = uploaded[0].fd.split(/[\\//]+/).reverse()[0];
            userData.avatar = '/' + newPath;
          }

          userData.warehouse_id = warehouse.id;
          userData.active = 1;
          userData.group_id = 4; // 4 for owner / warehouse

          let user = await User.create(userData).fetch().usingConnection(db);

          return {
            warehouse,
            user
          };
        });

      return res.status(201).json({
        warehouse,
        user
      });
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
      if (!req.body.username) {
        return res.status(400).json({
          success: false,
          message: 'Invalid Request',
        });
      }

      const username = req.body.username;
      let foundUserCount = await User.count().where({
        username: username
      });

      if (foundUserCount > 0) {
        return res.status(422).json({
          success: false,
          message: 'User already exists',
        });
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
      } catch (er) {
        console.log(er);
      }

      let data = Object.assign({}, cart);
      data.cart_items = [];

      return res.json(200, {
        user: user,
        cart: data,
        token: jwToken.issue({
          id: user.id,
          group_id: user.group_id.name,
          userInfo: user,
          warehouse: user.warehouse_id
        })
      });

    } catch (error) {
      return res.status(400).json({
        success: false,
        message: 'error in user signup',
        error
      });
    }

  },
  //Method called for user unique check for frontend
  //Model models/User.js
  usernameUnique: async (req, res) => {
    try {
      let user = await User.find({username: req.body.username});
      if (user && user.length > 0) {
        return res.json(200, {isunique: false});
      } else {
        return res.json(200, {isunique: true});
      }
    } catch (error) {
      console.log(error);
      return res.json(400, {isunique: true});
    }
  },

  customerForgetPassword: async (req, res) => {
    console.log('req', req.body);
    let _where = {
      deletedAt: null,
      group_id: 2
    };

    try {
      if (req.body.phone && req.body.email) {
        _where.or = [
          {username: req.body.phone},
          {username: req.body.email},
        ];
      } else if (req.body.email) {
        _where.username = req.body.email;
      } else if (req.body.phone) {
        _where.username = req.body.phone;
      }
      let users = await User.find({
        where: _where
      });
      if (users && users.length === 1) {

        let user = await User.findOne({
          id: users[0].id
        })
          .populate('warehouse_id')
          .populate('group_id');

        if (user.group_id.name !== 'customer') {
          return res.json(403, {err: 'forbidden....'});
        }

        if (!user.active) {
          return res.json(401, {err: 'Not an active user'});
        }

        let hash = await bcrypt.hash(req.body.password, 10);
        await User.updateOne({id: user.id}).set({password: hash});

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

        return res.status(201).json({
          'success': true,
          'message': 'Your password has been updated and new password has been sent your mobile/email'
        });

      }
      return res.status(422).json({
        success: false,
        message: 'More than one user found with the provided information'
      });
    } catch (error) {
      console.log(error);
      return res.status(400).json({
        success: false,
        message: 'Failed to update password',
        error
      });
    }
  },
  //Method called for updating a user password
  //Model models/User.js
  userPasswordUpdate: async (req, res) => {

    const authUser = req.token.userInfo;

    let oldPassword = req.body.oldPassword;
    let newPassword = req.body.newPassword;

    if (!oldPassword || !newPassword) {
      return res.json(400, {message: 'old password and new password are required'});
    }
    try {

      let valid = await comparePasswords(oldPassword, authUser.password);
      if (!valid) {
        return res.json(401, {message: 'Wrong Password'});
      }

      const newHashedPassword = await bcrypt.hash(newPassword, 10);

      const validUpdate = await User.updateOne({id: authUser.id}, {password: newHashedPassword});
      if (!validUpdate) {
        return res.json(500, 'There was a problem in processing the request.');
      }

      return res.json(200, {
        user: authUser, token: jwToken.issue({id: authUser.id})
      });

    } catch (error) {
      console.log(error);
      res.status(400).json({
        success: false,
        message: 'Failed to update Password',
        error
      });
    }
  }
};
