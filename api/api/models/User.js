/**
 * User.js
 *
 * @description :: TODO: You might write a short summary of how this model works and what it represents here.
 * @docs        :: http://sailsjs.org/documentation/concepts/models-and-orm/models
 */

let bcrypt = require('bcryptjs');

module.exports = {
  attributes: {
    id: {
      type: 'integer',
      primaryKey: true,
      unique: true,
      autoIncrement: true
    },
    last_ip_address: {
      type: 'text'
    },
    ip_address: {
      type: 'text',
    },
    username: {
      type: 'string',
      required: true,
      unique: true
    },
    password: {
      type: 'string',
      required: true
    },
    email: {
      type: 'string',
    },
    activation_code: {
      type: 'string',
    },
    forgotten_password_code: {
      type: 'string',
    },
    forgotten_password_time: {
      type: 'integer',
    },
    remember_code: {
      type: 'string',
    },
    last_login: {
      type: 'integer',
    },
    active: {
      type: 'integer',
    },
    first_name: {
      type: 'string',
      required: true
    },
    last_name: {
      type: 'string',
      required: false
    },
    father_name: {
      type: 'string',
      required: false
    },
    mother_name: {
      type: 'string',
      required: false
    },
    designation: {
      type: 'string',
    },
    national_id: {
      type: 'string',
    },
    phone: {
      type: 'string',
      required: true
    },
    gender: {
      type: 'string',
      required: false
    },
    dob: {
      type: 'string'
    },
    avatar: {
      type: 'string',
    },
    group_id: {
      model: 'group',
      required: true
    },
    warehouse_id: {
      model: 'warehouse',
    },
    address: {
      type: 'string',
    },
    upazila_id: {
      model: 'area',
    },
    zila_id: {
      model: 'area',
    },
    division_id: {
      model: 'area',
    },
    permanent_address: {
      type: 'string',
      required: false
    },
    permanent_upazila_id: {
      model: 'area',
    },
    permanent_zila_id: {
      model: 'area',
    },
    permanent_division_id: {
      model: 'area',
    },
    award_points: {
      type: 'integer',
      defaultsTo: 0
    },

    createdAt: {
      type: 'datetime',
      columnName: 'created_at',
      defaultsTo: function () {
        return new Date();
      }
    },
    updatedAt: {
      type: 'datetime',
      columnName: 'updated_at',
      defaultsTo: function () {
        return new Date();
      }
    },
    deletedAt: {
      type: 'datetime',
      columnName: 'deleted_at',
      defaultsTo: null
    },
    toJSON: function () {
      var obj = this.toObject();
      delete obj['password'];
      delete obj['forgotten_password_code'];
      delete obj['forgotten_password_time'];
      return obj;
    }
  },
  tableName: "users",
  autoCreatedAt: true,
  autoUpdatedAt: true,
  autoDeletedAt: true,

  // Encrypt password before creating a User
  beforeCreate: function (values, next) {
    bcrypt.genSalt(10, function (err, salt) {
      if (err) return next(err);
      bcrypt.hash(values.password, 10, function (err, hash) {
        if (err) return next(err);
        values.password = hash;
        next();
      })
    })
  },

  // Comparing passwords
  comparePassword: function (password, userPassword, cb) {
    bcrypt.compare(password, userPassword, function (err, match) {
      if (err) cb(err);
      if (match) {
        cb(null, true);
      } else {
        cb(err);
      }
    })
  }
};
