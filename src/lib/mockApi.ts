import { User } from "./auth";
import { GameSession, ChatMessage } from "./api";

// In-memory data storage
const gameSessions: GameSession[] = [];
const chatMessages: ChatMessage[] = [];
const transactions: any[] = [];

// Mock data for leaderboard
const mockLeaderboard: User[] = [
  {
    id: "1",
    username: "crypto_king",
    email: null,
    password_hash: "password",
    aura_balance: 5000,
    created_at: new Date().toISOString(),
    last_login: null,
    avatar_url: "https://api.dicebear.com/7.x/avataaars/svg?seed=crypto_king",
    is_banned: false,
  },
  {
    id: "2",
    username: "lucky_charm",
    email: null,
    password_hash: "password",
    aura_balance: 4500,
    created_at: new Date().toISOString(),
    last_login: null,
    avatar_url: "https://api.dicebear.com/7.x/avataaars/svg?seed=lucky_charm",
    is_banned: false,
  },
  {
    id: "3",
    username: "high_roller",
    email: null,
    password_hash: "password",
    aura_balance: 4000,
    created_at: new Date().toISOString(),
    last_login: null,
    avatar_url: "https://api.dicebear.com/7.x/avataaars/svg?seed=high_roller",
    is_banned: false,
  },
  {
    id: "4",
    username: "aura_master",
    email: null,
    password_hash: "password",
    aura_balance: 3500,
    created_at: new Date().toISOString(),
    last_login: null,
    avatar_url: "https://api.dicebear.com/7.x/avataaars/svg?seed=aura_master",
    is_banned: false,
  },
  {
    id: "5",
    username: "bet_wizard",
    email: null,
    password_hash: "password",
    aura_balance: 3000,
    created_at: new Date().toISOString(),
    last_login: null,
    avatar_url: "https://api.dicebear.com/7.x/avataaars/svg?seed=bet_wizard",
    is_banned: false,
  },
];

// Generate a UUID
function generateUUID() {
  return "xxxxxxxx-xxxx-4xxx-yxxx-xxxxxxxxxxxx".replace(/[xy]/g, function (c) {
    const r = (Math.random() * 16) | 0,
      v = c === "x" ? r : (r & 0x3) | 0x8;
    return v.toString(16);
  });
}

// Mock API functions
export async function mockFetchRecentGameSessions(limit = 10) {
  return gameSessions.slice(0, limit).map((session) => ({
    ...session,
    users: {
      username:
        mockLeaderboard.find((u) => u.id === session.user_id)?.username ||
        "unknown",
      avatar_url:
        mockLeaderboard.find((u) => u.id === session.user_id)?.avatar_url ||
        null,
    },
  }));
}

export async function mockCreateGameSession(
  session: Omit<GameSession, "id" | "created_at">,
) {
  const newSession = {
    ...session,
    id: generateUUID(),
    created_at: new Date().toISOString(),
  };

  gameSessions.unshift(newSession);

  // Create transaction
  await mockCreateTransaction({
    user_id: session.user_id,
    amount: session.outcome_amount,
    transaction_type: session.outcome_amount > 0 ? "win" : "bet",
    reference_id: newSession.id,
  });

  // Update user balance
  const user = mockLeaderboard.find((u) => u.id === session.user_id);
  if (user) {
    user.aura_balance += session.outcome_amount;
  }

  return newSession;
}

export async function mockFetchChatMessages(limit = 20) {
  return chatMessages.slice(-limit).map((msg) => ({
    ...msg,
    users: {
      username:
        mockLeaderboard.find((u) => u.id === msg.user_id)?.username ||
        "unknown",
      avatar_url:
        mockLeaderboard.find((u) => u.id === msg.user_id)?.avatar_url || null,
    },
  }));
}

export async function mockSendChatMessage(userId: string, message: string) {
  const newMessage = {
    id: generateUUID(),
    user_id: userId,
    message,
    created_at: new Date().toISOString(),
    is_deleted: false,
  };

  chatMessages.push(newMessage);
  return newMessage;
}

export async function mockCreateTransaction(transaction: {
  user_id: string;
  amount: number;
  transaction_type: string;
  reference_id?: string;
}) {
  const newTransaction = {
    ...transaction,
    id: generateUUID(),
    created_at: new Date().toISOString(),
    reference_id: transaction.reference_id || null,
  };

  transactions.push(newTransaction);
  return newTransaction;
}

export async function mockFetchLeaderboard(limit = 10) {
  return mockLeaderboard
    .sort((a, b) => b.aura_balance - a.aura_balance)
    .slice(0, limit);
}

export async function mockFetchUserStats(userId: string) {
  // Filter game sessions for this user
  const userSessions = gameSessions.filter(
    (session) => session.user_id === userId,
  );
  const wins = userSessions.filter((session) => session.outcome_amount > 0);

  // Find biggest win
  let biggestWin = { amount: 0, game: null };
  for (const session of wins) {
    if (session.outcome_amount > biggestWin.amount) {
      biggestWin = {
        amount: session.outcome_amount,
        game: session.game_type,
      };
    }
  }

  return {
    gamesPlayed: userSessions.length,
    wins: wins.length,
    biggestWin: biggestWin.amount,
    biggestWinGame: biggestWin.game,
    winRate: userSessions.length
      ? Math.round((wins.length / userSessions.length) * 100)
      : 0,
  };
}
