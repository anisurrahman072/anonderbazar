/**
 * jwToken
 *
 * @description :: JSON Webtoken Service for sails
 * @help        :: See https://github.com/auth0/node-jsonwebtoken & http://sailsjs.org/#!/documentation/concepts/Services
 */

let jwt = require('jsonwebtoken');
let tokenSecret = '032Q8~kjhk!lsjdf8237';

// Generates a token from supplied payload
exports.issue = function (payload) {
  return jwt.sign(
    payload,
    tokenSecret, {
      // expiresIn: '1h',
      expiresIn: 60 * 60 * 24,
      issuer: 'cccg',
      algorithm: 'HS256'
    });
};

// Verifies token on a request
exports.verify = function (token) {
  return new Promise((resolve, reject) => {
    jwt.verify(
      token, // The token to be verified
      tokenSecret, // Same token we used to sign
      {}, // No Option, for more see https://github.com/auth0/node-jsonwebtoken#jwtverifytoken-secretorpublickey-options-callback
      (err, token) => {

        if (err) {
          reject(err);
        }
        resolve(token);

      } //Pass errors or decoded token to callback
    );
  });
};


