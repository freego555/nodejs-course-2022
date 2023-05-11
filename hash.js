'use strict';

const crypto = require('node:crypto');

const hash = ({ console, config }) => (password) => new Promise((resolve, reject) => {
  const salt = crypto.randomBytes(config.numberOfRandomBytes).toString(config.encoding);
  crypto.scrypt(password, salt, config.length, (err, result) => {
    if (err) reject(err);
    resolve(salt + ':' + result.toString(config.hash.encoding));
  });
});

module.exports = hash;
