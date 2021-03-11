/**
 * SubOrderItemController
 *
 * @description :: Server-side logic for managing order_items
 * @help        :: See http://sailsjs.org/#!/documentation/concepts/Controllers
 */

const moment = require('moment');
const Promise = require('bluebird');
const {pagination} = require('../../libs/pagination');

module.exports = {
  // destroy a row
  destroy: async (req, res) => {
    try {
      const user = await SuborderItem.updateOne(
        {id: req.param('id')},
      ).set({deletedAt: new Date()});
      return res.json(user);
    } catch (error) {
      return res.json(error.status, {message: '', error, success: false});
    }
  },
  getBySubOrderIds: async (req, res) => {
    const SuborderItemQuery = Promise.promisify(SuborderItem.getDatastore().sendNativeQuery);
    try {
      let _pagination = pagination(req.query);
      let rawSelect = `
      SELECT
          suborder_item.id as id,
          suborder_item.product_suborder_id as suborder_id,
          p_order.id as order_id,
          suborder_item.product_id,
          products.name as product_name,
          products.price as price,
          products.code as product_code,
          p_order.ssl_transaction_id,
          suborder_item.warehouse_id,
          suborder_item.product_quantity,
          suborder_item.product_total_price,
          suborder_item.status,
          suborder_item.\`date\`,  suborder_item.created_at,
          p_order.status as order_status,
          p_order.user_id, suborder.status as sub_order_status,
          CONCAT(customer.first_name, ' ',customer.last_name) as customer_name,
          CONCAT(orderChangedBy.first_name, ' ',orderChangedBy.last_name) as order_changed_by_name,
          CONCAT(subOrderChangedBy.first_name, ' ',subOrderChangedBy.last_name) as suborder_changed_by_name,
          customer.phone as customer_phone,
          vendor.name as vendor_name,
          vendor.phone as vendor_phone,
          GROUP_CONCAT(coupon.id) as all_coupons
      `;

      let fromSQL = ' FROM product_suborder_items as suborder_item  ';
      fromSQL += ' LEFT JOIN product_suborders as suborder ON suborder.id = suborder_item.product_suborder_id   ';
      fromSQL += ' LEFT JOIN product_orders as p_order ON p_order.id = suborder.product_order_id   ';
      fromSQL += ' LEFT JOIN products   ON products.id = suborder_item.product_id   ';
      fromSQL += ' LEFT JOIN users as customer ON customer.id = p_order.user_id   ';
      fromSQL += ' LEFT JOIN users as orderChangedBy ON orderChangedBy.id = p_order.changed_by   ';
      fromSQL += ' LEFT JOIN users as subOrderChangedBy ON subOrderChangedBy.id = suborder.changed_by   ';
      fromSQL += ' LEFT JOIN warehouses as vendor ON vendor.id = suborder.warehouse_id   ';
      fromSQL += ' LEFT JOIN product_purchased_coupon_codes as coupon ON coupon.suborder_item_id = suborder_item.id   ';

      let _where = ' WHERE p_order.deleted_at IS NULL AND suborder.deleted_at IS NULL AND suborder_item.deleted_at IS NULL ';

      if (req.query.order_ids) {
        try {
          const orderIds = JSON.parse(req.query.order_ids);
          if (Array.isArray(orderIds) && orderIds.length > 0) {
            _where += ` AND suborder.product_order_id IN  (${orderIds.join(',')}) `;
          }
        } catch (errorr) {
          console.log(errorr);
        }
      }
      _where += ' GROUP BY coupon.suborder_item_id ORDER BY suborder_item.created_at DESC ';

      let totalSuborderItems = 0;
      let allSubOrderItems = [];
      const totalSuborderItemRaw = await SuborderItemQuery('SELECT COUNT(*) as totalCount ' + fromSQL + _where, []);
      if (totalSuborderItemRaw && totalSuborderItemRaw.rows && totalSuborderItemRaw.rows.length > 0) {
        totalSuborderItems = totalSuborderItemRaw.rows[0].totalCount;
        _pagination.limit = _pagination.limit ? _pagination.limit : totalSuborderItems;

        let limitSQL = ` LIMIT ${_pagination.skip}, ${_pagination.limit} `;
        const rawResult = await SuborderItemQuery(rawSelect + fromSQL + _where + limitSQL, []);

        allSubOrderItems = rawResult.rows;
      }

      return res.status(200).json({
        success: true,
        total: totalSuborderItems,
        message: 'Get all SubOrderItem Lists with pagination',
        data: allSubOrderItems
      });
    } catch (error) {
      let message = 'Error in getting all subOrder item List with pagination';
      return res.status(400).json({
        success: false,
        message,
        error
      });
    }
  },
  getByOrderIds: async (req, res) => {
    const SuborderItemQuery = Promise.promisify(SuborderItem.getDatastore().sendNativeQuery);
    try {
      let _pagination = pagination(req.query);
      let rawSelect = `
      SELECT suborder_item.id, suborder_item.product_suborder_id as suborder_id, p_order.id as order_id, suborder_item.product_id,
       products.name as product_name, products.price as price, products.code as product_code, p_order.ssl_transaction_id,
       suborder_item.warehouse_id, suborder_item.product_quantity, suborder_item.product_total_price,
       suborder_item.status, suborder_item.\`date\`,  suborder_item.created_at,
       p_order.status as order_status, p_order.user_id, suborder.status as sub_order_status,
       CONCAT(customer.first_name, ' ',customer.last_name) as customer_name,
       CONCAT(orderChangedBy.first_name, ' ',orderChangedBy.last_name) as order_changed_by_name,
       CONCAT(subOrderChangedBy.first_name, ' ',subOrderChangedBy.last_name) as suborder_changed_by_name,
       customer.phone as customer_phone, vendor.name as vendor_name, vendor.phone as vendor_phone,
       GROUP_CONCAT(coupon.id) as all_coupons
      `;

      let fromSQL = ' FROM product_suborder_items as suborder_item  ';
      fromSQL += ' LEFT JOIN product_suborders as suborder ON suborder.id = suborder_item.product_suborder_id   ';
      fromSQL += ' LEFT JOIN product_orders as p_order ON p_order.id = suborder.product_order_id   ';
      fromSQL += ' LEFT JOIN products   ON products.id = suborder_item.product_id   ';
      fromSQL += ' LEFT JOIN users as customer ON customer.id = p_order.user_id   ';
      fromSQL += ' LEFT JOIN users as orderChangedBy ON orderChangedBy.id = p_order.changed_by   ';
      fromSQL += ' LEFT JOIN users as subOrderChangedBy ON subOrderChangedBy.id = suborder.changed_by   ';
      fromSQL += ' LEFT JOIN warehouses as vendor ON vendor.id = suborder.warehouse_id   ';
      fromSQL += ' LEFT JOIN product_purchased_coupon_codes as coupon ON coupon.suborder_item_id = suborder_item.id   ';

      let _where = ' WHERE p_order.deleted_at IS NULL AND suborder.deleted_at IS NULL AND suborder_item.deleted_at IS NULL ';

      if (req.query.order_ids) {
        try {
          const orderIds = JSON.parse(req.query.order_ids);
          if (Array.isArray(orderIds) && orderIds.length > 0) {
            _where += ` AND suborder.product_order_id IN  (${orderIds.join(',')}) `;
          }
        } catch (errorr) {
          console.log(errorr);
        }
      }
      _where += ' GROUP BY coupon.suborder_item_id ORDER BY suborder_item.created_at DESC ';

      let totalSuborderItems = 0;
      let allSubOrderItems = [];
      const totalSuborderItemRaw = await SuborderItemQuery('SELECT COUNT(*) as totalCount ' + fromSQL + _where, []);
      if (totalSuborderItemRaw && totalSuborderItemRaw.rows && totalSuborderItemRaw.rows.length > 0) {
        totalSuborderItems = totalSuborderItemRaw.rows[0].totalCount;
        _pagination.limit = _pagination.limit ? _pagination.limit : totalSuborderItems;

        let limitSQL = ` LIMIT ${_pagination.skip}, ${_pagination.limit} `;
        const rawResult = await SuborderItemQuery(rawSelect + fromSQL + _where + limitSQL, []);

        allSubOrderItems = rawResult.rows;
      }

      return res.status(200).json({
        success: true,
        total: totalSuborderItems,
        message: 'Get all SubOrderItem Lists with pagination',
        data: allSubOrderItems
      });
    } catch (error) {
      let message = 'Error in getting all subOrder item List with pagination';
      return res.status(400).json({
        success: false,
        message,
        error
      });
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
      rawSelect += ' CONCAT(customer.first_name, \' \',customer.last_name) as customer_name,  ';
      rawSelect += ' products.name as product_name, customer.phone as customer_phone ';

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
      if (req.query.product_order_ids) {
        // _where.product_suborder_id = req.query.product_suborder_id;
        try {
          const orderIds = JSON.parse(req.query.product_order_ids);
          if (Array.isArray(orderIds) && orderIds.length > 0) {
            _where += ` AND suborder.product_order_id IN  (${orderIds.json(',')}) `;
          }
        } catch (errorr) {

        }
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
        _where += ' AND suborder_item.`date` = "' + date + '" ';
      }
      if (req.query.product_total_price) {
        _where += ' ORDER BY suborder_item.product_total_price DESC ';
      } else {
        _where += ' ORDER BY suborder_item.created_at DESC ';
      }
      let totalSuborderItems = 0;
      let allSubOrderItems = [];
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
