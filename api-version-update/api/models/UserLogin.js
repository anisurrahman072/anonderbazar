/**
 * UserLogin.js
 *
 * @description :: TODO: You might write a short summary of how this model works and what it represents here.
 * @docs        :: http://sailsjs.org/documentation/concepts/models-and-orm/models
 */

module.exports = {

  attributes: {
    user_id: {
      model: 'user',
      required: true,
    },
    warehouse_id: {
      model: 'warehouse',
      required: true,
    },
    ip_address: {
      type: 'string',
      allowNull: true
    },
    username: {
      type: 'string',
      columnType: 'varchar',
      required: true,
    },
    time: {
      type: 'string',
      columnType: 'datetime',
      allowNull: true
    },
  },
  tableName: 'user_logins',

};

