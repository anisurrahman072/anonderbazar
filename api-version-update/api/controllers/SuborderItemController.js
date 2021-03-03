/**
 * SubOrderItemController
 *
 * @description :: Server-side logic for managing order_items
 * @help        :: See http://sailsjs.org/#!/documentation/concepts/Controllers
 */
const {
  pagination
} = require('../../libs');
const moment = require('moment');
const Promise = require('bluebird');

module.exports = {
  // destroy a row
  destroy: async (req, res) => {
    try {
      const user = await SuborderItem.updateOne(
        {id: req.param('id')},
      ).set({deletedAt: new Date()});
      return res.json(user);
    }
    catch (error){
      return res.json(error.status, {message: '', error, success: false});
    }
  },
  //Method called for getting all product sub order item
  //Model models/Order.js, models/Suborder.js, models/SuborderItem.js
  getSuborderItems: async (req, res) => {
    const SuborderItemQuery = Promise.promisify(SuborderItem.getDatastore().sendNativeQuery);
    try {
      let _pagination = pagination(req.query);
      let rawSelect = 'SELECT suborder_item.id, suborder_item.product_suborder_id as suborder_id, p_order.id as order_id, suborder_item.product_id,';
      rawSelect += ' suborder_item.warehouse_id, suborder_item.product_quantity, suborder_item.product_total_price, ';
      rawSelect += ' suborder_item.status, suborder_item.`date`,  suborder_item.`created_at`, ';
      rawSelect += ' p_order.status as order_status, p_order.user_id, suborder.status as sub_order_status, ';
      rawSelect += ' CONCAT(customer.first_name, \' \',customer.first_name) as customer_name,  ';
      rawSelect += ' products.name as product_name,  ';
      rawSelect += ' customer.phone as customer_phone ';

      let fromSQL = ' FROM product_suborder_items as suborder_item  ';
      fromSQL += ' LEFT JOIN product_suborders as suborder ON suborder.id = suborder_item.product_suborder_id   ';
      fromSQL += ' LEFT JOIN product_orders as p_order ON p_order.id = suborder.product_order_id   ';
      fromSQL += ' LEFT JOIN products   ON products.id = suborder_item.product_id   ';
      fromSQL += ' LEFT JOIN users as customer ON customer.id = p_order.user_id   ';

      let _where = ' WHERE suborder.deleted_at IS NULL AND suborder_item.deleted_at IS NULL ';

      if (req.query.product_suborder_id) {
        // _where.product_suborder_id = req.query.product_suborder_id;
        _where += ` AND suborder_item.product_id = ${req.query.product_suborder_id} `;
      }
      if (req.query.warehouse_id) {
        // _where.warehouse_id = req.query.warehouse_id;
        _where += ` AND suborder.warehouse_id = ${req.query.warehouse_id} `;
      }
      if (req.query.product_id) {
        // _where.product_id = req.query.product_id;
        _where += ` AND suborder_item.product_id = ${req.query.product_id} `;
      }
      if (req.query.product_quantity) {
        // _where.product_quantity = req.query.product_quantity;
        _where += ` AND suborder_item.product_quantity = ${req.query.product_quantity} `;
      }
      if (req.query.status) {
        // _suborder_where.status = req.query.status;
        _where += ` AND suborder.status = ${req.query.status} `;
      }
      if (req.query.date) {
        // _where.date = req.query.date;
        const date = moment(req.query.date).format('YYYY-MM-DD');
        _where += ' AND suborder_item.`date` = "' + date + '"';
      }
      if (req.query.product_total_price) {
        _where += ' ORDER BY suborder_item.product_total_price DESC ';
      } else {
        _where += ' ORDER BY suborder_item.created_at DESC ';
      }
      let totalSuborderItems = 0; let allSubOrderItems = [];
      const totalSuborderItemRaw = await SuborderItemQuery('SELECT COUNT(*) as totalCount ' + fromSQL + _where, []);
      if (totalSuborderItemRaw && totalSuborderItemRaw.rows && totalSuborderItemRaw.rows.length > 0) {
        totalSuborderItems = totalSuborderItemRaw.rows[0].totalCount;
        _pagination.limit = _pagination.limit ? _pagination.limit : totalSuborderItems;

        let limitSQL = ` LIMIT ${_pagination.skip}, ${_pagination.limit} `;
        const rawResult = await SuborderItemQuery(rawSelect + fromSQL + _where + limitSQL, []);

        allSubOrderItems = rawResult.rows;
      }

      allSubOrderItems = allSubOrderItems.filter((el) => {
        return el;
      });

      res.status(200).json({
        success: true,
        total: totalSuborderItems,
        message: 'Get All SubOrderItemLists with pagination',
        data: allSubOrderItems
      });
    } catch (error) {
      let message = 'Error in Get All SubOrderItemList with pagination';
      res.status(400).json({
        success: false,
        message,
        error
      });
    }
  }
};
