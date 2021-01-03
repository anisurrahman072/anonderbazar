/**
 * SubOrderItemController
 *
 * @description :: Server-side logic for managing order_items
 * @help        :: See http://sailsjs.org/#!/documentation/concepts/Controllers
 */
import {
  Helper,
  asyncForEach,
  initLogPlaceholder,
  pagination
} from "../../libs";
import moment from "moment";

module.exports = {
  // destroy a row
  destroy: function(req, res) {
    SuborderItem.update(
      { id: req.param("id") },
      { deletedAt: new Date() }
    ).exec(function(err, user) {
      if (err) return res.json(err, 400);
      return res.json(user[0]);
    });
  },
  //Method called for getting all product sub order item
  //Model models/Order.js, models/Suborder.js, models/SuborderItem.js
  getSuborderItems: async (req, res) => {
    try {
      initLogPlaceholder(req, "SubOrderItemList");

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
        _suborder_where.status = req.query.status;
      }
      if (req.query.date) {
        _where.date = req.query.date;
      }
      /*sort................*/
      let _sort = {};
      if (req.query.product_total_price) {
        _sort.product_total_price = req.query.product_total_price;
      }
      /*.....SORT END..............................*/

      let totalSuborderItem = await SuborderItem.count().where(_where);
      _pagination.limit = _pagination.limit
        ? _pagination.limit
        : totalSuborderItem;
      let suborderItems = await SuborderItem.find({
        where: _where,
        sort: _sort
      }).populate("product_id", { deletedAt: null });
      let allsuborderItems = await Promise.all(
        suborderItems.map(async item => {
          if (req.query.status) {
            item.product_suborder_id = await Suborder.find({
              deletedAt: null,
              status: req.query.status,
              id: item.product_suborder_id,
            });
          } else {
            item.product_suborder_id = await Suborder.find({
              deletedAt: null,
              id: item.product_suborder_id,
            });
          }

          item.product_id.craftsman_id = await User.find({
            deletedAt: null,
            id: item.product_id.craftsman_id
          });

          item.product_order_id = await Order.find({
            deletedAt: null,
          }).populate("user_id", { deletedAt: null });

          if(item.product_suborder_id.length!=0)
            return item;
        })
      );
      var filteredallsuborderItems = allsuborderItems.filter(function(el) { return el; });

      res.status(200).json({
        success: true,
        total: filteredallsuborderItems.length,
        message: "Get All SubOrderItemLists with pagination",
        data: filteredallsuborderItems
      });
    } catch (error) {
      let message = "Error in Get All SubOrderItemList with pagination";
      res.status(400).json({
        success: false,
        message
      });
    }
  }
};
