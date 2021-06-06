/**
 * User.js
 *
 * @description :: TODO: You might write a short summary of how this model works and what it represents here.
 * @docs        :: http://sailsjs.org/documentation/concepts/models-and-orm/models
 */

let bcrypt = require('bcryptjs');

module.exports = {
  attributes: {
    last_ip_address: {
      type: 'string',
      columnType: 'varchar',
      required: false,
      allowNull: true
    },
    ip_address: {
      type: 'string',
      columnType: 'varchar',
      defaultsTo: '::1'
    },
    username: {
      type: 'string',
      columnType: 'varchar',
      required: true,
      unique: true
    },
    password: {
      type: 'string',
      columnType: 'varchar',
      required: true
    },
    email: {
      type: 'string',
      columnType: 'varchar',
      required: false,
      allowNull: true
    },
    activation_code: {
      type: 'string',
      columnType: 'varchar',
      required: false,
      allowNull: true
    },
    verification_code: {
      type: 'string',
      columnType: 'varchar',
      required: false,
      allowNull: true
    },
    is_verified: {
      type: 'boolean',
      defaultsTo: false,
      allowNull: true
    },
    verification_code_expire_time: {
      type: 'string',
      allowNull: true
    },
    forgotten_password_code: {
      type: 'string',
      columnType: 'varchar',
      required: false,
      allowNull: true
    },
    forgotten_password_time: {
      type: 'number',
      columnType: 'integer',
      required: false,
      allowNull: true
    },
    remember_code: {
      type: 'string',
      columnType: 'varchar',
      required: false,
      allowNull: true
    },
    last_login: {
      type: 'number',
      columnType: 'integer',
      required: false,
      allowNull: true
    },
    active: {
      type: 'number',
      columnType: 'integer',
      required: false,
      allowNull: true
    },
    first_name: {
      type: 'string',
      columnType: 'varchar',
      required: false,
      allowNull: true
    },
    last_name: {
      type: 'string',
      columnType: 'varchar',
      required: false,
      allowNull: true
    },
    father_name: {
      type: 'string',
      columnType: 'text',
      required: false,
      allowNull: true
    },
    mother_name: {
      type: 'string',
      columnType: 'text',
      required: false,
      allowNull: true
    },
    designation: {
      type: 'string',
      columnType: 'text',
      required: false,
      allowNull: true
    },
    national_id: {
      type: 'string',
      columnType: 'text',
      required: false,
      allowNull: true
    },
    phone: {
      type: 'string',
      columnType: 'varchar',
      required: true
    },
    gender: {
      type: 'string',
      columnType: 'varchar',
      required: false,
      allowNull: true
    },
    dob: {
      type: 'ref',
      columnType: 'date',
      required: false,
    },
    avatar: {
      type: 'string',
      columnType: 'varchar',
      required: false,
      allowNull: true
    },
    group_id: {
      model: 'group',
      required: true
    },
    warehouse_id: {
      model: 'warehouse'
    },
    address: {
      type: 'string',
      columnType: 'text',
      required: false,
      allowNull: true
    },
    upazila_id: {
      model: 'area'
    },
    zila_id: {
      model: 'area'
    },
    division_id: {
      model: 'area'
    },
    permanent_address: {
      type: 'string',
      columnType: 'text',
      required: false,
      allowNull: true
    },
    permanent_upazila_id: {
      model: 'area'
    },
    permanent_zila_id: {
      model: 'area'
    },
    permanent_division_id: {
      model: 'area'
    },
    award_points: {
      type: 'number',
      columnType: 'integer',
      required: false,
      defaultsTo: 0
    },
    couponLotteryCashback: {
      collection: 'couponLotteryCashback',
      via: 'user_id'
    }
  },
  tableName: 'users',
  customToJSON: function () {
    var obj = {...this};
    delete obj['password'];
    delete obj['forgotten_password_code'];
    delete obj['forgotten_password_time'];
    return obj;
  },
  // Encrypt password before creating a User
  beforeCreate: function (values, next) {
    bcrypt.genSalt(10, (err, salt) => {
      if (err) {
        return next(err);
      }
      bcrypt.hash(values.password, 10, (err, hash) => {
        if (err) {
          return next(err);
        }
        values.password = hash;
        next();
      });
    });
  },

  // Comparing passwords
  comparePassword: function (password, userPassword, cb) {
    bcrypt.compare(password, userPassword, (err, match) => {
      // eslint-disable-next-line callback-return
      if (err) {
        cb(err);
      }
      if (match) {
        // eslint-disable-next-line callback-return
        cb(null, true);
      } else {
        // eslint-disable-next-line callback-return
        cb(err);
      }
    });
  }
};
