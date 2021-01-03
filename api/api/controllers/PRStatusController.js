/**
 * PRStatusController
 *
 * @description :: Server-side actions for handling incoming requests.
 * @help        :: See https://sailsjs.com/docs/concepts/actions
 */
import { Helper, asyncForEach, initLogPlaceholder, pagination } from '../../libs';

module.exports = {
  //Method called for creating PR Status
  //Model models/PRStatus.js
  create: async (req, res) => {
    initLogPlaceholder(req, 'chat Service create');
    async function create(body) {
      try {
        let data = await PRStatus.create(body);
        if (data) {
          return res.json(200, data);
        } else {
          return res.status(400).json({ success: false });
        }
      } catch (error) {
        return res.status(400).json({ success: false });
      }
    }
    create(req.body);

  }
};

