const {performance} = require('perf_hooks');

module.exports = {
  destroy: async (req, res) => {
    try {
      const time1 = performance.now();

      const user = await Area.updateOne({id: req.param('id')}).set({deletedAt: new Date()});

      const time2 = performance.now();
      sails.log.info(`Request Uri: ${req.path}  ##########  Time Elapsed: ${(time2 - time1) / 1000} seconds`);

      return res.json(200, user);

    } catch (error) {
      console.log(error);
      sails.log.error(`Request Uri: ${req.path} ########## ${error}`);

      res.json(400, {success: false, message: 'Something went wrong!', error});
    }
  }
};

