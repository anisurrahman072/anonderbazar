/**
 * SslCommerzController.js
 * @help :: See http://sailsjs.org/#!/documentation/concepts/Controllers
 */
const _ = require('lodash');
const SmsService = require('../services/SmsService');
const EmailService = require('../services/EmailService');
const {createOrder} = require('../services/checkout');
const {dhakaZilaId} = require('../../config/softbd');
const {sslWebUrl} = require('../../config/softbd');
const {calcCartTotal} = require('../services/checkout');
const {sslcommerzInstance} = require('../../libs/sslcommerz');

module.exports = {
  //Method called when sslCommerzSuccess from frontend
  sslCommerzSuccess: async function (req, res) {

    console.log('sslcommerzsuccess', req.body);

    if (!(req.body.tran_id && req.query.user_id && req.body.val_id && req.query.billing_address && req.query.shipping_address)) {
      return res.badRequest('Invalid order request');
    }

    let globalConfigs = await GlobalConfigs.findOne({
      deletedAt: null
    });

    if (!globalConfigs) {
      return res.badRequest('Global config was not found!');
    }

    try {
      const sslcommerz = sslcommerzInstance(globalConfigs);
      const validationResponse = await sslcommerz.validate_transaction_order(req.body.val_id);

      console.log('validationResponse', validationResponse);

      if (!(validationResponse && (validationResponse.status === 'VALID' || validationResponse.status === 'VALIDATED'))) {
        return res.badRequest('Invalid order request');
      }

      const numberOfOrderFound = await Order.count().where({
        ssl_transaction_id: req.body.tran_id
      });

      if (numberOfOrderFound > 0) {
        return res.badRequest('Invalid request');
      }

      const paidAmount = parseFloat(validationResponse.amount);

      let user = await User.findOne({id: req.query.user_id, deletedAt: null});

      if (!user) {
        return res.badRequest('User was not found!');
      }

      const {
        orderForMail,
        allCouponCodes,
        order,
        subordersTemp,
        noShippingCharge,
        shippingAddress
      } = await sails.getDatastore()
        .transaction(async (db) => {
          /****** Finalize Order -------------------------- */
          const {
            orderForMail,
            allCouponCodes,
            order,
            subordersTemp,
            noShippingCharge,
            shippingAddress
          } = await createOrder(
            db,
            user, {
              paymentType: 'SSLCommerce',
              paidAmount,
              sslCommerztranId: req.body.tran_id,
              paymentResponse: req.body
            },
            {
              billingAddressId: req.query.billing_address,
              shippingAddressId: req.query.shipping_address
            },
            globalConfigs
          );
          return {
            orderForMail,
            allCouponCodes,
            order,
            subordersTemp,
            noShippingCharge,
            shippingAddress
          };
        });


      try {
        let smsPhone = user.phone;

        if (!noShippingCharge && shippingAddress.phone) {
          smsPhone = shippingAddress.phone;
        }

        if (smsPhone) {
          let smsText = 'anonderbazar.com এ আপনার অর্ডারটি সফলভাবে গৃহীত হয়েছে।';
          if (allCouponCodes && allCouponCodes.length > 0) {
            if (allCouponCodes.length === 1) {
              smsText += ' আপনার স্বাধীনতার ৫০ এর কুপন কোড: ' + allCouponCodes.join(',');
            } else {
              smsText += ' আপনার স্বাধীনতার ৫০ এর কুপন কোডগুলি: ' + allCouponCodes.join(',');
            }
          }
          SmsService.sendingOneSmsToOne([smsPhone], smsText);
        }

      } catch (err) {
        console.log('order sms was not sent!');
        console.log(err);
      }

      try {
        EmailService.orderSubmitMail(orderForMail);
      } catch (err) {
        console.log('order email was not sent!');
        console.log(err);
      }

      let d = Object.assign({}, order);
      d.suborders = subordersTemp;
      res.writeHead(301,
        {Location: sslWebUrl + '/checkout?order=' + order.id}
      );
      res.end();
    } catch (finalError) {
      console.log('finalError', finalError);
      return res.status(400).json({message: 'There was a problem in processing the order.'});
    }

  },
  //Method called when sslCommerzFail fails sends redirectory route
  sslCommerzFailure: function (req, res) {
    res.writeHead(301,
      {Location: sslWebUrl + '/checkout'}
    );
    res.end();
  },
  //Method called when sslCommerzError error sends redirectory route
  sslCommerzError: function (req, res) {
    res.writeHead(301,
      {Location: sslWebUrl + '/checkout'}
    );
    res.end();
  },
};
