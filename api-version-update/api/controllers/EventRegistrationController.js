/**
 * EventRegistrationController
 *
 * @description :: Server-side actions for handling incoming requests.
 * @help        :: See https://sailsjs.com/docs/concepts/actions
 */
const { initLogPlaceholder, pagination, uploadImgAsync } = require('../../libs');

module.exports = {
  //Method called for getting a event registration data
  //Model models/EventRegistration.js
  create: async (req, res) => {

    initLogPlaceholder(req, 'event registration create');
    create(req.body);
    async function create(body) {
      try {
        let data = await EventRegistration.create(body);
        if (data) {
          return res.json(200, data);
        } else {
          return res.status(400).json({ success: false });
        }
      } catch (error) {
        return res.status(400).json({ success: false });
      }
    }
  },

};

