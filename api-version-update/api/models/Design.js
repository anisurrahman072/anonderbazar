/**
 * Design.js
 *
 * @description :: TODO: You might write a short summary of how this model works and what it represents here.
 * @docs        :: http://sailsjs.org/documentation/concepts/models-and-orm/models
 */


module.exports = {
  attributes: {
    code: {
      type: 'string',
      columnType: 'varchar',
      required: false,
      allowNull: true
    },
    name: {
      type: 'string',
      columnType: 'char',
      required: true,
    },
    warehouse_id: {
      model: 'warehouse',
      required: true
    },
    image: {
      type: 'string',
      columnType: 'text',
      required: false,
      allowNull: true
    },
    rating: {
      type: 'number',
      columnType: 'double',
      required: false,
      allowNull: true
    },
    design_category_id: {
      type: 'json',
      columnType: 'text'
    },
    design_subcategory_id: {
      type: 'json',
      columnType: 'text',
      required: false
    },
    genre_id: {
      type: 'json',
      columnType: 'text',
      required: true,
    },
    details: {
      type: 'string',
      columnType: 'text',
      required: false,
      allowNull: true
    },
  },
  tableName: 'designs',
  /*  autoCreatedAt: true,
  autoUpdatedAt: true,
  autoDeletedAt: true,*/

};
