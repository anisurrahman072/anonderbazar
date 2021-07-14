const commonUrl = 'https://anonderbazar.com';
const senderName = 'Anonder Bazar';
const {INVESTOR_EMAIL_ADDRESS} = require('../../libs/constants');
module.exports = {
  sendPasswordResetMailUpdated: function (obj, password) {
    sails.hooks.email.send(
      'restPasswordEmailUpdated',
      {
        recipientName: obj.first_name,
        senderName: senderName,
        user: obj,
        password: password,
        commonUrl: commonUrl,
      },
      {
        to: obj.email,
        subject: 'Forget Password Request - Anonder Bazar'
      },
      (err) => {
        console.log('Sending Password Reset Email: ', err || 'It worked!');
      }
    );
  },
  sendPasswordResetMail: function (obj, password) {
    sails.hooks.email.send(
      'restPasswordEmail',
      {
        recipientName: obj[0].first_name,
        senderName: senderName,
        user: obj,
        password: password,
        commonUrl: commonUrl,
      },
      {
        to: obj[0].email,
        subject: 'Welcome to Anonder Bazar'
      },
      (err) => {
        console.log('Sending Password Reset Email: ', err || 'It worked!');
      }
    );
  },
  sendWelcomeMailCustomer: function (obj) {
    sails.hooks.email.send(
      'registrationEmail',
      {
        recipientName: obj.first_name,
        senderName: senderName,
        user: obj,
        commonUrl: commonUrl,
      },
      {
        to: obj.email,
        subject: 'Welcome to Anonder Bazar'
      },
      (err) => {
        console.log(err || 'It worked!');
      }
    );
  },
  sendWelcomeMailVendor: function (obj) {
    sails.hooks.email.send(
      'vendorRegistrationEmail',
      {
        recipientName: obj[0].user_id.first_name,
        senderName: senderName,
        user: obj,
        commonUrl: commonUrl,
      },
      {
        to: obj[0].user_id.email,
        subject: 'Welcome to Anonder Bazar'
      },
      (err) => {
        console.log(err || 'It worked!');
      }
    );
  },
  orderSubmitMail: function (obj, emailTo = null) {
    let receiverEmail = emailTo;
    if (!receiverEmail && obj.user_id.email) {
      receiverEmail = obj.user_id.email;
    }
    if (!receiverEmail) {
      return;
    }
    sails.hooks.email.send(
      'orderSubmitEmail',
      {
        recipientName: obj.user_id.first_name,
        senderName: senderName,
        orderDetail: obj,
        commonUrl: commonUrl,
      },
      {
        to: receiverEmail,
        subject: 'Your Order has been Placed (#' + obj.id + ')'
      },
      (err) => {
        console.log(err || 'It worked!');
      }
    );
  },

  investorMail: function (obj){
    let receiverEmail = INVESTOR_EMAIL_ADDRESS;
    if (!receiverEmail) {
      return;
    }
    sails.hooks.email.send(
      'investorMail',
      {
        recipientName: senderName,
        senderName: senderName,
        investorDetail: obj,
        commonUrl: commonUrl,
      },
      {
        to: receiverEmail,
        subject: `Investor registration completed successfully`
      },
      (err) => {
        console.log(err || 'It worked!');
      }
    );
  },

  orderCompletedMail: function (obj) {
    sails.hooks.email.send(
      'orderCompleteEmail',
      {
        recipientName: obj[0].user_id.first_name,
        senderName: senderName,
        orderDetail: obj,
        commonUrl: commonUrl,
      },
      {
        to: obj[0].user_id.email,
        subject: 'Your Order has been Delivered (#' + obj[0].id + ')'
      },
      (err) => {
        console.log(err || 'It worked!');
      }
    );
  },
  orderStatusdMail: function (obj, status_text) {
    sails.hooks.email.send(
      'orderStatusEmail',
      {
        recipientName: obj[0].user_id.first_name,
        senderName: senderName,
        orderDetail: obj,
        status_Text: status_text,
        commonUrl: commonUrl,
      },
      {
        to: obj[0].user_id.email,
        subject: 'Your Order has been ' + status_text + ' (#' + obj[0].id + ')'
      },
      (err) => {
        console.log(err || 'It worked!');
      }
    );
  },
  orderStatusdMailVendor: function (obj, warehouse, status_text) {
    sails.hooks.email.send(
      'orderStatusEmail',
      {
        recipientName: warehouse[0].first_name,
        senderName: senderName,
        orderDetail: obj,
        status_Text: status_text,
        commonUrl: commonUrl,
      },
      {
        to: warehouse[0].email,
        subject: 'Your Order has been ' + status_text + ' (#' + obj[0].id + ')'
      },
      (err) => {
        console.log(err || 'It worked!');
      }
    );
  },
};
