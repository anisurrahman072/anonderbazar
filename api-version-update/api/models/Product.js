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
      columnType: 'float',
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
      required: false,
      defaultsTo: 1
    },
    alert_quantity: {
      type: 'number',
      columnType: 'integer',
      required: false,
      defaultsTo: 1
    },
    image: {
      type: 'string',
      columnType: 'text',
      allowNull: true
    },
    rating: {
      type: 'number',
      columnType: 'float',
      allowNull: true
    },
    brand_id: {
      model: 'brand',
      required: false,
    },
    type_id: {
      model: 'category',
      required: true,
    },
    category_id: {
      model: 'category',
      required: true,
    },
    subcategory_id: {
      model: 'category',
    },
    quantity: {
      type: 'number',
      columnType: 'float',
      required: true,
    },
    is_coupon_product: {
      type: 'number',
      columnType: 'integer',
      required: false,
      defaultsTo: 0
    },
    warehouse_id: {
      model: 'warehouse',
      required: true
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
      required: true,
    },
    craftsman_id: {
      model: 'user',
    },
    craftsman_price: {
      type: 'number',
      columnType: 'decimal'
    },
    promotion: {
      type: 'boolean',
      columnType: 'integer'
    },
    promo_price: {
      type: 'number',
      columnType: 'decimal'
    },
    start_date: {
      type: 'ref',
      columnType: 'datetime',
    },
    end_date: {
      type: 'ref',
      columnType: 'datetime',
    },
    sale_unit: {
      type: 'number',
      columnType: 'integer',
      allowNull: true
    },
    ///end promotion
    tag: {
      type: 'string',
      columnType: 'text'
    },
    status: {
      type: 'number',
      columnType: 'integer',
    },
    approval_status: {
      type: 'number',
      columnType: 'integer',
    },
    approval_status_updated_by: {
      type: 'number',
      columnType: 'integer',
      allowNull: true
    },
    featured: {
      type: 'number',
      columnType: 'integer',
    },
    weight: {
      type: 'number',
      columnType: 'decimal',
    },
    produce_time: {
      type: 'number',
      columnType: 'integer',
      allowNull: true
    },
    last_order_completed_date: {
      type: 'ref',
      columnType: 'datetime',
      columnName: 'last_order_completed_date',
    },
    updated_by: {
      model: 'user'
    },
    created_by: {
      model: 'user'
    },
  },
  tableName: 'products',
};
