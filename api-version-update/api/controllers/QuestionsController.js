/**
 * QuestionsController
 */

const {pagination} = require('../../libs/pagination');


module.exports = {

  /*method called for getting all the products in which a user has asked a question*/
  getAllQuestionedProducts: async (req, res) => {
    try {
      let _pagination = pagination(req.query);

      let rawSQL = `
      SELECT
            product_question_answer.*,
            products.code,
            products.name,
            products.warehouse_id,
            users.first_name,
            users.last_name,
            users.username,
            warehouses.name AS warehouse_name
        FROM
            product_question_answer
        LEFT JOIN products ON product_question_answer.product_id = products.id
        LEFT JOIN users ON product_question_answer.user_id = users.id
        LEFT JOIN warehouses ON products.warehouse_id = warehouses.id
      `;

      let _where = ' WHERE product_question_answer.deleted_at IS NULL ';

      if (req.query.warehouseId) {
        _where += ` AND products.warehouse_id = ${req.query.warehouseId}`;
      }

      let _sort = '';
      if (req.query.sortKey && req.query.sortValue) {
        _sort += ` ORDER BY product.${req.query.sortKey} ${req.query.sortValue} `;
      } else {
        _sort += ` ORDER BY product_question_answer.id DESC `;
      }

      let limit = ` LIMIT ${_pagination.skip}, ${_pagination.limit} `;

      let finalSQL = rawSQL + _where + _sort + limit;

      const questionedProducts = await sails.sendNativeQuery(finalSQL, []);

      return res.status(200).json({
        success: true,
        data: questionedProducts.rows,
        message: 'all questioned products with pagination',
      });
    } catch (error) {
      console.log('error', error);
      let message = 'Error in getting all questioned products';
      res.status(400).json({
        success: false,
        message,
        error
      });
    }
  },

  //Method called for deleting a question data
  //Model models/ProductQuestionAnswer.js
  destroy: async (req, res) => {
    try {
      await ProductQuestionAnswer.updateOne({id: req.param('id')}).set({deletedAt: new Date()});

      return res.json({
        success: true,
        message: 'Question successfully deleted',
      });
    } catch (error) {
      console.log(error);
      res.status(400).json({
        success: false,
        message: 'Failed to delete question',
        error
      });
    }
  },

  findOne: async (req, res) => {
    try {
      let rawSQL = `
      SELECT
            product_question_answer.*,
            products.code,
            products.name,
            products.warehouse_id,
            users.first_name,
            users.last_name,
            users.username,
            warehouses.name AS warehouse_name
        FROM
            product_question_answer
        LEFT JOIN products ON product_question_answer.product_id = products.id
        LEFT JOIN users ON product_question_answer.user_id = users.id
        LEFT JOIN warehouses ON products.warehouse_id = warehouses.id
      `;

      let _where = ` WHERE product_question_answer.deleted_at IS NULL AND product_question_answer.id = ${req.params.id}`;

      if (req.query.warehouseId) {
        _where += ` AND products.warehouse_id = ${req.query.warehouseId}`;
      }


      let finalSQL = rawSQL + _where;

      const questionedProducts = await sails.sendNativeQuery(finalSQL, []);
      const questionedProduct = questionedProducts.rows;

      return res.status(200).json({
        success: true,
        questionedProduct,
        message: 'all questioned products with pagination',
      });
    } catch (error) {
      let message = 'Error in read product';
      return res.status(400).json({
        success: false,
        message,
        error
      });
    }
  }

};
