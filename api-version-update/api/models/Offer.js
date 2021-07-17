/**
 * OfferService.js
 *
 * @description :: A model definition.  Represents a database table/collection/etc.
 * @docs        :: https://sailsjs.com/docs/concepts/models-and-orm/models
 */

module.exports = {
  attributes: {
    title: {
      type: 'string',
      columnType: 'varchar',
      required: true
    },
    frontend_position:  {
      type: 'number',
      columnType: 'integer',
      required: false,
      defaultsTo: 111,
    },
    image: {
      type: 'json',
      columnType: 'text',
      required: false,
    },
    description: {
      type: 'string',
      columnType: 'text',
    },
    selection_type: {
      type: 'string',
      columnType: 'varchar',
      allowNull: true
    },
    product_ids: {
      collection: 'regularOfferProducts',
      via: 'regular_offer_id'
    },
    category_id: {
      model: 'category'
    },
    subCategory_Id: {
      model: 'category'
    },
    subSubCategory_Id: {
      model: 'category'
    },
    brand_id: {
      model: 'brand'
    },
    vendor_id: {
      model: 'warehouse',
    },
    calculation_type: {
      type: 'string',
      columnType: 'varchar',
    },
    discount_amount: {
      type: 'number',
      columnType: 'decimal',
    },
    start_date: {
      type: 'ref',
      columnType: 'datetime',
    },
    end_date: {
      type: 'ref',
      columnType: 'datetime',
    },
    offer_deactivation_time:  {
      type: 'ref',
      columnType: 'datetime',
    },
    show_in_homepage: {
      type: 'boolean',
      columnType: 'integer',
      defaultsTo: false
    },
    showInCarousel: {
      type: 'boolean',
      columnType: 'integer',
      defaultsTo: false
    },
    carousel_position:  {
      type: 'number',
      columnType: 'integer',
      required: false,
      defaultsTo: 111,
    },
  },
  tableName: 'offers',
};
