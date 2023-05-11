'use strict';

const fsp = require('node:fs').promises;
const path = require('node:path');
const config = require('./config.js');
const logger = require(`./logger/${config.logger.name}.js`)(config.logger);
const server = require(`./${config.apiServer.transport}.js`)({
  console: Object.freeze(logger),
});
const staticServer = require('./static.js')({
  console: Object.freeze(logger),
});
const db = require('./db.js')({
  config: config.db,
  console: Object.freeze(logger),
});
const hash = require('./hash.js')({
  config: config.hash,
  console: Object.freeze(logger),
});

const sandbox = {
  console: Object.freeze(logger),
  db: Object.freeze(db),
  common: { hash },
};
const apiPath = path.join(process.cwd(), './api');
const routing = {};

(async () => {
  const files = await fsp.readdir(apiPath);
  for (const fileName of files) {
    if (!fileName.endsWith('.js')) continue;
    const filePath = path.join(apiPath, fileName);
    const serviceName = path.basename(fileName, '.js');
    routing[serviceName] = require(filePath)(sandbox);
  }

  staticServer('./static', config.staticServer.port);
  server(routing, config.apiServer.port);
})();
