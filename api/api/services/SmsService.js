import moment from "moment";

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

    const payload = {
      "api_token": '1279-98d2bb25-3f7e-49bf-a1e2-5d1a6c6c588f',
      "sid": 'ENGINEERING',
      "msisdn": contactTexts[0],
      "sms": message,
      "csms_id": uuidv4()
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
      return contact
    }).join('+')

    const scheduledDateTime = moment().add(1, 'minute').format('YYYY-MM-DD HH:mm:ss')
    const payload = {
      "api_key": "C20075355fdae5af5f8c82.48883475",
      "senderid": "8809612446331",
      "type": "text",
      "scheduledDateTime": scheduledDateTime,
      "msg": message,
      "contacts": contactTexts
    }

    axios.post('http://bangladeshsms.com/smsapi', payload)
      .then(function (response) {
        console.log(response);
      })
      .catch(function (error) {
        console.log(error);
      });
  }
}
