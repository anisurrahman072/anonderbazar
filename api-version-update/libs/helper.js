const {devEnv} = require('../config/softbd');

exports.asyncForEach = async (array, callback) => {
  for (let index = 0; index < array.length; index++) {
    await callback(array[index], index, array);
  }
};


exports.initLogPlaceholder = (req, funcName) => {
  sails.log(`call from ${funcName}`);
  sails.log('query ========>', req.query);
  sails.log('params =======>', req.params);
  sails.log('body =========>', req.body);
};

exports.uploadImgAsync = (param, option = {}) => {
  return new Promise(((resolve, reject) => {
    param.upload(option, (err, data) => {
      if (err !== null) {
        return reject(err);
      }
      resolve(data);
    });
  }));
};


exports.deleteImages = async (imageList, path) => {
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
  });
};

exports.baseFilter = (reqBody, Model, localWhere) => {

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

exports.uploadImages = (imageFile) => {
  return new Promise((resolve, reject) => {
    imageFile.upload(imageUploadConfig(), async (err, uploaded) => {
      if (err) {
        console.log(err);
        reject(err);
      } else {
        resolve(uploaded);
      }
    });
  });
};
exports.escapeExcel = function (str) {
  return str.replace(/[&]/g, 'and').replace(/['"]/g, '').replace('-', ' ').replace(/\s+/g, ' ');
};
exports.imageUploadConfig = function () {

  if (devEnv) {
    return {
      maxBytes: 10000000,
      dirname: sails.config.appPath + '/.tmp/public',
    };
  }
  return {
    adapter: require('skipper-s3'),
    key: 'AKIATYQRUSGN2DDD424I',
    secret: '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',
    bucket: 'anonderbazar',
    maxBytes: 10000000
  };

};

exports.getContentTypeByFile = function (fileName) {
  var rc = 'application/octet-stream';
  var fn = fileName.toLowerCase();

  if (fn.indexOf('.html') >= 0) {
    rc = 'text/html';
  } else if (fn.indexOf('.css') >= 0) {
    rc = 'text/css';
  } else if (fn.indexOf('.json') >= 0) {
    rc = 'application/json';
  } else if (fn.indexOf('.js') >= 0) {
    rc = 'application/x-javascript';
  } else if (fn.indexOf('.png') >= 0) {
    rc = 'image/png';
  } else if (fn.indexOf('.jpg') >= 0) {
    rc = 'image/jpg';
  }

  return rc;
};
exports.generateUuid = function (count, k) {
  const _sym = 'abcdefghijklmnopqrstuvwxyz1234567890';
  let str = '';

  for (let i = 0; i < count; i++) {
    str += _sym[parseInt(Math.random() * (_sym.length))];
  }
  base.getID(str, (err, res) => {
    if (!res.length) {
      k(str);                   // use the continuation
    } else {
      generate(count, k);
    }  // otherwise, recurse on generate
  });
};
exports.makeUniqueId = function (length) {
  var result = '';
  var characters = 'ABCDEFGHIJKLMNOPQRSTUVWXYZabcdefghijklmnopqrstuvwxyz0123456789';
  var charactersLength = characters.length;
  for (var i = 0; i < length; i++) {
    result += characters.charAt(Math.floor(Math.random() * charactersLength));
  }
  return result;
};
