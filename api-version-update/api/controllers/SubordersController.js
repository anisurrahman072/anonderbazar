/**
 * SubordersController
 *
 * @description :: Server-side logic for managing suborders
 * @help        :: See http://sailsjs.org/#!/documentation/concepts/Controllers
 */

const moment = require('moment');
const Promise = require('bluebird');
const {asyncForEach} = require('../../libs/helper');
const {pagination} = require('../../libs/pagination');
const {SUB_ORDER_STATUSES} = require('../../libs/subOrders');

module.exports = {

  massPrStatusUpdate: async (req, res) => {
    try {
      if (req.body.ids && req.body.ids.length > 0) {

        await Suborder.update({
          id: req.body.ids,
        }).set({PR_status: req.body.status});

        return res.status(201).json({
          success: true,
          message: 'Mass update pr status successfully'
        });
      }
      return res.status(422).json({
        success: false,
        message: 'Error in Mass update pr status'
      });
    } catch (error) {
      console.log('error', error);
      let message = 'Error in Mass update pr status';
      res.status(400).json({
        success: false,
        message,
        error
      });
    }

  },
  forCsv: async (req, res) => {
    try {

      let _pagination = pagination(req.query);

      const SuborderQuery = Promise.promisify(Suborder.getDatastore().sendNativeQuery);

      let rawSelect = 'SELECT suborder.id, suborder.product_order_id, suborder.warehouse_id,';
      rawSelect += ' suborder.total_quantity, suborder.total_price, suborder.delivery_date, suborder.courier_status, ';
      rawSelect += ' suborder.PR_status, suborder.status, suborder.changed_by, suborder.`date`, suborder.created_at, ';
      rawSelect += ' CONCAT(userOrder.first_name, \' \',userOrder.last_name) as orderChangedBy,  ';
      rawSelect += ' CONCAT(userSuborder.first_name, \' \',userSuborder.last_name) as subOrderChangedBy,  ';
      rawSelect += ' warehouses.name as warehouse_name,  warehouses.phone as warehouse_phone,  ';
      rawSelect += ' warehouses.address as warehouse_address,  ';
      rawSelect += ' CONCAT(customer.first_name, \' \',customer.last_name) as customer_name,  ';
      rawSelect += ' customer.phone as customer_phone , ';
      rawSelect += ' product_orders.status as order_status  ';

      let fromSQL = ' FROM product_suborders as suborder  ';
      fromSQL += ' LEFT JOIN warehouses ON warehouses.id = suborder.warehouse_id     ';
      fromSQL += ' LEFT JOIN product_orders ON product_orders.id = suborder.product_order_id   ';
      fromSQL += ' LEFT JOIN users as userSuborder ON userSuborder.id = suborder.changed_by   ';
      fromSQL += ' LEFT JOIN users as userOrder ON userOrder.id = product_orders.changed_by   ';
      fromSQL += ' LEFT JOIN users as customer ON customer.id = product_orders.user_id   ';

      let _where = ' WHERE suborder.deleted_at IS NULL ';

      if (req.query.warehouse_id) {

        // _where.warehouse_id = req.query.warehouse_id;
        _where += ` AND suborder.warehouse_id = ${req.query.warehouse_id}`;
      }

      if (req.query.suborderNumberSearchValue) {
        // _where.id = {'like': `%${req.query.suborderNumberSearchValue}%`}
        _where += ` AND suborder.id LIKE '%${req.query.suborderNumberSearchValue}%' `;
      }

      if (req.query.orderNumberSearchValue) {
        // _where.product_order_id = {'like': `%${req.query.orderNumberSearchValue}%`}
        _where += ` AND suborder.product_order_id LIKE '%${req.query.orderNumberSearchValue}%' `;
      }

      if (req.query.quantitySearchValue) {
        // _where.total_quantity = {'like': `%${req.query.quantitySearchValue}%`}
        _where += ` AND suborder.total_quantity LIKE '%${req.query.quantitySearchValue}%' `;
      }
      if (req.query.totalPriceSearchValue) {
        // _where.total_price = {'like': `%${req.query.totalPriceSearchValue}%`}
        _where += ` AND suborder.total_price LIKE '%${req.query.totalPriceSearchValue}%' `;
      }

      if (req.query.dateSearchValue) {
        let dateSearchValue = JSON.parse(req.query.dateSearchValue);
        let from = moment(dateSearchValue.from).format('YYYY-MM-DD HH:mm:ss');
        let to = moment(dateSearchValue.to).format('YYYY-MM-DD HH:mm:ss');
        _where += ` AND ( suborder.created_at >= '${from}' AND suborder.created_at <= '${to}') `;
      }
      if (req.query.statusSearchValue) {
        // _where.status = {'like': `%${req.query.statusSearchValue}%`}
        _where += ` AND suborder.status = '${req.query.statusSearchValue}' `;
      }
      if (req.query.suborderIdValue) {
        _where += ` AND warehouses.name LIKE '%${req.query.suborderIdValue}%' `;
      }

      if (req.query.PR_status) {
        _where += ` AND suborder.PR_status = '${req.query.PR_status}' `;
      }

      if (req.query.sortName) {
        // _sort.name = req.query.sortName
        _where += ' ORDER BY suborder.created_at DESC ';
      } else {
        _where += ' ORDER BY suborder.created_at DESC ';
      }

      const totalSuborderRaw = await SuborderQuery('SELECT COUNT(*) as totalCount ' + fromSQL + _where, []);
      console.log('totalSuborderRaw', totalSuborderRaw);
      let totalSuborder = 0;
      let suborders = [];
      if (totalSuborderRaw && totalSuborderRaw.rows && totalSuborderRaw.rows.length > 0) {
        totalSuborder = totalSuborderRaw.rows[0].totalCount;

        _pagination.limit = _pagination.limit ? _pagination.limit : totalSuborder;

        let limitSQL = ` LIMIT ${_pagination.skip}, ${_pagination.limit} `;
        const rawResult = await SuborderQuery(rawSelect + fromSQL + _where + limitSQL, []);

        suborders = rawResult.rows;

        await asyncForEach(suborders, async suborder => {

          suborder.items = await SuborderItem.find({
            where: {
              product_suborder_id: suborder.id
            }
          }).populate('product_id')
            .populate('suborderItemVariants', {deletedAt: null});

          await asyncForEach(suborder.items, async item => {

            item.pending = await StatusChange.findOne({
              where: {
                suborder_id: suborder.id,
                status: SUB_ORDER_STATUSES.pending
              }
            }).populate('changed_by');
            item.processing = await StatusChange.findOne({
              where: {
                suborder_id: suborder.id,
                status: SUB_ORDER_STATUSES.processing
              }
            }).populate('changed_by');
            item.prepared = await StatusChange.findOne({
              where: {
                suborder_id: suborder.id,
                status: SUB_ORDER_STATUSES.prepared
              }
            }).populate('changed_by');
            item.departure = await StatusChange.findOne({
              where: {
                suborder_id: suborder.id,
                status: SUB_ORDER_STATUSES.departure
              }
            }).populate('changed_by');
            item.pickup = await StatusChange.findOne({
              where: {
                suborder_id: suborder.id,
                status: SUB_ORDER_STATUSES.pickup
              }
            }).populate('changed_by');
            item.in_the_air = await StatusChange.findOne({
              where: {
                suborder_id: suborder.id,
                status: SUB_ORDER_STATUSES.in_the_air
              }
            }).populate('changed_by');
            item.landed = await StatusChange.findOne({
              where: {
                suborder_id: suborder.id,
                status: SUB_ORDER_STATUSES.landed
              }
            }).populate('changed_by');
            item.arrival_at_warehouse = await StatusChange.findOne({
              where: {
                suborder_id: suborder.id,
                status: SUB_ORDER_STATUSES.arrived_at_warehouse
              }
            }).populate('changed_by');
            item.shipped = await StatusChange.findOne({
              where: {
                suborder_id: suborder.id,
                status: SUB_ORDER_STATUSES.shipped
              }
            }).populate('changed_by');
            item.out_for_delivery = await StatusChange.findOne({
              where: {
                suborder_id: suborder.id,
                status: SUB_ORDER_STATUSES.out_for_delivery
              }
            }).populate('changed_by');
            item.delivered = await StatusChange.findOne({
              where: {
                suborder_id: suborder.id,
                status: SUB_ORDER_STATUSES.delivered
              }
            }).populate('changed_by');
            item.canceled = await StatusChange.findOne({
              where: {
                suborder_id: suborder.id,
                status: SUB_ORDER_STATUSES.canceled
              }
            }).populate('changed_by');
            item.confirmed = await StatusChange.findOne({
              where: {
                suborder_id: suborder.id,
                status: SUB_ORDER_STATUSES.confirmed
              }
            }).populate('changed_by');
            let varientitems = [];
            await asyncForEach(item.suborderItemVariants, async () => {
              varientitems.push(await SuborderItemVariant.findOne({where: {product_suborder_item_id: item.id}})
                .populate('product_suborder_item_id')
                .populate('product_id')
                .populate('warehouse_variant_id')
                .populate('product_variant_id')
              );
            });
            item.suborderItemVariants = varientitems;
            console.log('totalCount', totalSuborderRaw, totalSuborder);

          });
        });
      }

      res.status(200).json({
        success: true,
        total: totalSuborder,
        limit: _pagination.limit,
        skip: _pagination.skip,
        page: _pagination.page,
        message: 'Get all suborder with pagination',
        data: suborders
      });

    } catch (error) {
      console.log('error', error);
      let message = 'Error in getting all suborder with pagination';
      res.status(400).json({
        success: false,
        message,
        error
      });
    }
  },

  //Method called for getting all product suborder
  //Model models/Order.js, models/Suborder.js, models/SuborderItem.js
  getAll: async (req, res) => {
    try {
      let _pagination = pagination(req.query);

      const SuborderQuery = Promise.promisify(Suborder.getDatastore().sendNativeQuery);

      let rawSelect = `
        SELECT
          suborder.id as id,
          suborder.product_order_id,
          suborder.warehouse_id,
          suborder.total_quantity,
          suborder.total_price,
          suborder.delivery_date,
          suborder.courier_status,
          suborder.PR_status,
          suborder.status,
          suborder.changed_by,
          suborder.\`date\`,
          suborder.created_at,
          warehouses.name as warehouse_name,
          warehouses.phone as warehouse_phone,
          CONCAT(users.first_name, ' ', users.last_name) as changedBy
      `;

      let fromSQL = ' FROM product_suborders as suborder  ';
      fromSQL += ' LEFT JOIN warehouses ON warehouses.id = suborder.warehouse_id   LEFT JOIN users ON users.id = suborder.changed_by  ';

      let _where = ' WHERE suborder.deleted_at IS NULL ';

      if (req.query.warehouse_id) {
        _where += ` AND suborder.warehouse_id = ${req.query.warehouse_id}`;
      }

      if (req.query.orderNumberSearchValue) {
        _where += ` AND suborder.product_order_id = '${req.query.orderNumberSearchValue}' `;
      }

      if (req.query.suborderNumberSearchValue) {
        _where += ` AND suborder.id = '${req.query.suborderNumberSearchValue}' `;
      }

      if (req.query.orderNumberSearchValue) {
        _where += ` AND suborder.product_order_id LIKE '%${req.query.orderNumberSearchValue}%' `;
      }

      if (req.query.quantitySearchValue) {
        _where += ` AND suborder.total_quantity LIKE '%${req.query.quantitySearchValue}%' `;
      }
      if (req.query.totalPriceSearchValue) {
        _where += ` AND suborder.total_price LIKE '%${req.query.totalPriceSearchValue}%' `;
      }

      if (req.query.dateRangeValue) {
        try {
          let dateSearchValue = JSON.parse(req.query.dateRangeValue);
          console.log(dateSearchValue);
          if (dateSearchValue.from && dateSearchValue.to) {
            let from = moment(dateSearchValue.from).startOf('day').format('YYYY-MM-DD HH:mm:ss');
            let to = moment(dateSearchValue.to).endOf('day').format('YYYY-MM-DD HH:mm:ss');
            _where += ` AND ( suborder.created_at >= '${from}' AND suborder.created_at <= '${to}') `;
          }

        } catch (er) {
          console.log(er);
        }

      }
      if (req.query.statusSearchValue) {
        // _where.status = {'like': `%${req.query.statusSearchValue}%`}
        _where += ` AND suborder.status = '${req.query.statusSearchValue}' `;
      }
      if (req.query.vendorNameValue) {
        _where += ` AND warehouses.name LIKE '%${req.query.vendorNameValue}%' `;
      }

      if (req.query.PR_status) {
        _where += ` AND suborder.PR_status = '${req.query.PR_status}' `;
      }

      let sort = '';
      if (req.query.sortKey && req.query.sortValue) {
        if (req.query.sortKey === 'order_date') {
          sort += ' ORDER BY suborder.created_at ' + req.query.sortValue;
        } else {
          sort += ' ORDER BY suborder.created_at ' + req.query.sortValue;
        }
      } else {
        sort += ' ORDER BY suborder.created_at DESC ';
      }

      const totalSuborderRaw = await SuborderQuery('SELECT COUNT(*) as totalCount ' + fromSQL + _where, []);

      let totalSuborder = 0;
      let suborders = [];

      if (totalSuborderRaw && totalSuborderRaw.rows && totalSuborderRaw.rows.length > 0) {
        totalSuborder = totalSuborderRaw.rows[0].totalCount;

        _pagination.limit = _pagination.limit ? _pagination.limit : totalSuborder;

        let limitSQL = ` LIMIT ${_pagination.skip}, ${_pagination.limit} `;
        const rawResult = await SuborderQuery(rawSelect + fromSQL + _where + sort + limitSQL, []);

        suborders = rawResult.rows;
      }

      res.status(200).json({
        success: true,
        total: totalSuborder,
        limit: _pagination.limit,
        skip: _pagination.skip,
        page: _pagination.page,
        message: 'Get all suborder with pagination',
        data: suborders
      });

    } catch (error) {
      console.log('error', error);
      let message = 'Error in getting all suborder with pagination';
      res.status(400).json({
        success: false,
        message,
        error
      });
    }
  },
  //Method called for getting all product suborder with PR
  //Model models/Order.js, models/Suborder.js, models/SuborderItem.js
  getsuborderwithpr: async (req, res) => {
    try {

      let _pagination = pagination(req.query);

      /* WHERE condition for .......START.....................*/


      let _where = {};
      _where.deletedAt = null;
      _where.PR_status = 0;

      if (req.query.warehouse_id) {
        _where.warehouse_id = req.query.warehouse_id;
      }

      if (req.query.suborderNumberSearchValue) {
        _where.id = {'like': `%${req.query.suborderNumberSearchValue}%`};
      }

      if (req.query.orderNumberSearchValue) {
        _where.product_order_id = {'like': `%${req.query.orderNumberSearchValue}%`};
      }

      if (req.query.suborderIdValue) {
        _where.warehouse_id = {'like': `%${req.query.suborderIdValue}%`};
      }

      if (req.query.quantitySearchValue) {
        _where.total_quantity = {'like': `%${req.query.quantitySearchValue}%`};
      }

      if (req.query.totalPriceSearchValue) {
        _where.total_price = {'like': `%${req.query.totalPriceSearchValue}%`};
      }

      if (req.query.dateSearchValue) {
        let dateSearchValue = JSON.parse(req.query.dateSearchValue);
        let from = moment((moment(dateSearchValue.from).format('YYYY-MM-DD'))).toISOString();
        let to = moment((moment(dateSearchValue.to).format('YYYY-MM-DD'))).toISOString();
        _where.created_at = {'>=': from, '<=': to};
      }

      if (req.query.statusSearchValue) {
        _where.status = req.query.statusSearchValue;
      }

      /* sort................*/
      let _sort = [];
      if (req.query.sortName) {
        _sort.push({name: req.query.sortName});
      } else {
        _sort.push({createdAt: 'DESC'});
      }

      let totalSuborder = await Suborder.count().where(_where);
      _pagination.limit = _pagination.limit ? _pagination.limit : totalSuborder;
      let suborders = await Suborder.find(
        {
          where: _where,
          limit: _pagination.limit,
          skip: _pagination.skip,
          sort: _sort,
        })
        .populate('warehouse_id');

      await asyncForEach(suborders, async suborder => {
        suborder.order = await Order.findOne({where: {id: suborder.product_order_id.id}})
          .populate('user_id')
          .populate('payment')
          .populate('shipping_address');

        suborder.items = await SuborderItem.find({where: {product_suborder_id: suborder.id}})
          .populate('product_id');

        let totalPrice = 0;
        await asyncForEach(suborder.items, async item => {
          totalPrice += (item.product_id.vendor_price * item.product_quantity);
          let varientitems = [];
          item.pending = await StatusChange.findOne({
            where: {
              suborder_id: suborder.id,
              status: SUB_ORDER_STATUSES.pending
            }
          }).populate('changed_by');
          item.processing = await StatusChange.findOne({
            where: {
              suborder_id: suborder.id,
              status: SUB_ORDER_STATUSES.processing
            }
          }).populate('changed_by');
          item.prepared = await StatusChange.findOne({
            where: {
              suborder_id: suborder.id,
              status: SUB_ORDER_STATUSES.prepared
            }
          }).populate('changed_by');
          item.departure = await StatusChange.findOne({
            where: {
              suborder_id: suborder.id,
              status: SUB_ORDER_STATUSES.departure
            }
          }).populate('changed_by');
          item.pickup = await StatusChange.findOne({
            where: {
              suborder_id: suborder.id,
              status: SUB_ORDER_STATUSES.pickup
            }
          }).populate('changed_by');
          item.in_the_air = await StatusChange.findOne({
            where: {
              suborder_id: suborder.id,
              status: SUB_ORDER_STATUSES.in_the_air
            }
          }).populate('changed_by');
          item.landed = await StatusChange.findOne({
            where: {
              suborder_id: suborder.id,
              status: SUB_ORDER_STATUSES.landed
            }
          }).populate('changed_by');
          item.arrival_at_warehouse = await StatusChange.findOne({
            where: {
              suborder_id: suborder.id,
              status: SUB_ORDER_STATUSES.arrived_at_warehouse
            }
          }).populate('changed_by');
          item.shipped = await StatusChange.findOne({
            where: {
              suborder_id: suborder.id,
              status: SUB_ORDER_STATUSES.shipped
            }
          }).populate('changed_by');
          item.out_for_delivery = await StatusChange.findOne({
            where: {
              suborder_id: suborder.id,
              status: SUB_ORDER_STATUSES.out_for_delivery
            }
          }).populate('changed_by');
          item.delivered = await StatusChange.findOne({
            where: {
              suborder_id: suborder.id,
              status: SUB_ORDER_STATUSES.delivered
            }
          }).populate('changed_by');
          item.canceled = await StatusChange.findOne({
            where: {
              suborder_id: suborder.id,
              status: SUB_ORDER_STATUSES.canceled
            }
          }).populate('changed_by');

          await asyncForEach(item.suborderItemVariants, async varientitem => {
            varientitems.push(await SuborderItemVariant.findOne({where: {product_suborder_item_id: item.id}}).populateAll());
          });

          item.suborderItemVariants = varientitems;
        });
        suborder.total_price = totalPrice;
      });
      res.status(200).json({
        success: true,
        total: totalSuborder,
        limit: _pagination.limit,
        skip: _pagination.skip,
        page: _pagination.page,
        message: 'Get All Suborder with pagination',
        data: suborders
      });
    } catch (error) {
      let message = 'Error in Get All Suborder with pagination';
      res.status(400).json({
        success: false,
        message,
        error
      });
    }
  }
};

