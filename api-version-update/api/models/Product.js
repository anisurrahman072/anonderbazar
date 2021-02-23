/**
 * Product.js
 *
 * @description :: TODO: You might write a short summary of how this model works and what it represents here.
 * @docs        :: http://sailsjs.org/documentation/concepts/models-and-orm/models
 */
var variant;
var photo;
module.exports = {

  attributes: {
    id: {
      type: 'integer',
      primaryKey: true,
      autoIncrement: true
    },
    code: {
      type: 'string',
      required: false,
    },
    name: {
      type: 'string',
      required: true,
    },
    cost: {
      type: 'float',
    },
    price: {
      type: 'float',
      required: true,
    },
    vendor_price: {
      type: 'float',
      required: false,
    },
    min_unit: {
      type: 'integer',
      required: true,
      defaultsTo: 0
    },
    alert_quantity: {
      type: 'integer',
      defaultsTo: 0
    },
    image: {
      type: 'string',
    },
    rating: {
      type: 'float'
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
      required: true,
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
      type: 'text',
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
      type: 'datetime',
    },
    end_date: {
      type: 'datetime',
    },
    sale_unit: {
      type: 'integer',
    },
    ///end promotion
    tag: {
      type: 'text',
    },
    status: {
      type: 'integer',
    },
    approval_status: {
      type: 'integer',
    },
    approval_status_updated_by: {
      type: 'integer',
    },
    featured: {
      type: 'text',
    },
    weight: {
      type: 'float',
    },
    produce_time: {
      type: 'integer',
      // required: true,
    },
    last_order_completed_date: {
      type: 'datetime',
      columnName: 'last_order_completed_date',
    },
    updated_by: {
      model: 'user'
    },
    created_by: {
      model: 'user'
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
  },
  tableName: "products",
/*  autoCreatedAt: true,
  autoUpdatedAt: true,
  autoDeletedAt: true,*/
};
