/**
 * Product.js
 *
 * @description :: TODO: You might write a short summary of how this model works and what it represents here.
 * @docs        :: http://sailsjs.org/documentation/concepts/models-and-orm/models
 */

module.exports = {

  attributes: {
/*    id: {
      type: 'integer',
      primaryKey: true,
      autoIncrement: true
    },*/
    code: {
      type: 'string',
      required: false,
    },
    name: {
      type: 'string',
      required: true,
    },
    cost: {
      type: 'number',
      columnType: 'float',
    },
    price: {
      type: 'number',
      columnType: 'float',
      required: true,
    },
    vendor_price: {
      type: 'number',
      columnType: 'float',
      required: false,
    },
    min_unit: {
      type: 'number',
      required: true
    },
    alert_quantity: {
      type: 'number',
      defaultsTo: 0
    },
    image: {
      type: 'string',
      allowNull: true
    },
    rating: {
      type: 'number',
      columnType: 'float',
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
      type: 'integer',
      required: true,
    },
    is_coupon_product: {
      type: 'integer',
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
      type: 'float',
    },
    ///start promotion
    promotion: {
      type: 'boolean',
    },
    promo_price: {
      type: 'float',
    },
    start_date: {
      type: 'string', columnType: 'datetime',
    },
    end_date: {
      type: 'string', columnType: 'datetime',
    },
    sale_unit: {
      type: 'number',
      allowNull: true
    },
    ///end promotion
    tag: {
      type: 'string',
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
      type: 'float',
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
/*    createdAt: {
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
    },*/
  },
  tableName: "products",
/*  autoCreatedAt: true,
  autoUpdatedAt: true,
  autoDeletedAt: true,*/
};
