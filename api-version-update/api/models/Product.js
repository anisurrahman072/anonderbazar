/**
 * Product.js
 *
 * @description :: TODO: You might write a short summary of how this model works and what it represents here.
 * @docs        :: http://sailsjs.org/documentation/concepts/models-and-orm/models
 */

module.exports = {

  attributes: {
    code: {
      type: 'string',
      columnType: 'varchar',
      required: true,
    },
    name: {
      type: 'string',
      columnType: 'varchar',
      required: true,
    },
    cost: {
      type: 'number',
      columnType: 'decimal',
      required: false,
      allowNull: true
    },
    price: {
      type: 'number',
      columnType: 'decimal',
      required: true,
    },
    vendor_price: {
      type: 'number',
      columnType: 'decimal',
      required: false,
      defaultsTo: 0
    },
    min_unit: {
      type: 'number',
      columnType: 'integer',
      defaultsTo: 1
    },
    alert_quantity: {
      type: 'number',
      columnType: 'integer',
      defaultsTo: 1
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
    brand_id: {
      model: 'brand'
    },
    type_id: {
      model: 'category',
    },
    category_id: {
      model: 'category',
    },
    subcategory_id: {
      model: 'category',
    },
    quantity: {
      type: 'number',
      columnType: 'decimal',
      required: false,
      defaultsTo: 0
    },
    is_coupon_product: {
      type: 'number',
      columnType: 'integer',
      defaultsTo: 0
    },
    warehouse_id: {
      model: 'warehouse'
    },
    product_variants: {
      collection: 'productVariant',
      via: 'product_id'
    },
    product_images: {
      collection: 'productImage',
      via: 'product_id'
    },
    coupon_banner_images: {
      collection: 'ProductCouponBannerImage',
      via: 'product_id'
    },
    product_details: {
      type: 'string',
      columnType: 'text',
      required: false,
      allowNull: true
    },
    craftsman_id: {
      model: 'user',
    },
    craftsman_price: {
      type: 'number',
      columnType: 'decimal',
      required: false,
      allowNull: true
    },
    promotion: {
      type: 'boolean',
      columnType: 'integer',
      defaultsTo: false
    },
    promo_price: {
      type: 'number',
      columnType: 'decimal',
      required: false,
      allowNull: true
    },
    start_date: {
      type: 'ref',
      columnType: 'datetime',
      required: false,
    },
    end_date: {
      type: 'ref',
      columnType: 'datetime',
      required: false,
    },
    sale_unit: {
      type: 'number',
      columnType: 'integer',
      required: false,
      allowNull: true
    },
    ///end promotion
    tag: {
      type: 'string',
      columnType: 'text',
      required: false,
      allowNull: true
    },
    status: {
      type: 'number',
      columnType: 'integer',
      required: true
    },
    approval_status: {
      type: 'number',
      columnType: 'integer',
      defaultsTo: 1
    },
    approval_status_updated_by: {
      type: 'number',
      columnType: 'integer',
      required: false,
      allowNull: true
    },
    featured: {
      type: 'number',
      columnType: 'integer',
      required: false,
      allowNull: true
    },
    weight: {
      type: 'number',
      columnType: 'decimal',
      required: false,
      allowNull: true
    },
    frontend_position: {
      type: 'number',
      columnType: 'integer',
      required: false,
      defaultsTo: 111,
    },
    produce_time: {
      type: 'number',
      columnType: 'integer',
      required: false,
      allowNull: true
    },
    last_order_completed_date: {
      type: 'ref',
      columnType: 'datetime',
      columnName: 'last_order_completed_date',
      required: false,
    },
    pay_online: {
      type: 'number',
      columnType: 'integer',
      defaultsTo: 0,
      required: false
    },
    free_shipping: {
      type: 'number',
      columnType: 'integer',
      defaultsTo: 0,
      required: false
    },
    dhaka_charge: {
      type: 'number',
      columnType: 'decimal',
      allowNull: true,
      required: false
    },
    outside_dhaka_charge: {
      type: 'number',
      columnType: 'decimal',
      allowNull: true,
      required: false
    },
    updated_by: {
      model: 'user',
      required: false
    },
    created_by: {
      model: 'user',
      required: false
    },
  },
  tableName: 'products',
  customToJSON: function () {
    return this;
  }
};
