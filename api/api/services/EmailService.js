const commonUrl = "https://web.bitspeek.com";
const senderName = "Anonder Bazar";
module.exports={
  sendPasswordResetMail : function(obj, password) {
    sails.hooks.email.send(
      "restPasswordEmail",
      {
        recipientName: obj[0].first_name,
        senderName: senderName,
        user: obj,
        password: password,
        commonUrl: commonUrl,
      },
      {
        to: obj[0].email,
        subject: "Welcome to Anonder Bazar"
      },
      function(err) {console.log( 'Sending Password Reset Email: ', err || "It worked!");}
    )
  },
  sendWelcomeMailCustomer : function(obj) {
    sails.hooks.email.send(
      "registrationEmail",
      {
        recipientName: obj.first_name,
        senderName: senderName,
        user: obj,
        commonUrl: commonUrl,
      },
      {
        to: obj.email,
        subject: "Welcome to Anonder Bazar"
      },
      function(err) {console.log(err || "It worked!");}
    )
  },
  sendWelcomeMailVendor : function(obj) {
    sails.hooks.email.send(
      "vendorRegistrationEmail",
      {
        recipientName: obj[0].user_id.first_name,
        senderName: senderName,
        user: obj,
        commonUrl: commonUrl,
      },
      {
        to: obj[0].user_id.email,
        subject: "Welcome to Anonder Bazar"
      },
      function(err) {console.log(err || "It worked!");}
    )
  },
  orderSubmitMail : function(obj, emailTo = null) {
    let receiverEmail = emailTo;
    if(!receiverEmail && obj[0].user_id.email){
      receiverEmail = obj[0].user_id.email;
    }
    if(!receiverEmail){
      return;
    }
    sails.hooks.email.send(
      "orderSubmitEmail",
      {
        recipientName: obj[0].user_id.first_name,
        senderName: senderName,
        orderDetail: obj,
        commonUrl: commonUrl,
      },
      {
        to: receiverEmail,
        subject: "Your Order has been Placed (#"+ obj[0].id +")"
      },
      function(err) {console.log(err || "It worked!");}
    )
  },
  orderCompletedMail : function(obj) {
    sails.hooks.email.send(
      "orderCompleteEmail",
      {
        recipientName: obj[0].user_id.first_name,
        senderName: senderName,
        orderDetail: obj,
        commonUrl: commonUrl,
      },
      {
        to: obj[0].user_id.email,
        subject: "Your Order has been Delivered (#"+ obj[0].id +")"
      },
      function(err) {console.log(err || "It worked!");}
    )
  },
  orderStatusdMail : function(obj, status_text) {
    sails.hooks.email.send(
      "orderStatusEmail",
      {
        recipientName: obj[0].user_id.first_name,
        senderName: senderName,
        orderDetail: obj,
        status_Text: status_text,
        commonUrl: commonUrl,
      },
      {
        to: obj[0].user_id.email,
        subject: "Your Order has been "+status_text+" (#"+ obj[0].id +")"
      },
      function(err) {console.log(err || "It worked!");}
    )
  },
  orderStatusdMailVendor : function(obj, warehouse,status_text) {
    sails.hooks.email.send(
      "orderStatusEmail",
      {
        recipientName: warehouse[0].first_name,
        senderName: senderName,
        orderDetail: obj,
        status_Text: status_text,
        commonUrl: commonUrl,
      },
      {
        to: warehouse[0].email,
        subject: "Your Order has been "+status_text+" (#"+ obj[0].id +")"
      },
      function(err) {console.log(err || "It worked!");}
    )
  },
};
