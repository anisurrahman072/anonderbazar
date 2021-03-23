const moment = require('moment');
const {bangladeshSMSConfig, sslCommerzSMSConfig} = require('../../config/softbd');
const {makeUniqueId} = require('../../libs/helper');
const axios = require('axios');
const fs = require('fs');
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

  sendingDynamicSmsToMany: async (contactsMessages) => {

    const sms = contactsMessages.map((contactMessage) => {
      let contact = contactMessage.msisdn;
      if (contact.charAt(0) === '+') {
        contact = contact.substr(1);
      } else if (contact.charAt(0) === '0') {
        contact = '88' + contact;
      }
      return {
        csms_id: makeUniqueId(18) + contactMessage.user_id,
        text: contactMessage.text,
        msisdn: contact
      };
    });

    const payload = {
      ...sslCommerzSMSConfig,
      'sms': sms,
    };

    console.log('number of sms: ', payload.sms.length);
    console.log(payload);

    fs.writeFileSync('./all-sms-content.json', JSON.stringify(payload, null, 2), 'utf8');

    const response = await axios.post('https://smsplus.sslwireless.com/api/v3/send-sms/dynamic', payload, {
      'Content-Type': 'application/json',
      'Accept': 'application/json'
    });

    console.log(response);

  },
  sendingOneSmsToOne: (contacts, message) => {
    const contactTexts = contacts.map((contact) => {
      if (contact.charAt(0) === '+') {
        return contact.substr(1);
      } else if (contact.charAt(0) === '0') {
        return '88' + contact;
      }
      return contact;
    });

    const csmsId = makeUniqueId(18);

    const payload = {
      ...sslCommerzSMSConfig,
      'msisdn': contactTexts[0],
      'sms': message,
      'csms_id': csmsId
    };

    axios.post('https://smsplus.sslwireless.com/api/v3/send-sms', payload, {
      'Content-Type': 'application/json',
      'Accept': 'application/json'
    })
      .then((response) => {
        console.log(response.data);
      })
      .catch((error) => {
        console.log(error.data);
      });
  },
  sendingOneMessageToMany: (contacts, message) => {
    this.sendingOneSmsToOne(contacts, message);
  },
  sendingOneMessageToManyDeprecated: function (contacts, message) {

    const contactTexts = contacts.map((contact) => {
      if (contact.charAt(0) === '+') {
        return contact.substr(1);
      } else if (contact.charAt(0) === '0') {
        return '88' + contact;
      }
      return contact;
    }).join('+');

    const scheduledDateTime = moment().add(1, 'minute').format('YYYY-MM-DD HH:mm:ss');
    const payload = {
      ...bangladeshSMSConfig,
      'type': 'text',
      'scheduledDateTime': scheduledDateTime,
      'msg': message,
      'contacts': contactTexts
    };

    axios.post('http://bangladeshsms.com/smsapi', payload)
      .then((response) => {
        console.log(response);
      })
      .catch((error) => {
        console.log(error);
      });
  }
};
