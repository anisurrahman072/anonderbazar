/**
 * EventRegistrationController
 *
 * @description :: Server-side actions for handling incoming requests.
 * @help        :: See https://sailsjs.com/docs/concepts/actions
 */

module.exports = {
  //Method called for getting a event registration data
  //Model models/EventRegistration.js
  create: async (req, res) => {
    try {
      let data = await EventRegistration.create(req.body).fetch();
      return res.status(200).json({data: data});

    } catch (error) {
      console.log(error);
      return res.status(400).json({success: false, error});
    }
  },
};

