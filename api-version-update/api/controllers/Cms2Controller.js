/**
 * Cms2Controller
 *
 * @description :: Server-side logic for managing categories
 * @help        :: See http://sailsjs.org/#!/documentation/concepts/Controllers
 */
const Promise = require('bluebird');
const _ = require('lodash');
module.exports = {
  byPageNSection: async (req, res) => {
    try {
      const cmsNativeQuery = Promise.promisify(CMS.getDatastore().sendNativeQuery);
      let rawSelect = ` SELECT  *  `;
      let fromSQL = ` FROM cms `;

      let _where = `
        WHERE deleted_at IS NULL AND
        (page = 'LAYOUT' AND section = 'HEADER') or
        (page = 'HOME' AND section = 'CAROUSEL')
      `;

      const rawResult = await cmsNativeQuery(rawSelect + fromSQL + _where, []);
      if (!(rawResult && rawResult.rows && rawResult.rows.length > 0)) {
        return res.status(200).json({
          data: [],
          message: 'success'
        });
      }

      const finalRows = _.keyBy(rawResult.rows, (row) => {
        return row.page + '_' + row.section;
      });

      return res.status(200).json(finalRows);

    } catch (error) {
      console.log(error);
      res.status(400).json({
        success: false,
        error
      });
    }
  },
};
