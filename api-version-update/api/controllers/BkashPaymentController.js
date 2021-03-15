/**
 * BkashPaymentController
 *
 * @description :: Server-side logic for managing users
 * @help        :: See http://sailsjs.org/#!/documentation/concepts/Controllers
 */
const {bKash} = require('../../config/softbd');
const fetch = require('node-fetch');
const {bKashModeConfigKey} = require('../../libs/helper');
module.exports = {

  grandToken: async (req, res) => {
    let modeConfigKey = bKashModeConfigKey();

    const headers = {
      'Content-Type': 'application/json',
      Accept: 'application/json',
      username: bKash[modeConfigKey].username,
      password: bKash[modeConfigKey].password,
    };

    const postBody = {
      app_key: bKash[modeConfigKey].app_key,
      app_secret: bKash[modeConfigKey].app_secret,
    };

    const url = bKash[modeConfigKey].token_grant_url;

    const options = {
      method: 'POST',
      headers: headers,
      body: JSON.stringify(postBody)
    };

    try {
      let tokenRes = await fetch(url, options);
      tokenRes = await tokenRes.json();
      console.log(tokenRes);
      return res.status(200).json(tokenRes);
    } catch (error) {
      console.log(error);
      return res.status(400).json(error);
    }

  },
  createAgreement: async (req, res) => {
    if (!req.headers.id_token) {
      return res.status(422).json({
        message: 'Invalid Request'
      });
    }
    let modeConfigKey = bKashModeConfigKey();
    const headers = {
      'Content-Type': 'application/json',
      Accept: 'application/json',
      Authorization: req.headers.id_token,
      'X-APP-Key': bKash[modeConfigKey].app_key,
    };

    const postBody = {
      mode: '0000',
      'payerReference': req.query.wallet_no,
      'callbackURL': 'http://api.test.anonderbazar.com/agreement-callback/' + req.token.userInfo.id,
    };

    const url = bKash[modeConfigKey].agreement_create;
    try {
      const options = {
        method: 'POST',
        headers: headers,
        body: JSON.stringify(postBody)
      };

      let tokenRes = await fetch(url, options);
      tokenRes = await tokenRes.json();

      if(tokenRes.statusMessage === 'Successful' && tokenRes.agreementStatus === 'Initiated'){
        const bkashCustomerWallet = await BkashCustomerWallet.create({
          user_id: req.token.userInfo.id,
          wallet_no: tokenRes.payerReference,
          payment_id: tokenRes.paymentID,
          full_response: JSON.stringify({id_token: req.headers.id_token, ...tokenRes})
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
    console.log(req, res);
    let modeConfigKey = bKashModeConfigKey();
    const headers = {
      'Content-Type': 'application/json',
      Accept: 'application/json',
      'X-APP-Key': bKash[modeConfigKey].app_key,
    };

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
        await BkashCustomerWallet.updateOne({
          id: userWallet.id
        }).set({
          row_status: 2
        });

        const postBody = {
          'paymentID': req.query.paymentID,
        };

        const url = bKash[modeConfigKey].agreement_execute;
        headers.Authorization = userWallet.full_response.id_token;

        const options = {
          method: 'POST',
          headers: headers,
          body: JSON.stringify(postBody)
        };

        let tokenRes = await fetch(url, options);
        tokenRes = await tokenRes.json();

        console.log(tokenRes);

        if (tokenRes.agreementStatus === 'Completed' && tokenRes.statusMessage === 'Successful') {
          await BkashCustomerWallet.updateOne({
            id: userWallet.id
          }).set({
            row_status: 3,
            payment_id: tokenRes.paymentID,
            agreement_id: tokenRes.agreementID,
            full_response: JSON.stringify({id_token: userWallet.full_response.id_token, ...tokenRes})
          });
        }

        return res.status(200).json(tokenRes);
      }

      await BkashCustomerWallet.updateOne({
        id: userWallet.id
      }).set({
        row_status: 99
      });

      return res.status(200).json({
        status: 'rejected'
      });

    } catch (error) {
      console.log(error);
      return res.status(400).json(error);
    }
  }
};
