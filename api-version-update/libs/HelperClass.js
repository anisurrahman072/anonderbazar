const { asyncForEach } = require('./helper');
const fs = require('fs');

exports.Helper = {
  deleteImages: async (imageList, path) => {
    asyncForEach(imageList, (item) => {
      console.log(item);
      const dir = __dirname.split('/libs');
      const assestsdir = `${dir[0]}/assets`;
      console.log(assestsdir);
      try {
        fs.unlinkSync(assestsdir + item);
        console.log(`successfully deleted${item}`);
      } catch (err) {
        console.log(`error to delete${item}`, err);
        // handle the error
      }
    });
  },
  pagination: async (reqBody) => {

    let limit;
    let skip;
    let page;
    if (reqBody.limit === 'all') {
      limit = null;
      skip = 0;
      page = 1;
    } else {
      limit = parseInt(reqBody.limit) || 10;
      skip = parseInt(reqBody.page ? limit * (reqBody.page - 1) : 0) | 0; // if there is no skip set skip to 0
      page = parseInt(reqBody.page) || 1; // if there is no page number set page to 1
    }

    /* ............PAGINATION........................END............. */
    return {
      limit,
      skip,
      page,
    };
  },
};
