const { inspect } = require('util');
const { RTM_EVENTS: { REACTION_ADDED, REACTION_REMOVED } } = require('@slack/client');

const { InMemoryReactionRepository } = require('./inmemory_repo');

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
