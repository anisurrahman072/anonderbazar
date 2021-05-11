/**
 * MissingOrderController
 *
 * @description :: Server-side actions for handling incoming requests.
 * @help        :: See https://sailsjs.com/docs/concepts/actions
 */
const {sslcommerzInstance} = require('../../libs/sslcommerz');
const _ = require('lodash');

module.exports = {
  findSSLTransaction: async (req, res) => {
    try {
      console.log('req asce');

      let usernameTmp = req.body.username;
      if (usernameTmp.charAt(0) === '+') {
        usernameTmp = usernameTmp.substr(1);
      } else if (usernameTmp.charAt(0) === '0') {
        usernameTmp = '88' + usernameTmp;
      } else if (!(usernameTmp.charAt(0) === '8' || usernameTmp.charAt(1) === '8')) {
        usernameTmp = '0' + usernameTmp;
      }
      console.log('-----------------------------------------');
      console.log(req.body.username, usernameTmp, req.body.ssl_transaction_id);

      const users = await User.find({
        username: usernameTmp,
        deletedAt: null
      });

      console.log(users);
      if (!(users && users.length > 0)) {
        return res.status(400).json({
          success: false,
          message: 'User not found!'
        });
      }

      const customer = users[0];

      let shippingAddress = await PaymentAddress.find({
        user_id: customer.id,
        deletedAt: null
      }).populate('division_id')
        .populate('zila_id')
        .populate('upazila_id');

      if(_.isUndefined(shippingAddress) || _.isEmpty(shippingAddress)){
        return res.status(400).json({
          success: false,
          message: 'No shipping address found for the user!'
        });
      }

      let globalConfigs = await GlobalConfigs.findOne({
        deletedAt: null
      });

      console.log('tttt', globalConfigs);
      const sslcommerz = sslcommerzInstance(globalConfigs);
      console.log('qqqqq', sslcommerz);

      // const validationResponse = await sslcommerz.validate_transaction_order(req.body.val_id);
      const transResponse = await sslcommerz.transaction_status_id(req.body.ssl_transaction_id);

      console.log('transResponse: ',transResponse);

      if (transResponse && transResponse.no_of_trans_found) {
        const noOfTrans = parseInt(transResponse.no_of_trans_found, 10);
        if (!(noOfTrans > 0 && transResponse.element && transResponse.element.length > 0 &&
          (transResponse.element[0].status &&
            (transResponse.element[0].status === 'VALID' || transResponse.element[0].status === 'VALIDATED')))) {
          return res.status(400).json({
            success: false,
            message: 'Invalid SSL Commerz Transaction ID'
          });
        }
      } else {
        return res.status(400).json({
          success: false,
          message: 'Invalid SSL Commerz Transaction ID'
        });
      }

      const sslCommerzResponse = transResponse.element[0];

      const numberOfOrderFound = await Order.count().where({
        ssl_transaction_id: req.body.ssl_transaction_id
      });

      if (numberOfOrderFound > 0) {
        return res.status(400).json({
          success: false,
          message: 'This SSL Commerz Transaction ID is already exists in database.'
        });
      }

      return res.status(200).json({
        success: true,
        message: 'Successfully found the transaction details from SSL commerz',
        data: sslCommerzResponse,
        shippingAddress,
        customer
      });

    }
    catch (error){
      return res.status(400).json({
        success: false,
        message: 'Error occurred while fetching SSL Transaction ID info',
        error
      });
    }
  },

  generateMissingOrders: async (req, res) => {
    try {
      let allProducts = JSON.parse(req.body.products);
      console.log('wwww', allProducts);
      let totalQty = allProducts.length;

      const carts = await Cart.update({user_id: req.body.customerId}, {deletedAt: new Date()}).fetch();
      const cartIds = carts.map((cart) => cart.id);
    }
    catch (error){

    }
  }

};

