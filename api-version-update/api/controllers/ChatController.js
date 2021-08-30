/**
 * ChatController
 *
 * @description :: Server-side actions for handling incoming requests.
 * @help        :: See https://sailsjs.com/docs/concepts/actions
 */
const {performance} = require('perf_hooks');

module.exports = {
  //Method called for initiating a chat room
  //Model models/Chat.js
  create: async (req, res) => {

    const time1 = performance.now();

    async function create(body) {
      try {
        let data = await Chat.create(body);
        let fileCounter = parseInt(req.body.fileCounter);
        let i;
        for (i = 0; i < fileCounter; i++) {
          req
            .file('file' + i)
            .upload({ dirname: '../../.tmp/public/files/' }, async (
              err,
              uploaded
            ) => {
              if (err) {
                return res.json(err.status, { err: err });
              }
              var newPath = uploaded[0].fd.split(/[\\//]+/).reverse()[0];
              if (err) {return res.serverError(err);}

              await ChatFile.create({
                chat_id: data.id,
                file_name: newPath,
                file_location: '/files/' + newPath
              });
            });
        }
        if (data) {
          return res.json(200, data);
        } else {
          return res.status(400).json({ success: false });
        }
      } catch (error) {
        console.log(error);
        sails.log.error(`Request Uri: ${req.path} ########## ${error}`);

        return res.status(400).json({ success: false });
      }
    }

    await create(req.body);

    const time2 = performance.now();
    sails.log.info(`Request Uri: ${req.path}  ##########  Time Elapsed: ${(time2 - time1) / 1000} seconds`);

  },

};

