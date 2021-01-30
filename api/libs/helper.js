import {devEnv} from '../config/softbd';

export const asyncForEach = async (array, callback) => {
  for (let index = 0; index < array.length; index++) {
    await callback(array[index], index, array)
  }
};


export const initLogPlaceholder = (req, funcName) => {
  sails.log(`call from ${funcName}`);
  sails.log('query ========>', req.query);
  sails.log('params =======>', req.params);
  sails.log('body =========>', req.body);
};

export const uploadImgAsync = (param, option = {}) => {
  return new Promise(function (resolve, reject) {
    param.upload(option, function (err, data) {
      if (err !== null) return reject(err);
      resolve(data);
    });
  });
};


export const deleteImages = async (imageList, path) => {
  asyncForEach(imageList, (item) => {
    console.log(item);

    let dir = __dirname.split('/api');
    let assestsdir = dir[0] + '/assets';

    try {
      fs.unlinkSync(assestsdir + item);
      console.log('successfully deleted' + item);
    } catch (err) {

      console.log('error to delete' + item);
      // handle the error
    }
  })
};

export const baseFilter = (reqBody, Model, localWhere) => {

  const where = localWhere ? localWhere : {};
  where.deletedAt = null;
  const modelAttributes = Object.keys(Model.definition);

  modelAttributes.map((attr) => {
    if (reqBody[attr]) {
      where[attr] = reqBody[attr];
    }
  });
  return where;
};

export const escapeExcel = function (str) {
  return str.replace(/[&]/g, 'and').replace(/['"]/g, '').replace('-', ' ').replace(/s+/g, ' ');
}
export const imageUploadConfig = function () {

  if (devEnv) {
    return {
      maxBytes: 10000000,
      dirname: sails.config.appPath + "/.tmp/public/images/",
    }
  }
  return {
    adapter: require('skipper-s3'),
    key: 'AKIATYQRUSGN2DDD424I',
    secret: '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',
    bucket: 'anonderbazar',
    maxBytes: 10000000
  }

}

