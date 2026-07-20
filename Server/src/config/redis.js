import Redis from 'ioredis';

const redis = new Redis({
  host: 'localhost',
  port: 6379,
});

redis.on('connect', () => {
  console.log(' Redis Connected');
});

redis.on('ready', () => {
  console.log(' Redis Ready');
});

redis.on('error', (err) => {
  console.error(' Redis Error:', err);
});

export default redis;


