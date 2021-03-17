/**
 * BkashPaymentController
 *
 * @description :: Server-side logic for managing users
 * @help        :: See http://sailsjs.org/#!/documentation/concepts/Controllers
 */

const SmsService = require('../services/SmsService');
const EmailService = require('../services/EmailService');
const {sslWebUrl} = require('../../config/softbd');
const {createOrder} = require('../services/checkout');
const {
  bKashGrandToken,
  bKashCreateAgreement,
  bKashExecutePayment,
  bKashExecuteAgreement
} = require('../services/bKash');

module.exports = {

  authUserWallets: async (req, res) => {
    try {
      const authUser = req.token.userInfo;
      const userWallets = await BkashCustomerWallet.find({
        user_id: authUser.id,
        row_status: 3
      });
      return res.status(200).json(userWallets);
    } catch (error) {
      console.log(error);
      return res.status(400).json(error);
    }
  },
  grandToken: async (req, res) => {

    try {
      let tokenRes = await bKashGrandToken();
      tokenRes = await tokenRes.json();
      console.log(tokenRes);
      return res.status(200).json(tokenRes);
    } catch (error) {
      console.log(error);
      return res.status(400).json(error);
    }

  },
  createAgreement: async (req, res) => {

    console.log('createAgreement', req.query);
    if (!req.query.id_token) {
      return res.status(422).json({
        message: 'Invalid Request'
      });
    }

    try {

      let tokenRes = await bKashCreateAgreement(req.query.id_token, req.token.userInfo.id, req.query.wallet_no);

      if (tokenRes.statusMessage === 'Successful' && tokenRes.agreementStatus === 'Initiated') {
        const bkashCustomerWallet = await BkashCustomerWallet.create({
          user_id: req.token.userInfo.id,
          wallet_no: tokenRes.payerReference,
          payment_id: tokenRes.paymentID,
          full_response: JSON.stringify({id_token: req.query.id_token, ...tokenRes})
        }).fetch();
        console.log(tokenRes);
        return res.status(200).json({
          tokenRes,
          bkashCustomerWallet
        });
      }

      return res.status(422).json(tokenRes);

    } catch (error) {
      console.log(error);
      return res.status(400).json(error);
    }
  },
  agreementCallback: async (req, res) => {
    console.log('agreementCallback');
    console.log(req.query);

    try {
      const userWallets = await BkashCustomerWallet.find({
        user_id: req.param('id'),
        payment_id: req.query.paymentID,
        row_status: 1
      });

      if (!(userWallets && userWallets.length === 1)) {
        return res.status(422).json({
          message: 'Invalid Request'
        });
      }

      const userWallet = userWallets[0];

      if (req.query.status === 'success') {

        userWallet.full_response = JSON.parse(userWallet.full_response);

        await BkashCustomerWallet.updateOne({
          id: userWallet.id
        })
          .set({
            row_status: 2
          });

        const bKashResponse = await bKashExecuteAgreement(userWallet.full_response.id_token, req.query.paymentID);

        console.log('bKashResponse', bKashResponse);

        if (bKashResponse.agreementStatus === 'Completed' && bKashResponse.statusMessage === 'Successful') {
          await BkashCustomerWallet.updateOne({
            id: userWallet.id
          }).set({
            row_status: 3,
            payment_id: bKashResponse.paymentID,
            agreement_id: bKashResponse.agreementID,
            full_response: JSON.stringify({id_token: userWallet.full_response.id_token, ...bKashResponse})
          });
        }

        res.writeHead(301, {
          Location: 'http://test.anonderbazar.com/profile/bkash-accounts'
        });

        res.end();
        return;
      }

      await BkashCustomerWallet.updateOne({
        id: userWallet.id
      }).set({
        row_status: 99
      });

      res.writeHead(301, {
        Location: 'http://test.anonderbazar.com/profile/bkash-accounts'
      });

      res.end();

    } catch (error) {
      console.log(error);
      res.writeHead(301, {
        Location: 'http://test.anonderbazar.com/profile/bkash-accounts'
      });
      res.end();
    }
  },
  paymentCallback: async (req, res) => {

    if (!(req.param('userId') && req.param('paymentTransId') && req.query.paymentID && req.query.status)) {
      return res.badRequest('Invalid order request');
    }

    try {
      let globalConfigs = await GlobalConfigs.findOne({
        deletedAt: null
      });

      if (!globalConfigs) {
        return res.status(422).json({message: 'Global config was not found!'});
      }

      let customer = await User.findOne({id: req.param('userId'), deletedAt: null});

      if (!customer) {
        return res.status(422).json({message: 'Customer was not found!'});
      }

      const transactionLog = await PaymentTransactionLog.findOne({
        id: req.param('paymentTransId'),
        user_id: req.param('userId'),
        deletedAt: null
      });

      // eslint-disable-next-line eqeqeq
      if (!(transactionLog && transactionLog.id && transactionLog.status == 2)) {
        return res.status(422).json({message: 'Invalid order request!'});
      }

      const transactionDetails = JSON.parse(transactionLog.details);

      if (!(transactionDetails.id_token && transactionDetails.bKashResponse && transactionDetails.payerReference && transactionDetails.shippingAddressId && transactionDetails.billingAddressId)) {
        return res.status(422).json({message: 'Invalid order request!'});
      }

      if (req.query.status === 'success') {
        const bKashResponse = await bKashExecutePayment(transactionDetails.id_token, {
          paymentID: req.query.paymentID
        });

        console.log('bKashResponse', bKashResponse);

        if (bKashResponse && bKashResponse.statusMessage === 'Successful' && bKashResponse.transactionStatus === 'Completed') {

          await PaymentTransactionLog.updateOne({
            id: transactionLog.id
          }).set({
            status: 3,
            details: JSON.stringify({
              id_token: transactionDetails.id_token,
              payerReference: bKashResponse.payerReference,
              agreement_id: bKashResponse.agreementID,
              billingAddressId: transactionDetails.billingAddressId,
              shippingAddressId: transactionDetails.shippingAddressId,
              bKashResponse
            })
          });

          const {
            orderForMail,
            allCouponCodes,
            order,
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
                customer, {
                  paymentType: 'bKash',
                  paidAmount: parseFloat(bKashResponse.amount),
                  sslCommerztranId: null,
                  paymentResponse: bKashResponse
                },
                {
                  billingAddressId: transactionDetails.billingAddressId,
                  shippingAddressId: transactionDetails.shippingAddressId
                },
                globalConfigs
              );

              await PaymentTransactionLog.updateOne({
                id: transactionLog.id
              }).set({
                order_id: order.id,
              }).usingConnection(db);

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

          res.writeHead(301,
            {Location: sslWebUrl + '/checkout?order=' + order.id}
          );
          res.end();
          return;
        }

        await PaymentTransactionLog.updateOne({
          id: transactionLog.id
        }).set({
          details: JSON.stringify({
            id_token: transactionDetails.id_token,
            payerReference: transactionDetails.payerReference,
            billingAddressId: transactionDetails.billingAddressId,
            shippingAddressId: transactionDetails.shippingAddressId,
            bKashResponse
          })
        });

        return res.status(422).json({message: 'There was a problem in processing the order.'});

      }

      await PaymentTransactionLog.updateOne({
        id: transactionLog.id
      }).set({
        status: 99,
        details: JSON.stringify({
          id_token: transactionDetails.id_token,
          payerReference: transactionDetails.payerReference,
          billingAddressId: transactionDetails.billingAddressId,
          shippingAddressId: transactionDetails.shippingAddressId,
          bKashResponse: req.query
        })
      });

      return res.status(422).json({message: 'There was a problem in processing the order.'});

    } catch (error) {
      console.log(error);
      return res.status(400).json({message: 'There was a problem in processing the order.'});
    }

  }
};
