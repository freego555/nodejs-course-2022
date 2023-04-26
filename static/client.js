'use strict';

const socket = config.apiUrl.startsWith('ws') ? new WebSocket(config.apiUrl) : undefined;

const methodForTransport = {
  http: async function (...args) {
    const { url, structure, serviceName, methodName } = this;
    const apiUrl = [url, serviceName, methodName];
    let body;
    let i = 0;
    for (const argName of structure[serviceName][methodName]) {
      if (argName === 'id') apiUrl.push(args[i]);
      if (argName === 'record') body = { ...args[i] };
      i++;
    }
    const response = await fetch(apiUrl.join('/'), { method: 'POST', body: JSON.stringify(body) });
    return response.json();
  },

  ws: function (...args) {
    return new Promise((resolve) => {
      const { serviceName, methodName } = this;
      const packet = { name: serviceName, method: methodName, args };
      socket.send(JSON.stringify(packet));
      socket.onmessage = (event) => {
        const data = JSON.parse(event.data);
        resolve(data);
      };
    })
  },
};

const scaffold = (url, structure) => {
  let transportName = '';
  if (url.startsWith('http')) transportName = 'http';
  else if (url.startsWith('ws')) transportName = 'ws';
  else throw new Error('Unknown transport protocol');

  const api = {};
  const services = Object.keys(structure);
  for (const serviceName of services) {
    api[serviceName] = {};
    const service = structure[serviceName];
    const methods = Object.keys(service);
    for (const methodName of methods) {
      const context = { url, structure, serviceName, methodName };
      api[serviceName][methodName] = methodForTransport[transportName].bind(context);
    }
  }
  return api;
};

const api = scaffold(config.apiUrl, {
  user: {
    create: ['record'],
    read: ['id'],
    update: ['id', 'record'],
    delete: ['id'],
    find: ['mask'],
  },
  country: {
    read: ['id'],
    delete: ['id'],
    find: ['mask'],
  },
});

socket?.addEventListener('open', async () => {
  const data = await api.user.read(3);
  console.dir({ data });
});
