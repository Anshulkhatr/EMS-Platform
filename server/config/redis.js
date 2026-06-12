const Redis = require('ioredis');

const redisHost = process.env.REDIS_HOST || '127.0.0.1';
const redisPort = process.env.REDIS_PORT || 6379;

let activeClient;
let useMock = false;

// Basic in-memory store for the mock client
const store = new Map();

const mockClient = {
  status: 'ready',
  async get(key) {
    return store.get(key) || null;
  },
  async set(key, value, ...args) {
    store.set(key, String(value));
    return 'OK';
  },
  async del(key) {
    return store.delete(key) ? 1 : 0;
  },
  async incr(key) {
    const val = parseInt(store.get(key) || '0', 10) + 1;
    store.set(key, String(val));
    return val;
  },
  on(event, cb) {
    if (event === 'connect' || event === 'ready') {
      setTimeout(() => cb(), 0);
    }
    return this;
  },
  once(event, cb) {
    return this.on(event, cb);
  },
  off() { return this; },
  quit() { return Promise.resolve('OK'); },
  disconnect() {}
};

console.log(`Connecting to Redis at ${redisHost}:${redisPort}...`);
const realClient = new Redis({
  host: redisHost,
  port: parseInt(redisPort, 10),
  maxRetriesPerRequest: null,
  retryStrategy(times) {
    if (times > 1) { // Fail fast to switch to mock quickly
      console.warn('[WARN] Redis is offline. Switching to in-memory mock fallback.');
      useMock = true;
      activeClient = mockClient;
      realClient.disconnect();
      return null;
    }
    return 100;
  }
});

activeClient = realClient;

realClient.on('connect', () => {
  console.log('Redis connected successfully.');
});

realClient.on('error', (err) => {
  // Silence connection errors in development to keep the console output clean
  if (process.env.NODE_ENV === 'production' && !useMock) {
    console.error('Redis connection error:', err.message);
  }
});

const proxy = new Proxy({}, {
  get(target, prop) {
    if (prop === 'then') return undefined;
    if (typeof activeClient[prop] === 'function') {
      return activeClient[prop].bind(activeClient);
    }
    return activeClient[prop];
  }
});

module.exports = proxy;
