import moment from "moment";
import {bangladeshSMSConfig, sslCommerzSMSConfig} from "../../config/softbd";

const axios = require('axios');
/*
{
  type : "post",
  url : "http://bangladeshsms.com/smsapi",
  data : {
    "api_key" : "C20075355fdae5af5f8c82.48883475",
    "senderid" : "8809612446331",
    "type" : "{content type}",
    "scheduledDateTime" : "{schedule date time}",
    "msg" : "{your message}",
    "contacts" : "88017xxxxxxxx+88018xxxxxxxx"
  }
}
 */

module.exports = {

  sendingOneSmsToOne: function (contacts, message) {
    const contactTexts = contacts.map(function (contact) {
      if (contact.charAt(0) === '+') {
        return contact.substr(1)
      } else if (contact.charAt(0) === '0') {
        return '88' + contact
      }
      return contact
    });

    const {v4: uuidv4} = require('uuid');

    const csmsId = uuidv4();
    console.log('csmsId', csmsId);

    const payload = {
      ...sslCommerzSMSConfig,
      "msisdn": contactTexts[0],
      "sms": message,
      "csms_id": csmsId
    };

    axios.post('https://smsplus.sslwireless.com/api/v3/send-sms', payload, {
      'Content-Type': 'application/json',
      'Accept': 'application/json'
    })
      .then(function (response) {
        console.log(response);
      })
      .catch(function (error) {
        console.log(error);
      });
  },
  sendingOneMessageToMany: function (contacts, message) {

    const contactTexts = contacts.map(function (contact) {
      if (contact.charAt(0) === '+') {
        return contact.substr(1)
      } else if (contact.charAt(0) === '0') {
        return '88' + contact
      }
      return contact;
    }).join('+');

    const scheduledDateTime = moment().add(1, 'minute').format('YYYY-MM-DD HH:mm:ss');
    const payload = {
      ...bangladeshSMSConfig,
      "type": "text",
      "scheduledDateTime": scheduledDateTime,
      "msg": message,
      "contacts": contactTexts
    };

    axios.post('http://bangladeshsms.com/smsapi', payload)
      .then(function (response) {
        console.log(response);
      })
      .catch(function (error) {
        console.log(error);
      });
  }
}
