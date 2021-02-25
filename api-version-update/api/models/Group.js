/**
 * Group.js
 *
 * @description :: TODO: You might write a short summary of how this model works and what it represents here.
 * @docs        :: http://sailsjs.org/documentation/concepts/models-and-orm/models
 */

module.exports = {

  attributes: {
    name: {
      type: 'string',
      columnType: 'varchar',
      required: true,
    },
    description: {
      type: 'number',
      columnType: 'varchar',
      required: true,
    },
    accessList: {
      type: 'json',
      columnType: 'text',
      required: false,
      allowNull: true,
    },
  },
  tableName: 'groups',
  customToJSON: function () {

    return this.toObject();
  }
};


