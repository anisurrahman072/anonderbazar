/**
 * PaymentsController
 *
 * @description :: Server-side logic for managing payments
 * @help        :: See http://sailsjs.org/#!/documentation/concepts/Controllers
 */
const {pagination} = require('../../libs/pagination');
const Promise = require('bluebird');
const {
  APPROVED_PAYMENT_APPROVAL_STATUS,
  PENDING_PAYMENT_APPROVAL_STATUS,
  PAYMENT_STATUS_PAID,
  PAYMENT_STATUS_UNPAID,
  PAYMENT_STATUS_PARTIALLY_PAID,
  OFFLINE_PAYMENT_TYPE,
  CONFIRMED_ALL_OFFLINE_PAYMENTS_APPROVAL_STATUS
} = require('../../libs/constants');
const {ORDER_STATUSES} = require('../../libs/orders');
const {getGlobalConfig} = require('../../libs/helper');
const moment = require('moment');

module.exports = {
  //Method called for getting all payment data
  //Model models/Payment.js
  getAll: async (req, res) => {
    try {
      let _pagination = pagination(req.query);
      const PaymentNativeQuery = Promise.promisify(Payment.getDatastore().sendNativeQuery);

      let rawSelect = `
      SELECT
          payments.id as id,
          payments.suborder_id as suborder_id,
          payments.order_id as order_id,
          payments.transection_key,
          payments.payment_type as payment_type,
          payments.payment_amount as payment_amount,
          payments.payment_date as payment_date,
          payments.created_at as created_at,
          payments.receiver_id as receiver_id,
          payments.approval_status as approval_status,
          payments.details as paymentDetails,
          p_order.ssl_transaction_id,
          p_order.order_type,

          GROUP_CONCAT(COALESCE(products.name, '') SEPARATOR ' ___ ') as productName,
          GROUP_CONCAT(p_suborder_items.product_quantity) as productQty,
          GROUP_CONCAT(p_suborder_items.product_total_price) as productTotalPrice,

          CONCAT(customer.first_name, ' ', customer.last_name) as customer_name,
          CONCAT(receiver.first_name, ' ',receiver.last_name) as receiver_name,
          customer.phone as customer_phone
      `;

      let fromSQL = ' FROM payments  ';
      fromSQL += ' LEFT JOIN product_orders as p_order ON p_order.id = payments.order_id   ';
      fromSQL += ' LEFT JOIN product_suborders as p_suborders ON p_suborders.product_order_id = p_order.id  ';
      fromSQL += ' LEFT JOIN product_suborder_items as p_suborder_items ON p_suborder_items.product_suborder_id = p_suborders.id  ';
      fromSQL += ' LEFT JOIN products as products ON products.id = p_suborder_items.product_id  ';
      fromSQL += ' LEFT JOIN users as customer ON customer.id = payments.user_id   ';
      fromSQL += ' LEFT JOIN users as receiver ON receiver.id = payments.receiver_id   ';
      let _where = ' WHERE p_order.deleted_at IS NULL AND payments.deleted_at IS NULL  ';

      //userName
      if (req.query.nameSearchValue) {
        _where += ` AND (customer.first_name LIKE '%${req.query.nameSearchValue}%' OR customer.last_name LIKE '%${req.query.nameSearchValue}%') `;
      }
      if (req.query.orderNumberSearchValue) {
        _where += ` AND payments.order_id = '${req.query.orderNumberSearchValue}' `;
      }
      if (req.query.suborderNumberSearchValue) {
        _where += ` AND payments.suborder_id = '${req.query.suborderNumberSearchValue}' `;
      }

      if (req.query.transactionSearchValue) {
        _where += ` AND payments.transection_key LIKE '%${req.query.transactionSearchValue}%' `;
      }
      if (req.query.paymentTypeSearchValue) {
        _where += ` AND payments.payment_type LIKE '%${req.query.paymentTypeSearchValue}%' `;
      }
      if (req.query.paymentAmountSearchValue) {
        _where += ` AND payments.payment_amount LIKE '%${req.query.paymentAmountSearchValue}%' `;
      }
      if (req.query.approvalStatusSearchValue) {
        _where += ` AND payments.approval_status = ${req.query.approvalStatusSearchValue} `;
      }
      if (req.query.orderType) {
        _where += ` AND p_order.order_type = ${req.query.orderType} `;
      }
      console.log('req.query.dateSearchValue', req.query.dateSearchValue);
      if (req.query.dateSearchValue) {
        _where += ` AND payments.created_at LIKE '${req.query.dateSearchValue}%' `;
      }

      let _sort = '';
      if (req.query.sortValue && req.query.sortKey) {
        _sort += ` GROUP BY id ORDER BY payments.${req.query.sortKey} ${req.query.sortValue} `;
      } else {
        _sort += ` GROUP BY id ORDER BY payments.created_at DESC `;
      }
      let totalPayments = 0;
      let allPayments = [];
      const totalPaymentsRaw = await PaymentNativeQuery('SELECT COUNT(*) as totalCount ' + fromSQL + _where + ' GROUP BY payments.id ', []);
      if (totalPaymentsRaw && totalPaymentsRaw.rows && totalPaymentsRaw.rows.length > 0) {

        totalPayments = totalPaymentsRaw.rows.length;

        _pagination.limit = _pagination.limit ? _pagination.limit : totalSuborderItems;

        let limitSQL = ` LIMIT ${_pagination.skip}, ${_pagination.limit} `;

        const rawResult = await PaymentNativeQuery(rawSelect + fromSQL + _where + _sort + limitSQL, []);

        allPayments = rawResult.rows;
      }


      res.status(200).json({
        success: true,
        total: totalPayments,
        limit: _pagination.limit,
        skip: _pagination.skip,
        page: _pagination.page,
        message: 'Get All Payment with pagination',
        data: allPayments
      });
    } catch (error) {
      console.log(error);
      let message = 'Error in Get All Payment with pagination';
      res.status(400).json({
        success: false,
        message,
        error
      });
    }
  },

  changeApprovalStatus: async (req, res) => {
    try {
      const paymentId = req.query.paymentId;
      const status = req.query.status;
      const orderId = req.query.orderId;

      const globalConfigs = await getGlobalConfig();

      let order = await Order.findOne({
        id: orderId,
        deletedAt: null
      });

      let updatedPayment = await Payment.updateOne({id: paymentId}, {
        approval_status: status
      });

      let pendingPayments = await Payment.find({
        order_id: orderId,
        payment_type: OFFLINE_PAYMENT_TYPE,
        approval_status: PENDING_PAYMENT_APPROVAL_STATUS,
        deletedAt: null
      });

      let _set = {};
      let finalPaidAmount = order.paid_amount;

      /** Check weather the PAYMENT PAID amount can change payment status of the Order */
      if (status == APPROVED_PAYMENT_APPROVAL_STATUS) {
        console.log('Status == Approved', updatedPayment, updatedPayment.payment_amount, finalPaidAmount);

        finalPaidAmount += updatedPayment.payment_amount;
        _set.paid_amount = finalPaidAmount;

        if (finalPaidAmount >= order.total_price) {
          _set.payment_status = PAYMENT_STATUS_PAID;
        } else {
          if (order.payment_status == PAYMENT_STATUS_UNPAID) {
            _set.payment_status = PAYMENT_STATUS_PARTIALLY_PAID;
          }
        }
      }
      /** END */

      /** Take decision weather the ORDER should be cancelled or NOT */
      if (pendingPayments && pendingPayments.length === 0 ){

        /** Update offline payment approval status to CONFIRMED_ALL */
        _set.partial_offline_payment_approval_status = CONFIRMED_ALL_OFFLINE_PAYMENTS_APPROVAL_STATUS;
        /** END */

        if(finalPaidAmount < order.total_price) {

          /** Calculate ORDER expended hour */
          let now = moment(new Date());
          let createdAt = moment(order.createdAt);
          let duration = moment.duration(now.diff(createdAt));
          let expendedHour = Math.floor(duration.asHours());
          /** END */
          console.log('Expended time ', expendedHour, globalConfigs.partial_payment_duration );

          if (expendedHour > globalConfigs.partial_payment_duration) {
            _set.status = ORDER_STATUSES.canceled;
            await Suborder.update({product_order_id: orderId}, {status: ORDER_STATUSES.canceled});
          }
        }
      }
      /** END */

      console.log('_set: ', _set);
      let updatedOrder = await Order.update({id: orderId}, _set);

      return res.status(200).json({
        success: true,
        message: 'Successfully updated the approval status',
        order: updatedOrder
      });
    } catch (error) {
      return res.status(400).json({
        success: false,
        message: 'Error occurred while updating the approval status. ',error,
      });
    }
  }
};

