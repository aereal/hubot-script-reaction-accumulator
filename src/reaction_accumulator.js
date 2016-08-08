const { inspect } = require('util');
const { RTM_EVENTS: { REACTION_ADDED, REACTION_REMOVED } } = require('@slack/client');

/*
interface ReactionStats {
  [emoji: string]: number;
}

interface UserReactionStats {
  [userId: string]: ReactionStats;
}

interface ReactionRepository {
  add(userId: string, emoji: string): void;
  remove(userId: string, emoji: string): void;
  searchAll(): UserReactionStats;
}
*/

// InMemoryReactionRepository extends ReactionRepository
class InMemoryReactionRepository {
  constructor() {
    this.reactions = {};
  }

  add(userId, emoji) {
    if (!this.reactions[userId]) {
      this.reactions[userId] = {};
    }
    if (!this.reactions[userId][emoji]) {
      this.reactions[userId][emoji] = 0;
    }
    this.reactions[userId][emoji]++;
  }

  remove(userId, emoji) {
    if (!this.reactions[userId]) {
      this.reactions[userId] = {};
    }
    if (!this.reactions[userId][emoji]) {
      this.reactions[userId][emoji] = 0;
    }
    this.reactions[userId][emoji]--;
  }

  searchAll() {
    return this.reactions;
  }
}

const reactionRepo = new InMemoryReactionRepository();

function accumulateReactions(client) {
  client.on(REACTION_ADDED, (msg) => {
    const { item_user, reaction } = msg;
    reactionRepo.add(item_user, reaction);
  });
  client.on(REACTION_REMOVED, (msg) => {
    const { item_user, reaction } = msg;
    reactionRepo.remove(item_user, reaction);
  });
}

// => Promise<{ userId: userName }>
function fetchUserNamesByUserId(slackClient) {
  if (this.memoizedNames) {
    return Promise.resolve(this.memoizedNames);
  } else {
    return slackClient.web.users.list().then(users => {
      this.memoizedNames = users.members.reduce((accum, user) => { accum[user.id] = user.name; return accum }, {});
      return this.memoizedNames;
    });
  }
}

module.exports = (robot) => {
  const { adapter: { client } } = robot;
  accumulateReactions(client);

  robot.respond(/reactions/, (res) => {
    fetchUserNamesByUserId(client).then(namesById => {
      const stats = {};
      const reactions = reactionRepo.searchAll();
      Object.keys(reactions).forEach(userId => {
        const userName = namesById[userId];
        stats[userName] = reactions[userId];
      });
      res.reply(inspect(stats));
    })
  });
};
