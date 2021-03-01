/**
 * PRStatusController
 *
 * @description :: Server-side actions for handling incoming requests.
 * @help        :: See https://sailsjs.com/docs/concepts/actions
 */

module.exports = {
  //Method called for creating PR Status
  //Model models/PRStatus.js
  create: async (req, res) => {
    try {
      let data = await PRStatus.create(req.body).fetch();
      if (data) {
        return res.json(200, data);
      } else {
        return res.status(400).json({success: false});
      }
    } catch (error) {
      return res.status(400).json({success: false, error});
    }

  }
};

