/**
 * ChatuserController
 *
 * @description :: Server-side actions for handling incoming requests.
 * @help        :: See https://sailsjs.com/docs/concepts/actions
 */
const {performance} = require('perf_hooks');

module.exports = {
  //Method called for creating chat user data
  //Model models/ChatUser.js
  create: async (req, res) => {

    const time1 = performance.now();

    async function create(body) {
      try {
        let data = await ChatUser.create(body).fetch();

        if (data) {
          return res.json(200, data);
        } else {
          return res.status(400).json({ success: false });
        }
      } catch (error) {
        sails.log.error(`Request Uri: ${req.path} ########## ${error}`);

        return res.status(400).json({ success: false });
      }
    }
    if (req.body) {
      req.body.status = 1;
    }
    await create(req.body);

    const time2 = performance.now();
    sails.log.debug(`Request Uri: ${req.path}  ##########  Time Elapsed: ${(time2 - time1) / 1000} seconds`);

  },
  //Method called for getting chat notification data
  //Model models/ChatUser.js
  getNotification: async  (req, res) => {
    let total = 0;
    try {
      const time1 = performance.now();

      let _where = {};
      _where.deletedAt = null;
      if (req.query.warehouse_id) {
        _where.warehouse_id = req.query.warehouse_id;
      }
      let chats = await ChatUser.find({
        where: _where
      })
        .populate('product_id')
        .populate('user_id')
        .populate('warehouse_id');

      let allChats = await Promise.all(
        chats.map(async item => {
          item.messages = await Chat.find({
            deletedAt: null,
            notification_view_status:1,
            chat_user_id: item.id
          });
          total+=item.messages.length;
          return item;

        })
      );

      const time2 = performance.now();
      sails.log.debug(`Request Uri: ${req.path}  ##########  Time Elapsed: ${(time2 - time1) / 1000} seconds`);

      return res.status(200).json({
        success: true,
        message: 'get chat in search',
        totalnotification:total,
        data: allChats,
      });
    } catch (error) {
      sails.log.error(`Request Uri: ${req.path} ########## ${error}`);

      let message = 'Error in Get All Chats';
      res.status(400).json({
        success: false,
        message
      });
    }

  },
};

