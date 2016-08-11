const RedisBase = require('redis');

function promisifiedCallback(ok, ng) { return (err, replies) => { err ? ng(err) : ok(replies) } }

export class Redis {
  constructor(redisURL) { this.client = RedisBase.createClient(redisURL) }

  sadd(key, member) {
    return new Promise((ok, ng) => {
      this.client.sadd(key, member, promisifiedCallback(ok, ng));
    });
  }

  smembers(key) {
    return new Promise((ok, ng) => {
      this.client.smembers(key, promisifiedCallback(ok, ng));
    });
  }

  hincrby(key, field, incr) {
    return new Promise((ok, ng) => {
      this.client.hincrby(key, field, incr, promisifiedCallback(ok, ng));
    });
  }

  hgetall(key) {
    return new Promise((ok, ng) => {
      this.client.hgetall(key, promisifiedCallback(ok, ng));
    });
  }
}
