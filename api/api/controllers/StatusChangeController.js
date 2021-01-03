/**
 * StatusChangeController
 *
 * @description :: Server-side actions for handling incoming requests.
 * @help        :: See https://sailsjs.com/docs/concepts/actions
 */
import { Helper, asyncForEach, initLogPlaceholder, pagination } from '../../libs';

module.exports = {
  //Method called for changing product order status
  //Model models/Order.js, models/Suborder.js, models/SuborderItem.js
  updatecustom: async (req, res) => {
    initLogPlaceholder(req, 'chat Service create');
    async function create(body) {
      try {
        let statusArray = ['', 'Pending', 'Processing', 'Prepared', 'Departure', 'Pickup', 'In the Air', 'landed', 'Arrived At Warehouse', 'Shipped', 'Out For Delivery', 'Delivered', 'Canceled'];
        let data = await StatusChange.create(body);
        let order = await Order.find({where: {id: data.order_id}}).populateAll();
        order[0].suborders[0].items = await SuborderItem.find({where: {product_suborder_id: order[0].suborders[0].id}}).populateAll();
        if (data) {
          return res.json(200, data);
        } else {
          return res.status(400).json({ success: false });
        }
      } catch (error) {
        return res.status(400).json({ success: false });
      }
    }
    create(req.body);

  },
  //Method called for changing product sub order status
  //Model models/Order.js, models/Suborder.js, models/SuborderItem.js
  updatecustomcourier: async (req, res) => {
    initLogPlaceholder(req, 'chat Service create');
    async function create(body) {
      try {
        let statusArray = ['', 'Pending', 'Processing', 'Prepared', 'Departure', 'Pickup', 'In the Air', 'landed', 'Arrived At Warehouse', 'Shipped', 'Out For Delivery', 'Delivered', 'Returned'];
        let order = await Order.find({where: {id: body.order_id}}).populateAll();
        order[0].suborders[0].items = await SuborderItem.find({where: {product_suborder_id: order[0].suborders[0].id}}).populateAll();
        let payload = {
          order_id: order[0].id,
          suborder_id: order[0].suborders[0].id,
          order_status: order[0].status,
          status: body.status,
          changed_by: body.changed_by
        };
        let warehouse = await Warehouse.find({where: {id: order[0].suborders[0].warehouse_id}}).populateAll();


        let data = await StatusChange.create(payload);
        if (payload.status == 11) {
          var order = await Order.update({ id: payload.order_id },{status: payload.status });
          var suborder = await Suborder.update({ id: payload.suborder_id }, {status: payload.status});
        }else if(payload.status == 12){
          var suborderCancelAll = Suborder.find({where: {product_order_id:payload.order_id, status: 12}});
          var suborderAll = Suborder.find({where: {product_order_id:payload.order_id, deleted_at: null}});
          if (suborderAll.length == suborderCancelAll.length) {
            var order2 = await Order.update({ id: payload.order_id }, {status: 12 });
          }
          var suborder1 = await Suborder.update({ id: payload.suborder_id }, {status: payload.status});
        }else{
          var order2 = await Order.update({ id: payload.order_id }, {status: 2 });
          var suborder = await Suborder.update({ id: payload.suborder_id }, {status: 2});
        }
        if (data) {
          EmailService.orderStatusdMail(order, statusArray[payload.status]);
          if (statusArray[payload.status]=='Pending' || statusArray[payload.status] == 'Delivered') {
            EmailService.orderStatusdMailVendor(order, warehouse,statusArray[payload.status]);
          }

          return res.json(200, data);
        } else {
          return res.status(400).json({ success: false });
        }
      } catch (error) {
        return res.status(400).json({ success: false });
      }
    }
    create(req.body);

  }
};

