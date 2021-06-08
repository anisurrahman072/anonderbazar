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
    const StatusChangeQuery = Promise.promisify(StatusChange.getDatastore().sendNativeQuery);
    try {
      let rawSelect = `
      SELECT
          suborder_item.id as id,
          suborder.warehouse_id as warehouse_id,
          suborder_item.product_suborder_id as suborder_id,
          p_order.id as order_id,
          suborder_item.product_id,
          products.name as product_name,
          products.price as price,
          products.vendor_price as vendor_price ,
          products.code as product_code,
          p_order.ssl_transaction_id,
          suborder_item.product_quantity,
          suborder_item.product_total_price,
          suborder_item.status,
          suborder_item.\`date\` as suborder_item_date,
          suborder_item.created_at,
          p_order.status as order_status,
          p_order.user_id, suborder.status as sub_order_status,
          CONCAT(customer.first_name, ' ', customer.last_name) as customer_name,
          CONCAT(orderChangedBy.first_name, ' ',orderChangedBy.last_name) as order_changed_by_name,
          CONCAT(subOrderChangedBy.first_name, ' ',subOrderChangedBy.last_name) as suborder_changed_by_name,
          customer.phone as customer_phone,
          vendor.name as vendor_name,
          vendor.phone as vendor_phone
      `;

      let fromSQL = ' FROM product_suborder_items as suborder_item  ';
      fromSQL += ' LEFT JOIN product_suborders as suborder ON suborder.id = suborder_item.product_suborder_id   ';
      fromSQL += ' LEFT JOIN product_orders as p_order ON p_order.id = suborder.product_order_id   ';
      fromSQL += ' LEFT JOIN products   ON products.id = suborder_item.product_id   ';
      fromSQL += ' LEFT JOIN users as customer ON customer.id = p_order.user_id   ';
      fromSQL += ' LEFT JOIN users as orderChangedBy ON orderChangedBy.id = p_order.changed_by   ';
      fromSQL += ' LEFT JOIN users as subOrderChangedBy ON subOrderChangedBy.id = suborder.changed_by   ';
      fromSQL += ' LEFT JOIN warehouses as vendor ON vendor.id = suborder.warehouse_id   ';

      let _where = ' WHERE p_order.deleted_at IS NULL AND suborder.deleted_at IS NULL AND suborder_item.deleted_at IS NULL ';
      let _whereStatuses = ' WHERE st.deleted_at IS NULL ';

      if (req.query.sub_order_ids) {
        try {
          const sub_order_ids = JSON.parse(req.query.sub_order_ids);
          if (Array.isArray(sub_order_ids) && sub_order_ids.length > 0) {
            _where += ` AND suborder.id IN  (${sub_order_ids.join(',')}) `;
            _whereStatuses += ` AND st.suborder_id IN  (${sub_order_ids.join(',')}) `;
          }
        } catch (errorr) {
          console.log(errorr);
          return res.badRequest('Invalid Data');
        }
      }
      _where += '  ORDER BY suborder_item.created_at ASC ';

      let totalSuborderItems = 0;
      let allSubOrderItems = [];
      const totalSuborderItemRaw = await SuborderItemQuery('SELECT COUNT(*) as totalCount ' + fromSQL + _where, []);
      if (totalSuborderItemRaw && totalSuborderItemRaw.rows && totalSuborderItemRaw.rows.length > 0) {
        totalSuborderItems = totalSuborderItemRaw.rows[0].totalCount;
        const rawResult = await SuborderItemQuery(rawSelect + fromSQL + _where, []);

        allSubOrderItems = rawResult.rows;
      }

      let subOrderStatuses = [];
      if (req.query.withStatuses) {
        let rawSelectStatuses = `
          SELECT
            st.suborder_id as suborder_id,
            st.status as suborder_status,
            st.date as status_date,
            CONCAT(changedBy.first_name, ' ', changedBy.last_name) as changed_by_name
      `;

        let fromSQLStatues = ' FROM orders_status as st ';
        fromSQLStatues += ' LEFT JOIN users as changedBy ON changedBy.id = st.changed_by ';

        let rawResultStatuses = await StatusChangeQuery(rawSelectStatuses + fromSQLStatues + _whereStatuses, []);
        subOrderStatuses = rawResultStatuses.rows;
      }

      return res.status(200).json({
        success: true,
        total: totalSuborderItems,
        message: 'Get all SubOrderItem Lists with pagination',
        data: allSubOrderItems,
        subOrderStatuses
      });
    } catch (error) {
      console.log(error);
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
       GROUP_CONCAT(coupon.id) as all_coupons, payment_addresses.postal_code,payment_addresses.address,
       divArea.name as division_name,
       zilaArea.name as zila_name,
       upazilaArea.name as upazila_name
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
      fromSQL += ' LEFT JOIN payment_addresses ON p_order.shipping_address = payment_addresses.id' +
        '          LEFT JOIN areas as divArea ON divArea.id = payment_addresses.division_id      ' +
        '       LEFT JOIN areas as zilaArea ON zilaArea.id = payment_addresses.zila_id' +
        '       LEFT JOIN areas as upazilaArea ON upazilaArea.id = payment_addresses.upazila_id ';

      let _where = ' WHERE p_order.deleted_at IS NULL AND suborder.deleted_at IS NULL AND suborder_item.deleted_at IS NULL ';

      if (req.query.order_ids) {
        try {
          const orderIds = JSON.parse(req.query.order_ids);
          if (Array.isArray(orderIds) && orderIds.length > 0) {
            _where += ` AND suborder.product_order_id IN  (${orderIds.join(',')}) `;
          }
        } catch (errorr) {
          console.log(errorr);
          return res.badRequest('Invalid Data');
        }
      }
      _where += ' GROUP BY suborder_item.id ORDER BY suborder_item.created_at DESC ';

      let totalSuborderItems = 0;
      let allSubOrderItems = [];
      const totalSuborderItemRaw = await SuborderItemQuery('SELECT COUNT(*) as totalCount ' + fromSQL + _where, []);
      if (totalSuborderItemRaw && totalSuborderItemRaw.rows && totalSuborderItemRaw.rows.length > 0) {
        totalSuborderItems = totalSuborderItemRaw.rows[0].totalCount;

        const rawResult = await SuborderItemQuery(rawSelect + fromSQL + _where, []);
        allSubOrderItems = rawResult.rows;
      }

      return res.status(200).json({
        success: true,
        total: totalSuborderItems,
        message: 'Get all SubOrderItem Lists with pagination',
        data: allSubOrderItems
      });
    } catch (error) {
      console.log(error);
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
        _where += ` AND suborder_item.product_id = ${req.query.product_suborder_id} `;
      }
      if (req.query.product_order_ids) {
        try {
          const orderIds = JSON.parse(req.query.product_order_ids);
          if (Array.isArray(orderIds) && orderIds.length > 0) {
            _where += ` AND suborder.product_order_id IN  (${orderIds.json(',')}) `;
          }
        } catch (errorr) {
          console.log(errorr);
          return res.badRequest('Invalid Data');
        }
      }
      if (req.query.warehouse_id) {
        _where += ` AND suborder.warehouse_id = ${req.query.warehouse_id} `;
      }
      if (req.query.product_id) {
        _where += ` AND suborder_item.product_id = ${req.query.product_id} `;
      }
      if (req.query.product_quantity) {
        _where += ` AND suborder_item.product_quantity = ${req.query.product_quantity} `;
      }
      if (req.query.status) {
        _where += ` AND suborder.status = ${req.query.status} `;
      }
      if (req.query.date) {
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
