# Copyright
Based on https://github.com/HowProgrammingWorks/DDD/tree/master/JavaScript/9-logger

# Before run

- add `./config.js` file with API server config. For example,

```js
'use strict';

module.exports = {
  apiServer: {
    port: 8001,
    transport: 'http',
    framework: 'fastify',
  },
  staticServer: { port: 8000 },
  db: {
    host: '127.0.0.1',
    port: 5432,
    database: 'example',
    user: 'username',
    password: 'userpassword',
  },
  hash: {
    numberOfRandomBytes: 16,
    encoding: 'base64',
    length: 64,
  },
  loader: {
    runScriptTimeout: 5000,
  },
  logger: {
    name: 'custom',
    path: './log',
  },
};
```

- add `./static/config.js` file with config on the client side. For example,

```js
'use strict';

const config = {
  apiUrl: 'http://127.0.0.1:8001',
};
```

- PostgreSQL database example setup instruction is [here](https://github.com/HowProgrammingWorks/DDD/tree/master/JavaScript/9-logger/db)

# Run
`node main.js`