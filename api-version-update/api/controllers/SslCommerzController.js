/**
 * SslCommerzController.js
 * @help :: See http://sailsjs.org/#!/documentation/concepts/Controllers
 */
const SmsService = require('../services/SmsService');
const EmailService = require('../services/EmailService');
const {createOrder} = require('../services/checkout');
const {sslWebUrl} = require('../../config/softbd');
const {sslcommerzInstance} = require('../../libs/sslcommerz');

module.exports = {
  //Method called when sslCommerzSuccess from frontend
  sslCommerzSuccess: async function (req, res) {

    console.log('################ sslcommerz success', req.body);

    if (!(req.body.tran_id && req.query.user_id && req.body.val_id && req.query.billing_address && req.query.shipping_address)) {

      res.writeHead(301,
        {
          Location: sslWebUrl + '/checkout?bKashError=' + encodeURIComponent('Invalid Request')
        }
      );
      res.end();
      return;
    }

    let globalConfigs = await GlobalConfigs.findOne({
      deletedAt: null
    });

    if (!globalConfigs) {
      res.writeHead(301,
        {
          Location: sslWebUrl + '/checkout?bKashError=' + encodeURIComponent('Global config was not found!')
        }
      );
      res.end();
      return;
    }

    try {
      const sslcommerz = sslcommerzInstance(globalConfigs);
      const validationResponse = await sslcommerz.validate_transaction_order(req.body.val_id);

      console.log('validationResponse', validationResponse);

      if (!(validationResponse && (validationResponse.status === 'VALID' || validationResponse.status === 'VALIDATED'))) {

        res.writeHead(301,
          {
            Location: sslWebUrl + '/checkout?bKashError=' + encodeURIComponent('SSL Commerz Payment Validation Failed!')
          }
        );
        res.end();
        return;
      }

      const numberOfOrderFound = await Order.count().where({
        ssl_transaction_id: req.body.tran_id
      });

      if (numberOfOrderFound > 0) {
        res.writeHead(301,
          {
            Location: sslWebUrl + '/checkout?bKashError=' + encodeURIComponent('SSL Commerz Payment Validation Failed!')
          }
        );
        res.end();
        return;
      }

      const paidAmount = parseFloat(validationResponse.amount);

      let user = await User.findOne({id: req.query.user_id, deletedAt: null});

      if (!user) {

        res.writeHead(301,
          {
            Location: sslWebUrl + '/checkout?bKashError=' + encodeURIComponent('Invalid Request! Customer was not found!')
          }
        );
        res.end();
        return;
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
          let smsText = `anonderbazar.com এ আপনার অর্ডারটি সফলভাবে গৃহীত হয়েছে। অর্ডার নাম্বার: ${order.id}`;
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
        {
          Location: sslWebUrl + '/checkout?order=' + order.id
        }
      );
      res.end();
    } catch (finalError) {
      console.log('finalError', finalError);

      res.writeHead(301,
        {
          Location: sslWebUrl + '/checkout?bKashError=' + encodeURIComponent('Sorry! There was a problem in processing the order.')
        }
      );
      res.end();
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
