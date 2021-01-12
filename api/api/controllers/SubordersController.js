import {initLogPlaceholder, pagination, asyncForEach} from "../../libs";
import moment from "moment";

/**
 * SuborderController
 *
 * @description :: Server-side logic for managing suborders
 * @help        :: See http://sailsjs.org/#!/documentation/concepts/Controllers
 */

module.exports = {
  //Method called for getting all product suborder
  //Model models/Order.js, models/Suborder.js, models/SuborderItem.js
  getAll: async (req, res) => {
    try {
      initLogPlaceholder(req, 'Suborders');

      let _pagination = pagination(req.query);

      /* WHERE condition for .......START.....................*/


      let _where = {};
      _where.deletedAt = null;

      if (req.query.warehouse_id) {

        _where.warehouse_id = req.query.warehouse_id;
      }
      if (req.query.suborderNumberSearchValue) {
        _where.id = {'like': `%${req.query.suborderNumberSearchValue}%`}
      }

      if (req.query.orderNumberSearchValue) {
        _where.product_order_id = {'like': `%${req.query.orderNumberSearchValue}%`}
      }

      if (req.query.suborderIdValue) {
        _where.warehouse_id = {'like': `%${req.query.suborderIdValue}%`}
      }

      if (req.query.quantitySearchValue) {
        _where.total_quantity = {'like': `%${req.query.quantitySearchValue}%`}
      }
      if (req.query.totalPriceSearchValue) {
        _where.total_price = {'like': `%${req.query.totalPriceSearchValue}%`}
      }

      if (req.query.dateSearchValue) {
        let dateSearchValue = JSON.parse(req.query.dateSearchValue);
        let from = moment((moment(dateSearchValue.from).format('YYYY-MM-DD'))).toISOString();
        let to = moment((moment(dateSearchValue.to).format('YYYY-MM-DD'))).toISOString();
        _where.created_at = {'>=': from, '<=': to};
      }
      if (req.query.statusSearchValue) {
        _where.status = {'like': `%${req.query.statusSearchValue}%`}
      }


      /* WHERE condition..........END................*/


      /*sort................*/
      let _sort = {};
      if (req.query.sortName) {
        _sort.name = req.query.sortName
      }


      /*.....SORT END..............................*/


      let totalSuborder = await Suborder.count().where(_where);
      _pagination.limit = _pagination.limit ? _pagination.limit : totalSuborder;
      let suborders = await Suborder.find(
        {
          where: _where,
          limit: _pagination.limit,
          skip: _pagination.skip,
          sort: _sort,
        })
        .populateAll();
      await asyncForEach(suborders, async suborder => {
        suborder.order = await Order.findOne({where: {id: suborder.product_order_id.id}}).populateAll();
        suborder.items = await SuborderItem.find({where: {product_suborder_id: suborder.id}}).populateAll();
        await asyncForEach(suborder.items, async item => {
          let varientitems = [];
          item.pending = await StatusChange.findOne({
            where: {
              suborder_id: suborder.id,
              status: 1
            }
          }).populate('changed_by');
          item.processing = await StatusChange.findOne({
            where: {
              suborder_id: suborder.id,
              status: 2
            }
          }).populate('changed_by');
          item.prepared = await StatusChange.findOne({
            where: {
              suborder_id: suborder.id,
              status: 3
            }
          }).populate('changed_by');
          item.departure = await StatusChange.findOne({
            where: {
              suborder_id: suborder.id,
              status: 4
            }
          }).populate('changed_by');
          item.pickup = await StatusChange.findOne({
            where: {
              suborder_id: suborder.id,
              status: 5
            }
          }).populate('changed_by');
          item.in_the_air = await StatusChange.findOne({
            where: {
              suborder_id: suborder.id,
              status: 6
            }
          }).populate('changed_by');
          item.landed = await StatusChange.findOne({
            where: {
              suborder_id: suborder.id,
              status: 7
            }
          }).populate('changed_by');
          item.arrival_at_warehouse = await StatusChange.findOne({
            where: {
              suborder_id: suborder.id,
              status: 8
            }
          }).populate('changed_by');
          item.shipped = await StatusChange.findOne({
            where: {
              suborder_id: suborder.id,
              status: 9
            }
          }).populate('changed_by');
          item.out_for_delivery = await StatusChange.findOne({
            where: {
              suborder_id: suborder.id,
              status: 10
            }
          }).populate('changed_by');
          item.delivered = await StatusChange.findOne({
            where: {
              suborder_id: suborder.id,
              status: 11
            }
          }).populate('changed_by');
          item.canceled = await StatusChange.findOne({
            where: {
              suborder_id: suborder.id,
              status: 12
            }
          }).populate('changed_by');
          await asyncForEach(item.suborderItemVariants, async varientitem => {
            varientitems.push(await SuborderItemVariant.findOne({where: {product_suborder_item_id: item.id}}).populateAll());
          });
          item.suborderItemVariants = varientitems;
        });
      });
      res.status(200).json({
        success: true,
        total: totalSuborder,
        limit: _pagination.limit,
        skip: _pagination.skip,
        page: _pagination.page,
        message: 'Get All Suborder with pagination',
        data: suborders
      })
    } catch
      (error) {
      let message = 'Error in Get All Suborder with pagination';
      res.status(400).json({
        success: false,
        message
      })
    }
  },
  //Method called for getting all product suborder with PR
  //Model models/Order.js, models/Suborder.js, models/SuborderItem.js
  getsuborderwithpr: async (req, res) => {
    try {
      initLogPlaceholder(req, 'Suborders');

      let _pagination = pagination(req.query);

      /* WHERE condition for .......START.....................*/


      let _where = {};
      _where.deletedAt = null;
      _where.PR_status = 0;

      if (req.query.warehouse_id) {
        _where.warehouse_id = req.query.warehouse_id;
      }
      if (req.query.suborderNumberSearchValue) {
        _where.id = {'like': `%${req.query.suborderNumberSearchValue}%`}
      }

      if (req.query.orderNumberSearchValue) {
        _where.product_order_id = {'like': `%${req.query.orderNumberSearchValue}%`}
      }

      if (req.query.suborderIdValue) {
        _where.warehouse_id = {'like': `%${req.query.suborderIdValue}%`}
      }

      if (req.query.quantitySearchValue) {
        _where.total_quantity = {'like': `%${req.query.quantitySearchValue}%`}
      }
      if (req.query.totalPriceSearchValue) {
        _where.total_price = {'like': `%${req.query.totalPriceSearchValue}%`}
      }

      if (req.query.dateSearchValue) {
        let dateSearchValue = JSON.parse(req.query.dateSearchValue);
        let from = moment((moment(dateSearchValue.from).format('YYYY-MM-DD'))).toISOString();
        let to = moment((moment(dateSearchValue.to).format('YYYY-MM-DD'))).toISOString();
        _where.created_at = {'>=': from, '<=': to};
      }
      if (req.query.statusSearchValue) {
        _where.status = {'like': `%${req.query.statusSearchValue}%`}
      }


      /* WHERE condition..........END................*/


      /*sort................*/
      let _sort = {};
      if (req.query.sortName) {
        _sort.name = req.query.sortName
      }


      /*.....SORT END..............................*/


      let totalSuborder = await Suborder.count().where(_where);
      _pagination.limit = _pagination.limit ? _pagination.limit : totalSuborder;
      let suborders = await Suborder.find(
        {
          where: _where,
          limit: _pagination.limit,
          skip: _pagination.skip,
          sort: _sort,
        })
        .populateAll();
      await asyncForEach(suborders, async suborder => {
        suborder.order = await Order.findOne({where: {id: suborder.product_order_id.id}}).populateAll();
        suborder.items = await SuborderItem.find({where: {product_suborder_id: suborder.id}}).populateAll();

        let totalPrice = 0;
        await asyncForEach(suborder.items, async item => {
          totalPrice += (item.product_id.vendor_price * item.product_quantity)
          let varientitems = [];
          item.pending = await StatusChange.findOne({
            where: {
              suborder_id: suborder.id,
              status: 1
            }
          }).populate('changed_by');
          item.processing = await StatusChange.findOne({
            where: {
              suborder_id: suborder.id,
              status: 2
            }
          }).populate('changed_by');
          item.prepared = await StatusChange.findOne({
            where: {
              suborder_id: suborder.id,
              status: 3
            }
          }).populate('changed_by');
          item.departure = await StatusChange.findOne({
            where: {
              suborder_id: suborder.id,
              status: 4
            }
          }).populate('changed_by');
          item.pickup = await StatusChange.findOne({
            where: {
              suborder_id: suborder.id,
              status: 5
            }
          }).populate('changed_by');
          item.in_the_air = await StatusChange.findOne({
            where: {
              suborder_id: suborder.id,
              status: 6
            }
          }).populate('changed_by');
          item.landed = await StatusChange.findOne({
            where: {
              suborder_id: suborder.id,
              status: 7
            }
          }).populate('changed_by');
          item.arrival_at_warehouse = await StatusChange.findOne({
            where: {
              suborder_id: suborder.id,
              status: 8
            }
          }).populate('changed_by');
          item.shipped = await StatusChange.findOne({
            where: {
              suborder_id: suborder.id,
              status: 9
            }
          }).populate('changed_by');
          item.out_for_delivery = await StatusChange.findOne({
            where: {
              suborder_id: suborder.id,
              status: 10
            }
          }).populate('changed_by');
          item.delivered = await StatusChange.findOne({
            where: {
              suborder_id: suborder.id,
              status: 11
            }
          }).populate('changed_by');
          item.canceled = await StatusChange.findOne({
            where: {
              suborder_id: suborder.id,
              status: 12
            }
          }).populate('changed_by');

          await asyncForEach(item.suborderItemVariants, async varientitem => {
            varientitems.push(await SuborderItemVariant.findOne({where: {product_suborder_item_id: item.id}}).populateAll());
          });

          item.suborderItemVariants = varientitems;
        });
        suborder.total_price = totalPrice
      });
      res.status(200).json({
        success: true,
        total: totalSuborder,
        limit: _pagination.limit,
        skip: _pagination.skip,
        page: _pagination.page,
        message: 'Get All Suborder with pagination',
        data: suborders
      })
    } catch
      (error) {
      let message = 'Error in Get All Suborder with pagination';
      res.status(400).json({
        success: false,
        message
      })
    }
  }
};

