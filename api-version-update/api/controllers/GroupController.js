/**
 * GroupController
 *
 * @description :: Server-side logic for managing groups
 * @help        :: See http://sailsjs.org/#!/documentation/concepts/Controllers
 */

module.exports = {
  //Method called for deleting a group data
  //Model models/Group.js
  destroy: async (req, res) => {
    try {
      const group = await Group.updateOne({id: req.param('id')}).set({deletedAt: new Date()});
      return res.json(group);
    } catch (error) {
      console.log(error);
      res.status(400).json({
        success: false,
        message: 'Failed to delete group',
        error
      });
    }

  }
};

