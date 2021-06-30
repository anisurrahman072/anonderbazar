/**
 * StatusChangeController
 *
 * @description :: Server-side actions for handling incoming requests.
 * @help        :: See https://sailsjs.com/docs/concepts/actions
 */
const moment = require('moment');
const {ORDER_STATUSES} = require('../../libs/orders');
const {ORDER_STATUSES_INDEX} = require('../../libs/orders');
const {SUB_ORDER_STATUSES_INDEX} = require('../../libs/subOrders');

module.exports = {
  currentTime: (req, res) => {
    return res.json({
      currentTime: moment().format('YYYY-MM-DD HH:mm:ss')
    });
  },
  //Method called for changing product order status
  //Model models/Order.js, models/Suborder.js, models/SuborderItem.js
  updatecustom: async (req, res) => {

    const allSubOrderStatuses = Object.keys(SUB_ORDER_STATUSES_INDEX).map(key=>parseInt(key, 10));
    const allOrderStatuses = Object.keys(ORDER_STATUSES_INDEX).map(key=>parseInt(key, 10));

    const submittedStatus = parseInt(req.body.order_status, 10);
    if (req.body.suborder_id && allSubOrderStatuses.indexOf(submittedStatus) === -1) {
      return res.json(400, {
        success: false,
        message: 'Invalid suborder status'
      });
    }

    if (req.body.order_id && allOrderStatuses.indexOf(submittedStatus) === -1) {
      return res.json(400, {
        success: false,
        message: 'Invalid order status'
      });
    }

    try {
      let data = await StatusChange.create({
        order_id: req.body.order_id ? req.body.order_id : null,
        suborder_id: req.body.suborder_id ? req.body.suborder_id : null,
        changed_by: req.body.changed_by ? req.body.changed_by : null,
        date: new Date(),
        status: submittedStatus
      }).fetch();

      return res.json(200, data);

    } catch (error) {

      res.status(400).json({
        success: false,
        message: 'Problem in updating status',
        error,
      });
    }
  },
  //Method called for changing product sub order status
  //Model models/Order.js, models/Suborder.js, models/SuborderItem.js
  updatecustomcourier: async (req, res) => {

    try {
      let order = await Order.find({where: {id: body.order_id}})
        .populate('billing_address')
        .populate('shipping_address')
        .populate('suborders', {deletedAt: null})
        .populate('payment')
        .populate('user_id');

      order[0].suborders[0].items = await SuborderItem.find({where: {product_suborder_id: order[0].suborders[0].id}})
        .populate('product_suborder_id')
        .populate('product_id');

      let payload = {
        order_id: order[0].id,
        suborder_id: order[0].suborders[0].id,
        order_status: order[0].status,
        status: parseInt(body.status),
        changed_by: body.changed_by
      };

      let warehouse = await Warehouse.find({where: {id: order[0].suborders[0].warehouse_id}})
        .populate('zila_id')
        .populate('upazila_id')
        .populate('division_id');

      let data = await StatusChange.create(payload).fetch();

      if (payload.status === ORDER_STATUSES.delivered) {
        await Order.update({id: payload.order_id}, {status: payload.status});
        await Suborder.update({id: payload.suborder_id}, {status: payload.status});
      } else if (payload.status === ORDER_STATUSES.canceled) {
        let suborderCancelAll = Suborder.find({where: {product_order_id: payload.order_id, status: 12}});
        let suborderAll = Suborder.find({where: {product_order_id: payload.order_id, deleted_at: null}});
        if (suborderAll.length === suborderCancelAll.length) {
          await Order.update({id: payload.order_id}, {status: 12});
        }
        await Suborder.update({id: payload.suborder_id}, {status: payload.status});
      } else {
        await Order.update({id: payload.order_id}, {status: 2});
        await Suborder.update({id: payload.suborder_id}, {status: 2});
      }
      if (data) {
        EmailService.orderStatusdMail(order, ORDER_STATUSES_INDEX[payload.status]);
        if (payload.status === ORDER_STATUSES.pending || payload.status === ORDER_STATUSES.delivered) {
          EmailService.orderStatusdMailVendor(order, warehouse, ORDER_STATUSES_INDEX[payload.status]);
        }

        return res.json(200, data);
      } else {
        return res.status(400).json({success: false});
      }
    } catch (error) {
      return res.status(400).json({success: false, error});
    }

  }
};

