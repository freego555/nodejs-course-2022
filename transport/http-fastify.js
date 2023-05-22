'use strict';

module.exports = ({ console }) => async (routing, port) => {
  const fastify = require('fastify')();

  const HEADERS = {
    'Access-Control-Allow-Origin': '*',
    'Access-Control-Allow-Headers': 'Content-Type',
    'Access-Control-Allow-Methods': 'POST, OPTIONS'
  };

  fastify.addHook('onSend', (request, reply, payload, done) => {
    reply.headers(HEADERS);
    done();
  });

  fastify.route({
    method: 'OPTIONS',
    url: '*',
    handler(request, reply) {
      reply
        .code(204)
        .headers(HEADERS)
        .send();
    }
  });

  for (const entityName of Object.keys(routing)) {
    for (const handlerName of Object.keys(routing[entityName])) {
      const url = `/${entityName}/${handlerName}/:id`;

      fastify.route({
        method: 'POST',
        url,
        async handler(request, reply) {
          const id = request.url.substring(1).split('/')[2];
          const handler = routing[entityName][handlerName];
          const src = handler.toString();
          const signature = src.substring(0, src.indexOf(')'));
          const args = [];
          if (signature.includes('(id')) args.push(id);
          if (signature.includes('{')) args.push(request.body);
          console.log(
            `${request.socket.remoteAddress} ${handlerName} ${request.url}`
          );
          const result = await handler(...args);

          reply
            .code(200)
            .send(result.rows);
        }
      });
    }
  }

  try {
    await fastify.listen({ port });
  } catch (err) {
    fastify.log.error(err);
    process.exit(1);
  }

  console.log(`API on port ${port}`);
};
