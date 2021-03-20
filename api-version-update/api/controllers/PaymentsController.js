/**
 * PaymentsController
 *
 * @description :: Server-side logic for managing payments
 * @help        :: See http://sailsjs.org/#!/documentation/concepts/Controllers
 */
const {pagination} = require('../../libs/pagination');
const Promise = require('bluebird');
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
          p_order.ssl_transaction_id,
          CONCAT(customer.first_name, ' ', customer.last_name) as customer_name,
          CONCAT(receiver.first_name, ' ',receiver.last_name) as receiver_name,
          customer.phone as customer_phone
      `;

      let fromSQL = ' FROM payments  ';
      fromSQL += ' LEFT JOIN product_orders as p_order ON p_order.id = payments.order_id   ';
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
      console.log('req.query.dateSearchValue', req.query.dateSearchValue);
      if (req.query.dateSearchValue) {
        _where += ` AND payments.created_at LIKE '${req.query.dateSearchValue}%' `;
      }

      let _sort ='';
      if (req.query.sortValue && req.query.sortKey) {
         _sort += ` ORDER BY payments.${req.query.sortKey} ${req.query.sortValue} `;
      } else {
        _sort += ` ORDER BY payments.created_at DESC `;
      }
      let totalPayments = 0;
      let allPayments = [];
      const totalPaymentsRaw = await PaymentNativeQuery('SELECT COUNT(*) as totalCount ' + fromSQL + _where, []);
      if (totalPaymentsRaw && totalPaymentsRaw.rows && totalPaymentsRaw.rows.length > 0) {
        totalPayments = totalPaymentsRaw.rows[0].totalCount;
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
};

