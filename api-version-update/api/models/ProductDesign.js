/**
 * Product Design.js
 *
 * @description :: TODO: You might write a short summary of how this model works and what it represents here.
 * @docs        :: http://sailsjs.org/documentation/concepts/models-and-orm/models
 */


module.exports = {

  attributes: {
    type_id: {
      model: 'category',
      required: true
    },
    category_id: {
      model: 'category',
      required: true
    },
    subcategory_id: {
      model: 'category'
    },
    product_id: {
      model: 'product',
      required: true
    },
    part_id: {
      model: 'part',
      required: true
    },
    design_category_id: {
      model: 'designCategory',
      required: true
    },
    design_subcategory_id: {
      model: 'designCategory',
    },
    design_id: {
      model: 'design',
      required: true
    },
    genre_id: {
      model: 'genre',
      required: true
    },
    warehouse_id: {
      model: 'warehouse',
      required: true
    },
    price: {
      type: 'number',
      columnType: 'decimal',
      required: true
    },
    comment: {
      type: 'string',
      columnType: 'text',
      required: false,
      allowNull: true
    },
  },
  tableName: 'product_designs',
};
