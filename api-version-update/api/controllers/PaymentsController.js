const {initLogPlaceholder, pagination} = require('../../libs');

/**
 * PaymentsController
 *
 * @description :: Server-side logic for managing payments
 * @help        :: See http://sailsjs.org/#!/documentation/concepts/Controllers
 */

module.exports = {
  //Method called for getting all payment data
  //Model models/Payment.js
  getAll: async (req, res) => {
    try {
      initLogPlaceholder(req, 'Payments');

      let _pagination = pagination(req.query);

      /* WHERE condition for .......START.....................*/
      let _where = {};
      let _where2 = {};
      _where.deletedAt = null;
      _where2.deletedAt = null;

      //userName
      if (req.query.search_term) {
        _where2.or = [
          { first_name: { like: `%${req.query.searchTermName}%` } },
          { last_name: { like: `%${req.query.searchTermName}%` } }
        ];
      }
      if (req.query.orderNumberSearchValue) {
        _where.order_id = {'like': `%${req.query.orderNumberSearchValue}%`};
      }
      if (req.query.suborderNumberSearchValue) {
        _where.suborder_id = {'like': `%${req.query.suborderNumberSearchValue}%`};
      }
      if (req.query.userIdSearchValue) {
        _where.user_id = {'like': `%${req.query.userIdSearchValue}%`};
      }
      if (req.query.transactionSearchValue) {
        _where.transection_key = {'like': `%${req.query.transactionSearchValue}%`};
      }
      if (req.query.paymentTypeSearchValue) {
        _where.payment_type = {'like': `%${req.query.paymentTypeSearchValue}%`};
      }
      if (req.query.paymentAmountSearchValue) {
        _where.payment_amount = {'like': `%${req.query.paymentAmountSearchValue}%`};
      }
      if (req.query.dateSearchValue) {
        _where.payment_date = {'like': `%${req.query.dateSearchValue}%`};
      }
      if (req.query.statusSearchValue) {
        _where.status = {'like': `%${req.query.statusSearchValue}%`};
      }
      /* WHERE condition..........END................*/

      /*sort................*/
      let _sort = {};
      if (req.query.sortName) {
        _sort.name = req.query.sortName;
      }


      /*.....SORT END..............................*/


      let totalPayment = await  Payment.count().where(_where);
      _pagination.limit = _pagination.limit ? _pagination.limit : totalPayment;
      let payments = await Payment.find(
        {
          where: _where,
          limit: _pagination.limit,
          skip: _pagination.skip,
          sort: _sort,
        })
        .populate('user_id', {  where: _where2, })
        .populate('order_id', { deletedAt: null })
        .populate('suborder_id', { deletedAt: null })
        .populate('receiver_id', { deletedAt: null });

      res.status(200).json({
        success: true,
        total: totalPayment,
        limit: _pagination.limit,
        skip: _pagination.skip,
        page: _pagination.page,
        message: 'Get All Payment with pagination',
        data: payments
      });
    } catch
    (error) {
      let message = 'Error in Get All Payment with pagination';
      res.status(400).json({
        success: false,
        message
      });
    }
  },
};

