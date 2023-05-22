'use strict';

const http = require('node:http');

const HEADERS = {
  'Access-Control-Allow-Origin': '*',
  'Access-Control-Allow-Headers': 'Content-Type',
  'Access-Control-Allow-Methods': 'POST, OPTIONS',
};

const statusCodeForHttpMethodByDefault = {
  'POST': 200,
  'OPTIONS': 204,
};

const receiveArgs = async (req) => {
  const buffers = [];
  for await (const chunk of req) buffers.push(chunk);
  const data = Buffer.concat(buffers).toString();
  return JSON.parse(data);
};

module.exports = ({ console }) => (routing, port) => {
  http.createServer(async (req, res) => {
    const statusCode = statusCodeForHttpMethodByDefault[req.method] || 404;
    res.writeHead(statusCode, HEADERS);
    if (req.method !== 'POST') return res.end();

    const { url, socket } = req;
    const [name, method, id] = url.substring(1).split('/');
    const entity = routing[name];
    if (!entity) return res.end('Not found');
    const handler = entity[method];
    if (!handler) return res.end('Not found');
    const src = handler.toString();
    const signature = src.substring(0, src.indexOf(')'));
    const args = [];
    if (signature.includes('(id')) args.push(id);
    if (signature.includes('{')) args.push(await receiveArgs(req));
    console.log(`${socket.remoteAddress} ${method} ${url}`);
    const result = await handler(...args);
    res.end(JSON.stringify(result.rows));
  }).listen(port);

  console.log(`API on port ${port}`);
};
