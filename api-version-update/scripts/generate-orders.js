const {sslcommerzInstance} = require('../libs/sslcommerz');
const _ = require('lodash');
const axios = require('axios');
const {makeUniqueId} = require('../libs/helper');
const {adminPaymentAddressId, sslCommerzSMSConfig} = require('../config/softbd');

module.exports = {

  friendlyName: 'Generate orders',

  description: 'Generating Missing Orders',

  inputs: {
    username: {
      description: 'Username of the customer',
      type: 'string',
    },
    ssl_transaction_id: {
      description: 'Transaction ID of SSL',
      type: 'string',
    }
  },

  fn: async function ({username, ssl_transaction_id}, exits) {

    sails.log('Running custom shell script... (`sails run generate-orders`)');

    let usernameTmp = username;
    if (usernameTmp.charAt(0) === '+') {
      usernameTmp = usernameTmp.substr(1);
    } else if (usernameTmp.charAt(0) === '0') {
      usernameTmp = '88' + usernameTmp;
    } else if (!(usernameTmp.charAt(0) === '8' || usernameTmp.charAt(1) === '8')) {
      usernameTmp = '0' + usernameTmp;
    }
    console.log('-----------------------------------------');
    console.log(username, usernameTmp, ssl_transaction_id);

    const users = await User.find({
      username: usernameTmp,
      deletedAt: null
    });

    console.log(users);
    if (!(users && users.length > 0)) {
      return exits.error(new Error('User not found!'));
    }

    const customer = users[0];

    let globalConfigs = await GlobalConfigs.findOne({
      deletedAt: null
    });

    const sslcommerz = sslcommerzInstance(globalConfigs);
    // const validationResponse = await sslcommerz.validate_transaction_order(req.body.val_id);
    const transResponse = await sslcommerz.transaction_status_id(ssl_transaction_id);

    console.log(transResponse);

    if (transResponse && transResponse.no_of_trans_found) {
      const noOfTrans = parseInt(transResponse.no_of_trans_found, 10);
      if (!(noOfTrans > 0 && transResponse.element && transResponse.element.length > 0 &&
        (transResponse.element[0].status &&
          (transResponse.element[0].status === 'VALID' || transResponse.element[0].status === 'VALIDATED')))) {
        return exits.error(new Error('Invalid SSL Commerz Transaction ID'));
      }
    } else {
      return exits.error(new Error('Invalid SSL Commerz Transaction ID'));
    }

    const sslCommerzResponse = transResponse.element[0];

    const numberOfOrderFound = await Order.count().where({
      ssl_transaction_id: ssl_transaction_id
    });

    if (numberOfOrderFound > 0) {
      return exits.error(new Error('This SSL Commerz Transaction ID is already exists in database.'));
    }

    const paidAmount = parseFloat(sslCommerzResponse.amount);

    const totalQty = paidAmount / 50.0;
    const paymentAddresses = PaymentAddress.find({
      user_id: customer.id,
      deletedAt: null
    });

    let addressId = adminPaymentAddressId;
    if (paymentAddresses && paymentAddresses.length > 0) {
      addressId = paymentAddresses[0].id;
    }

    const product = await Product.findOne({
      id: 6016
    });

    const productPrice = product.promotion ? parseFloat(product.promo_price) : parseFloat(product.price);

    try {
      const {
        order,
        allCouponCodes,
      } = await sails.getDatastore()
        .transaction(async (db) => {
          const carts = await Cart.update({user_id: customer.id}, {deletedAt: new Date()}).fetch().usingConnection(db);
          const cartIds = carts.map((cart) => cart.id);

          if (cartIds && cartIds.length > 0) {
            await CartItem.update({cart_id: cartIds}, {deletedAt: new Date()}).usingConnection(db);
          }

          let cart = await Cart.create({
            user_id: customer.id,
            ip_address: '',
            total_quantity: totalQty,
            total_price: productPrice * totalQty,
            status: 1
          }).fetch().usingConnection(db);

          const cartItem = await CartItem.create({
            cart_id: cart.id,
            product_id: 6016,
            product_unit_price: productPrice,
            product_quantity: totalQty,
            product_total_price: productPrice * totalQty,
          }).fetch().usingConnection(db);

          const order = await Order.create({
            user_id: customer.id,
            cart_id: cart.id,
            total_price: productPrice * totalQty,
            total_quantity: totalQty,
            billing_address: addressId,
            shipping_address: addressId,
            ssl_transaction_id: ssl_transaction_id,
            status: 1,
            courier_charge: 0,
            courier_status: 0,
          }).fetch().usingConnection(db);

          const suborder = await Suborder.create({
            product_order_id: order.id,
            warehouse_id: product.warehouse_id,
            total_price: productPrice * totalQty,
            total_quantity: totalQty,
            status: 1
          }).fetch().usingConnection(db);

          const suborderItem = await SuborderItem.create({
            product_suborder_id: suborder.id,
            product_id: cartItem.product_id,
            warehouse_id: product.warehouse_id,
            product_quantity: totalQty,
            product_total_price: productPrice * totalQty,
            status: 1
          }).fetch().usingConnection(db);

          await Payment.create({
            user_id: customer.id,
            order_id: order.id,
            suborder_id: suborder.id,
            payment_type: 'SSLCommerce',
            payment_amount: productPrice * totalQty,
            details: JSON.stringify(sslCommerzResponse),
            transection_key: ssl_transaction_id,
            payment_date: sslCommerzResponse.tran_date,
            status: 1
          }).usingConnection(db);

          await Cart.updateOne({id: cart.id}).set({deletedAt: new Date()}).usingConnection(db);
          await CartItem.updateOne({id: cartItem.id}).set({deletedAt: new Date()}).usingConnection(db);

          const allGeneratedCouponCodes = [];
          for (let t = 0; t < totalQty; t++) {
            allGeneratedCouponCodes.push({
              product_id: product.id,
              user_id: customer.id,
              order_id: order.id,
              suborder_id: suborder.id,
              suborder_item_id: suborderItem.id
            });
          }
          let allCouponCodes = [];
          if (allGeneratedCouponCodes && allGeneratedCouponCodes.length > 0) {
            const createdCouponCodes = await ProductPurchasedCouponCode.createEach(allGeneratedCouponCodes).fetch().usingConnection(db);
            allCouponCodes = createdCouponCodes.map((couponCode) => '1' + _.padStart(couponCode.id, 6, '0'));
          }
          return {
            allCouponCodes,
            order
          };
        });

      try {

        let smsPhone = customer.phone;
        if (smsPhone) {
          let smsText = 'anonderbazar.com এ';
          if (allCouponCodes && allCouponCodes.length > 0) {
            if (allCouponCodes.length === 1) {
              smsText += ' আপনার স্বাধীনতার ৫০ এর কুপন কোড: ' + allCouponCodes.join(',');
            } else {
              smsText += ' আপনার স্বাধীনতার ৫০ এর কুপন কোডগুলি: ' + allCouponCodes.join(',');
            }
          }
          console.log('Created Order ID: ', order.id);

          let smsSendPhone = '';
          if (smsPhone.charAt(0) === '+') {
            smsSendPhone = smsPhone.substr(1);
          } else if (smsPhone.charAt(0) === '0') {
            smsSendPhone = '88' + smsPhone;
          } else {
            smsSendPhone = smsPhone;
          }

          const csmsId = makeUniqueId(18);

          const payload = {
            ...sslCommerzSMSConfig,
            'msisdn': smsSendPhone,
            'sms': smsText,
            'csms_id': csmsId
          };

          try {
            const smsResponse = await axios.post('https://smsplus.sslwireless.com/api/v3/send-sms', payload, {
              'Content-Type': 'application/json',
              'Accept': 'application/json'
            });

            console.log(smsResponse.data);
            console.log(smsText);

          } catch (e) {
            if (e.data) {
              console.log(e.data);
            } else {
              console.log(e);
            }
          }
        }

      } catch (err) {
        console.log('order sms was not sent!');
        console.log(err);
      }
      return exits.success();
    } catch (err) {
      return exits.error(err);
    }
  }

};

