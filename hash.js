'use strict';

const crypto = require('node:crypto');
const config = require('./config.js');

const hash = ({ console }) => (password) => new Promise((resolve, reject) => {
  const salt = crypto.randomBytes(config.hash.numberOfRandomBytes).toString(config.hash.encoding);
  crypto.scrypt(password, salt, config.hash.length, (err, result) => {
    if (err) reject(err);
    resolve(salt + ':' + result.toString(config.hash.encoding));
  });
});

module.exports = hash;
