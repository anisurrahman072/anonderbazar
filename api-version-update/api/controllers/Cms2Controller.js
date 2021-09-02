/**
 * Cms2Controller
 *
 * @description :: Server-side logic for managing categories
 * @help        :: See http://sailsjs.org/#!/documentation/concepts/Controllers
 */
const Promise = require('bluebird');
const _ = require('lodash');
const {performance} = require('perf_hooks');

module.exports = {
  byPageNSectionNSubsection: async (req, res) => {
    try {
      const time1 = performance.now();

      const cmsNativeQuery = Promise.promisify(CMS.getDatastore().sendNativeQuery);
      let rawSelect = ` SELECT  *  `;
      let fromSQL = ` FROM cms `;

      let _where = `
        WHERE deleted_at IS NULL AND (
        (page = 'POST' AND section = 'HOME' AND sub_section = 'CATEGORY') or
        (page = 'POST' AND section = 'HOME' AND sub_section = 'MIDDLE') or
        (page = 'LAYOUT' AND section = 'FOOTER' AND sub_section = 'FEATURE') or
        (page = 'POST' AND section = 'HOME' AND sub_section = 'PARENTOFFER') or
        (page = 'POST' AND section = 'HOME' AND sub_section = 'BOTTOM') or
        (page = 'POST' AND section = 'HOME' AND sub_section = 'CATEGORY') )

        ORDER BY frontend_position ASC
      `;

      const rawResult = await cmsNativeQuery(rawSelect + fromSQL + _where, []);
      if (!(rawResult && rawResult.rows && rawResult.rows.length > 0)) {
        return res.status(200).json({
          data: [],
          message: 'success'
        });
      }

      const finalRows = _.groupBy(rawResult.rows, (row) => {
        return row.page + '_' + row.section + '_' + row.sub_section;
      });


      _.forEach(finalRows, (collection) => {
        _.forEach(collection, (row) => {
          row.data_value = JSON.parse(row.data_value);
        });
      });

      const time2 = performance.now();
      sails.log.debug(`Request Uri: ${req.path}  ##########  Time Elapsed: ${(time2 - time1) / 1000} seconds`);

      return res.status(200).json(finalRows);

    } catch (error) {
      console.log(error);
      sails.log.error(`Request Uri: ${req.path} ########## ${error}`);

      res.status(400).json({
        success: false,
        error
      });
    }
  },
  byPageNSection: async (req, res) => {
    try {
      const time1 = performance.now();

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

      const time2 = performance.now();
      sails.log.debug(`Request Uri: ${req.path}  ##########  Time Elapsed: ${(time2 - time1) / 1000} seconds`);

      return res.status(200).json(finalRows);

    } catch (error) {
      console.log(error);
      sails.log.error(`Request Uri: ${req.path} ########## ${error}`);

      res.status(400).json({
        success: false,
        error
      });
    }
  },
};
