const { inspect } = require('util');
const { RTM_EVENTS: { REACTION_ADDED, REACTION_REMOVED } } = require('@slack/client');

const { InMemoryReactionRepository } = require('./inmemory_repo');
const { UserNameRepository } = require('./user_name_repo');

const reactionRepo = new InMemoryReactionRepository();
const userNameRepo = new UserNameRepository();

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

module.exports = (robot) => {
  const { adapter: { client } } = robot;
  accumulateReactions(client);

  robot.respond(/reactions/, (res) => {
    userNameRepo.getUserNames(client.web).then(namesById => {
      const stats = {};
      reactionRepo.searchAll().then(reactions => {
        Object.keys(reactions).forEach(userId => {
          const userName = namesById[userId];
          stats[userName] = reactions[userId];
        });
        res.reply(inspect(stats));
      });
    })
  });
};
