export class UserNameRepository {
  constructor() {
    this.namesById = null;
  }

  getUserNames(slackWebClient) {
    if (this.namesById) {
      return Promise.resolve(this.namesById);
    } else {
      return slackWebClient.users.list().then(users => {
        this.namesById = users.members.reduce((accum, user) => { accum[user.id] = user.name; return accum }, {});
        return this.namesById;
      });
    }
  }
}
