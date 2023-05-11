'use strict';

const fs = require('fs');
const pino = require('pino');

class Pino {
  constructor(path) {
    this.path = path;

    const date = new Date().toISOString().substring(0, 10);
    this.fileStream = fs.createWriteStream(`${path}/${date}.log`, {
      flags: 'a',
    });

    const streams = [
      { stream: this.fileStream },
      { stream: process.stdout },
    ];
    this.logger = pino({ level: 'debug' }, pino.multistream(streams));
  }

  close() {
    return new Promise((resolve) => this.fileStream.end(resolve));
  }

  log(...args) {
    this.logger.info(args.join(' '));
  }
}

module.exports = (options) => new Pino(options.path);
