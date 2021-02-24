/**
 * SuborderController
 *
 * @description :: Server-side logic for managing suborders
 * @help        :: See http://sailsjs.org/#!/documentation/concepts/Controllers
 */
const {
  Helper,
  asyncForEach,
  initLogPlaceholder,
  pagination
} = require('../../libs');
const {ifError} = require('assert');
const moment = require('moment');

module.exports = {
  // destroy a row
  destroy: function (req, res) {
    Suborder.update({id: req.param('id')}, {deletedAt: new Date()}).exec(
      (err, suborder) => {
        if (err) {
          return res.json(err, 400);
        }
        return res.json(suborder[0]);
      }
    );
  },
  //Method called for updaing product suborder by order id
  //Model models/Order.js, models/Suborder.js, models/SuborderItem.js
  updatebyorderid: async function (req, res) {

    var suborder = await Suborder.update({product_order_id: req.param('id')}, req.body);
    if (req.body.status == '2' || req.body.status == '11' || req.body.status == '12') {
      if (req.body.status == '2') {
        var list = await CourierListOrder.update({order_id: req.param('id')}, {status: 3});
        await asyncForEach(suborder, async element => {
          let list = await CourierList.update({suborder_id: element.id}, {status: 3});
        });
      } else {
        var list = await CourierListOrder.update({order_id: req.param('id')}, req.body);
        await asyncForEach(suborder, async element => {
          let list = await CourierList.update({suborder_id: element.id}, req.body);
        });
      }
    }
    if (suborder) {
      return res.json(200, suborder);
    } else {
      return res.status(400).json({success: false});
    }

  },
  //Method called for getting all product suborder
  //Model models/Order.js, models/Suborder.js, models/SuborderItem.js
  getSuborder: async (req, res) => {
    try {
      initLogPlaceholder(req, 'SubOrderList');

      let _pagination = pagination(req.query);

      /* WHERE condition for .......START.....................*/
      let _where = {};
      let _suborder_where = {};
      _where.deletedAt = null;
      _suborder_where.deletedAt = null;

      if (req.query.product_suborder_id) {
        _where.product_suborder_id = req.query.product_suborder_id;
      }
      if (req.query.warehouse_id) {
        _where.warehouse_id = req.query.warehouse_id;
      }

      if (req.query.product_id) {
        _where.product_id = req.query.product_id;
      }
      if (req.query.product_quantity) {
        _where.product_quantity = req.query.product_quantity;
      }
      if (req.query.status) {
        _where.status = req.query.status;
      }
      /*sort................*/
      let _sort = {};
      if (req.query.product_total_price) {
        _sort.product_total_price = req.query.product_total_price;
      } else {
        _sort.createdAt = 'DESC';
      }
      /*.....SORT END..............................*/
      let totalSubOrder = await Suborder.count().where(_where);

      let totalPendingOrder = 0;
      let totalProcessingOrder = 0;
      let totalDeliveredOrder = 0;
      let totalCancelOrder = 0;

      if (req.query.warehouse_id) {
        totalPendingOrder = await Suborder.count().where({
          status: '1',
          warehouse_id: _where.warehouse_id
        });
        totalProcessingOrder = await Suborder.count().where({
          status: '2',
          warehouse_id: _where.warehouse_id
        });
        totalDeliveredOrder = await Suborder.count().where({
          status: '3',
          warehouse_id: _where.warehouse_id
        });
        totalCancelOrder = await Suborder.count().where({
          status: '4',
          warehouse_id: _where.warehouse_id
        });
      } else {
        totalPendingOrder = await Suborder.count().where({
          status: '1'
        });
        totalProcessingOrder = await Suborder.count().where({
          status: '2'
        });
        totalDeliveredOrder = await Suborder.count().where({
          status: '3'
        });
        totalCancelOrder = await Suborder.count().where({
          status: '4'
        });
      }
      _pagination.limit = _pagination.limit ? _pagination.limit : totalSubOrder;
      let SubOrders = await Suborder.find({
        where: _where,
        sort: _sort
      }).populate('product_order_id', _suborder_where);

      let allSubOrders = await Promise.all(
        SubOrders.map(async item => {
          item.product_order_id = await Order.find({
            deletedAt: null,
            id: item.product_order_id.id
          }).populate('user_id', {deletedAt: null});
          return item;
        })
      );

      res.status(200).json({
        success: true,
        total: totalSubOrder,
        pendingOrder: totalPendingOrder,
        processingOrder: totalProcessingOrder,
        deliveredOrder: totalDeliveredOrder,
        canceledOrder: totalCancelOrder,
        message: 'Get All SubOrderList with pagination',
        data: allSubOrders
      });
    } catch (error) {
      let message = 'Error in Get All SubOrderList with pagination';
      res.status(400).json({
        success: false,
        message
      });
    }
  },
  //Method called for getting all product suborder with dates
  //Model models/Order.js, models/Suborder.js, models/SuborderItem.js
  getSuborderWithDate: async (req, res) => {
    try {
      initLogPlaceholder(req, 'SubOrderListWithDate');

      let _pagination = pagination(req.query);

      /* WHERE condition for .......START.....................*/
      let _where = {};
      let _suborder_where = {};
      _where.deletedAt = null;
      _suborder_where.deletedAt = null;

      if (req.query.product_suborder_id) {
        _where.product_suborder_id = req.query.product_suborder_id;
      }
      if (req.query.warehouse_id) {
        _where.warehouse_id = req.query.warehouse_id;
      }

      if (req.query.product_id) {
        _where.product_id = req.query.product_id;
      }
      if (req.query.product_quantity) {
        _where.product_quantity = req.query.product_quantity;
      }
      if (req.query.status) {
        _where.status = req.query.status;
      }
      /*sort................*/
      let _sort = {};
      if (req.query.product_total_price) {
        _sort.product_total_price = req.query.product_total_price;
      }
      /*.....SORT END..............................*/
      let totalSubOrder = await Suborder.count().where(_where);
      _pagination.limit = _pagination.limit ? _pagination.limit : totalSubOrder;
      let SubOrders = await Suborder.find({
        where: _where,
        contains: req.query.date,
        sort: _sort
      }).populate('product_order_id', _suborder_where);
      let allSubOrders = await Promise.all(
        SubOrders.map(async item => {
          item.product_order_id = await Order.find({
            deletedAt: null,
            id: item.product_order_id.id
          }).populate('user_id', {deletedAt: null});

          return item;
        })
      );

      res.status(200).json({
        success: true,
        total: totalSubOrder,
        message: 'Get All SubOrderListWithDate with pagination',
        data: allSubOrders
      });
    } catch (error) {
      let message = 'Error in Get All SubOrderListWithDate with pagination';
      res.status(400).json({
        success: false,
        message
      });
    }
  },
  //Method called for getting all product suborder with relations
  //Model models/Order.js, models/Suborder.js, models/SuborderItem.js, models/Product.js
  getWithFull: async function (req, res) {
    let suborder = await Suborder.findOne({
      id: req.param('id'),
      deletedAt: null
    }).populate(['suborderItems', 'warehouse_id', 'product_order_id', 'couponProductCodes']);
    let suborderItems = [];
    for (let i = 0; i < suborder.suborderItems.length; i++) {
      let suborderItem = await SuborderItem.findOne({
        id: suborder.suborderItems[i].id,
        deletedAt: null
      }).populate(['product_id']);
      let oiv = await SuborderItemVariant.find({
        product_id: suborderItem.product_id.id,
        product_suborder_item_id: suborder.suborderItems[i].id,
        deletedAt: null
      })
        .populate('variant_id', {deletedAt: null})
        .populate('warehouse_variant_id', {deletedAt: null})
        .populate('product_variant_id', {deletedAt: null});
      if (oiv.length > 0) {
        suborderItem.orderitemvariant = oiv;
      } else {
        suborderItem.orderitemvariant = {};
      }
      suborderItems.push(suborderItem);
    }
    let d = Object.assign({}, suborder);
    d.suborderItems = suborderItems;
    return res.json(d);
  }
};
