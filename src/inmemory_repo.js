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
export class InMemoryReactionRepository {
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
