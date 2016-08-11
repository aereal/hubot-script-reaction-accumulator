const { Redis } = require('./redis');

function mapFromArray(pairs) {
  return pairs.reduce((accum, pair) => {
    const [ key, value ] = pair;
    accum[key] = value;
    return accum;
  }, {});
}

export class RedisReactionRepository {
  constructor(redisURL) {
    this.redis = new Redis(redisURL);
  }

  add(userId, emoji) {
    return Promise.all([
      this.redis.sadd('users', userId),
      this.redis.hincrby(`emojis:${userId}`, emoji, 1)
    ]);
  }

  remove(userId, emoji) {
    return Promise.all([
      this.redis.sadd('users', userId),
      this.redis.hincrby(`emojis:${userId}`, emoji, -1)
    ]);
  }

  searchAll() {
    return this.redis.smembers('users').
      then(userIds => {
        return Promise.all(userIds.map(userId => this.searchByUserId(userId)));
      }).
      then(pairs => mapFromArray(pairs));
  }

  // => Promise<[userId, Stats]>
  searchByUserId(userId) {
    return this.redis.hgetall(`emojis:${userId}`).then(emojis => {
      return [userId, emojis];
    });
  }
}
