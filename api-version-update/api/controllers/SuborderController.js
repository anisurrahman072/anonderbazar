/**
 * SuborderController
 *
 * @description :: Server-side logic for managing suborders
 * @help        :: See http://sailsjs.org/#!/documentation/concepts/Controllers
 */
const {SUB_ORDER_STATUSES} = require('../../libs/subOrders');
const Promise = require('bluebird');
const {asyncForEach} = require('../../libs/helper');
const {pagination} = require('../../libs/pagination');
const {ORDER_STATUSES} = require('../../libs/orders');

module.exports = {
  // destroy a row
  destroy: async (req, res) => {
    try {
      const suborder = await Suborder.updateOne({id: req.param('id')}).set({deletedAt: new Date()});

      return res.json(suborder);

    } catch (err) {
      return res.json(400, err);
    }
  },
  //Method called for updaing product suborder by order id
  //Model models/Order.js, models/Suborder.js, models/SuborderItem.js
  updatebyorderid: async function (req, res) {

    try {
      const suborder = await Suborder.update({product_order_id: req.param('id')}, req.body).fetch();
      // eslint-disable-next-line eqeqeq
      if (req.body.status == SUB_ORDER_STATUSES.processing || req.body.status == SUB_ORDER_STATUSES.delivered || req.body.status == SUB_ORDER_STATUSES.canceled) {
        // eslint-disable-next-line eqeqeq
        if (req.body.status == SUB_ORDER_STATUSES.processing) {
          await CourierListOrder.update({order_id: req.param('id')}, {status: SUB_ORDER_STATUSES.prepared});
          await asyncForEach(suborder, async element => {
            await CourierList.update({suborder_id: element.id}, {status: SUB_ORDER_STATUSES.prepared});
          });
        } else {
          await CourierListOrder.update({order_id: req.param('id')}, req.body);
          await asyncForEach(suborder, async element => {
            await CourierList.update({suborder_id: element.id}, req.body);
          });
        }
      }
      if (suborder) {
        return res.json(200, suborder);
      } else {
        return res.status(400).json({success: false});
      }
    } catch (error) {
      return res.json(400, error);
    }


  },
  //Method called for getting all product suborder
  //Model models/Order.js, models/Suborder.js, models/SuborderItem.js
  getSuborder: async (req, res) => {
    try {

      const SuborderQuery = Promise.promisify(Suborder.getDatastore().sendNativeQuery);
      let _pagination = pagination(req.query);

      let rawSelect = 'SELECT suborder.id, suborder.product_order_id, suborder.warehouse_id,';
      rawSelect += ' suborder.total_quantity, suborder.total_price, suborder.delivery_date, ';
      rawSelect += ' suborder.courier_status, suborder.changed_by, suborder.PR_status, ';
      rawSelect += ' suborder.status, suborder.`date`,  ';
      rawSelect += ' orders.status as order_status, orders.user_id,  ';
      rawSelect += ' CONCAT(customer.first_name, \' \',customer.first_name) as customer_name,  ';
      rawSelect += ' customer.phone as customer_phone ';

      let fromSQL = ' FROM product_suborders as suborder  ';
      fromSQL += ' LEFT JOIN product_orders as orders ON orders.id = suborder.product_order_id   ';
      fromSQL += ' LEFT JOIN users as customer ON customer.id = orders.user_id   ';

      let _where = ' WHERE suborder.deleted_at IS NULL ';

      if (req.query.warehouse_id) {
        _where += ` AND suborder.warehouse_id = ${req.query.warehouse_id} `;
      }

      if (req.query.product_quantity) {
        _where += ` AND suborder.total_quantity = '%${req.query.product_quantity}%' `;
      }

      if (req.query.PR_status) {
        _where += ` AND suborder.PR_status = '${req.query.PR_status}' `;
      }

      if (req.query.status) {
        _where += ` AND suborder.status = '${req.query.status}' `;
      }

      if (req.query.product_total_price) {
        _where += ' ORDER BY suborder.total_price DESC ';
      } else {
        _where += ' ORDER BY suborder.created_at DESC ';
      }

      const totalSuborderRaw = await SuborderQuery('SELECT COUNT(*) as totalCount ' + fromSQL + _where, []);

      let totalSubOrder = 0;
      let allSubOrders = [];
      let totalPendingOrder = 0;
      let totalProcessingOrder = 0;
      let totalDeliveredOrder = 0;
      let totalCancelOrder = 0;
      let totalOtherStatusOrder = 0;

      if (totalSuborderRaw && totalSuborderRaw.rows && totalSuborderRaw.rows.length > 0) {
        totalSubOrder = totalSuborderRaw.rows[0].totalCount;
        _pagination.limit = _pagination.limit ? _pagination.limit : totalSubOrder;

        let limitSQL = ` LIMIT ${_pagination.skip}, ${_pagination.limit} `;
        const rawResult = await SuborderQuery(rawSelect + fromSQL + _where + limitSQL, []);

        allSubOrders = rawResult.rows;

        if (req.query.status) {
          const subOrderStatus = parseInt(req.query.status, 10);
          switch (subOrderStatus) {
            case ORDER_STATUSES.pending: {
              totalPendingOrder = totalSubOrder;
              break;
            }
            case ORDER_STATUSES.processing: {
              totalProcessingOrder = totalSubOrder;
              break;
            }
            case ORDER_STATUSES.delivered: {
              totalDeliveredOrder = totalSubOrder;
              break;
            }
            case ORDER_STATUSES.canceled: {
              totalCancelOrder = totalSubOrder;
              break;
            }
            default: {
              break;
            }
          }
        } else {
          if (req.query.warehouse_id) {
            totalPendingOrder = await Suborder.count().where({
              status: SUB_ORDER_STATUSES.pending,
              warehouse_id: req.query.warehouse_id
            });
            totalProcessingOrder = await Suborder.count().where({
              status: SUB_ORDER_STATUSES.processing,
              warehouse_id: req.query.warehouse_id
            });
            totalDeliveredOrder = await Suborder.count().where({
              status: SUB_ORDER_STATUSES.delivered,
              warehouse_id: req.query.warehouse_id
            });
            totalCancelOrder = await Suborder.count().where({
              status: SUB_ORDER_STATUSES.canceled,
              warehouse_id: req.query.warehouse_id
            });
          } else {
            totalPendingOrder = await Suborder.count().where({
              status: SUB_ORDER_STATUSES.pending,
            });
            totalProcessingOrder = await Suborder.count().where({
              status: SUB_ORDER_STATUSES.processing,
            });
            totalDeliveredOrder = await Suborder.count().where({
              status: SUB_ORDER_STATUSES.delivered,
            });
            totalCancelOrder = await Suborder.count().where({
              status: SUB_ORDER_STATUSES.canceled,
            });
          }
        }
      }

      return res.status(200).json({
        success: true,
        total: totalSubOrder,
        pendingOrder: totalPendingOrder,
        processingOrder: totalProcessingOrder,
        deliveredOrder: totalDeliveredOrder,
        canceledOrder: totalCancelOrder,
        totalOtherStatusOrder: totalOtherStatusOrder,
        message: 'Get All SubOrderList with pagination',
        data: allSubOrders
      });
    } catch (error) {
      let message = 'Error in Get All SubOrderList with pagination';
      return res.status(400).json({
        success: false,
        message,
        error
      });
    }
  },
  //Method called for getting all product suborder with dates
  //Model models/Order.js, models/Suborder.js, models/SuborderItem.js
  getSuborderWithDate: async (req, res) => {
    try {
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
      let _sort = [];
      if (req.query.product_total_price) {
        _sort.push({product_total_price: req.query.product_total_price});
      } else {
        _sort.push({createdAt: 'DESC'});
      }
      /*.....SORT END..............................*/
      let totalSubOrder = await Suborder.count().where(_where);
      _pagination.limit = _pagination.limit ? _pagination.limit : totalSubOrder;
      let SubOrders = await Suborder.find({
        where: _where,
        contains: req.query.date,
        sort: _sort
      }).populate('product_order_id');
      let allSubOrders = await Promise.all(
        SubOrders.map(async item => {
          item.product_order_id = await Order.find({
            deletedAt: null,
            id: item.product_order_id.id
          }).populate('user_id');

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
        message,
        error
      });
    }
  },
  //Method called for getting all product suborder with relations
  //Model models/Order.js, models/Suborder.js, models/SuborderItem.js, models/Product.js
  getWithFull: async (req, res) => {

    try {
      let suborder = await Suborder.findOne({
        id: req.param('id'),
        deletedAt: null
      }).populate('warehouse_id')
        .populate('product_order_id')
        .populate('suborderItems', {deletedAt: null})
        .populate('couponProductCodes', {deletedAt: null});

      let suborderItems = [];
      if (suborder && suborder.suborderItems && suborder.suborderItems.length > 0) {

        for (let i = 0; i < suborder.suborderItems.length; i++) {
          let suborderItem = await SuborderItem.findOne({
            id: suborder.suborderItems[i].id,
            deletedAt: null
          })
            .populate('product_id');

          let oiv = await SuborderItemVariant.find({
            product_id: suborderItem.product_id.id,
            product_suborder_item_id: suborder.suborderItems[i].id,
            deletedAt: null
          })
            .populate('variant_id')
            .populate('warehouse_variant_id')
            .populate('product_variant_id');

          if (oiv.length > 0) {
            suborderItem.orderitemvariant = oiv;
          } else {
            suborderItem.orderitemvariant = {};
          }
          suborderItems.push(suborderItem);
        }
      }

      if(suborder){
        suborder.suborderItems = suborderItems;
      }

      return res.status(200).json(suborder);
    } catch (error) {
      console.log(error);
      res.status(400).json({
        success: false,
        message: '',
        error
      });
    }

  }
};
