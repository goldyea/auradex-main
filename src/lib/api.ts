import { supabase } from "./supabase";
import { Database } from "../types/supabase";
import { User } from "./auth";
import {
  mockFetchRecentGameSessions,
  mockCreateGameSession,
  mockFetchChatMessages,
  mockSendChatMessage,
  mockCreateTransaction,
  mockFetchLeaderboard,
  mockFetchUserStats,
} from "./mockApi";

export type GameSession = Database["public"]["Tables"]["game_sessions"]["Row"];
export type ChatMessage = Database["public"]["Tables"]["chat_messages"]["Row"];

// Game Sessions API
export async function fetchRecentGameSessions(limit = 10) {
  try {
    const { data, error } = await supabase
      .from("game_sessions")
      .select(
        `
        *,
        users:user_id(username, avatar_url)
      `,
      )
      .order("created_at", { ascending: false })
      .limit(limit);

    if (error) {
      console.error("Error fetching game sessions:", error);
      throw error;
    }
    return data || [];
  } catch (error) {
    console.error("Error fetching game sessions:", error);
    return [];
  }
}

export async function createGameSession(
  session: Omit<GameSession, "id" | "created_at">,
) {
  try {
    const { data, error } = await supabase
      .from("game_sessions")
      .insert([
        {
          ...session,
          created_at: new Date().toISOString(),
        },
      ])
      .select()
      .single();

    if (error) {
      console.error("Error creating game session:", error);
      throw error;
    }

    // Also create a transaction record
    await createTransaction({
      user_id: session.user_id,
      amount: session.outcome_amount,
      transaction_type: session.outcome_amount > 0 ? "win" : "bet",
      reference_id: data.id,
    });

    // Update user balance
    const { data: userData, error: userError } = await supabase
      .from("users")
      .select("aura_balance")
      .eq("id", session.user_id)
      .single();

    if (userError) {
      console.error("Error fetching user balance:", userError);
    }

    if (userData) {
      const { error: updateError } = await supabase
        .from("users")
        .update({
          aura_balance: userData.aura_balance + session.outcome_amount,
        })
        .eq("id", session.user_id);

      if (updateError) {
        console.error("Error updating user balance:", updateError);
      }
    }

    return data;
  } catch (error) {
    console.error("Error creating game session:", error);
    throw error;
  }
}

// Chat Messages API
export async function fetchChatMessages(limit = 20) {
  try {
    const { data, error } = await supabase
      .from("chat_messages")
      .select(
        `
        *,
        users:user_id(username, avatar_url)
      `,
      )
      .eq("is_deleted", false)
      .order("created_at", { ascending: true }) // Changed to ascending for chronological order
      .limit(limit);

    if (error) {
      console.error("Error fetching chat messages:", error);
      throw error;
    }
    return data || []; // No need to reverse since we're already getting in chronological order
  } catch (error) {
    console.error("Error fetching chat messages:", error);
    return [];
  }
}

export async function sendChatMessage(userId: string, message: string) {
  try {
    const { data, error } = await supabase
      .from("chat_messages")
      .insert([
        {
          user_id: userId,
          message,
          created_at: new Date().toISOString(),
          is_deleted: false,
        },
      ])
      .select()
      .single();

    if (error) {
      console.error("Error sending chat message:", error);
      throw error;
    }
    return data;
  } catch (error) {
    console.error("Error sending chat message:", error);
    throw error;
  }
}

// Transactions API
export async function createTransaction(transaction: {
  user_id: string;
  amount: number;
  transaction_type: string;
  reference_id?: string;
}) {
  try {
    const { data, error } = await supabase
      .from("user_transactions")
      .insert([
        {
          ...transaction,
          created_at: new Date().toISOString(),
        },
      ])
      .select()
      .single();

    if (error) {
      console.error("Error creating transaction:", error);
      throw error;
    }
    return data;
  } catch (error) {
    console.error("Error creating transaction:", error);
    throw error;
  }
}

// User API
export async function fetchLeaderboard(limit = 10) {
  try {
    const { data, error } = await supabase
      .from("users")
      .select("id, username, avatar_url, aura_balance")
      .order("aura_balance", { ascending: false })
      .limit(limit);

    if (error) {
      console.error("Error fetching leaderboard:", error);
      throw error;
    }
    return data || [];
  } catch (error) {
    console.error("Error fetching leaderboard:", error);
    return [];
  }
}

export async function fetchUserStats(userId: string) {
  try {
    // Get total games played
    const { count: gamesCount, error: gamesError } = await supabase
      .from("game_sessions")
      .select("id", { count: "exact", head: true })
      .eq("user_id", userId);

    if (gamesError) {
      console.error("Error counting games:", gamesError);
      throw gamesError;
    }

    // Get total wins
    const { count: winsCount, error: winsError } = await supabase
      .from("game_sessions")
      .select("id", { count: "exact", head: true })
      .eq("user_id", userId)
      .gt("outcome_amount", 0);

    if (winsError) {
      console.error("Error counting wins:", winsError);
      throw winsError;
    }

    // Get biggest win
    const { data: biggestWin, error: biggestWinError } = await supabase
      .from("game_sessions")
      .select("outcome_amount, game_type")
      .eq("user_id", userId)
      .gt("outcome_amount", 0)
      .order("outcome_amount", { ascending: false })
      .limit(1)
      .maybeSingle();

    if (biggestWinError && biggestWinError.code !== "PGRST116") {
      console.error("Error fetching biggest win:", biggestWinError);
      throw biggestWinError;
    }

    return {
      gamesPlayed: gamesCount || 0,
      wins: winsCount || 0,
      biggestWin: biggestWin?.outcome_amount || 0,
      biggestWinGame: biggestWin?.game_type || null,
      winRate: gamesCount ? Math.round((winsCount / gamesCount) * 100) : 0,
    };
  } catch (error) {
    console.error("Error fetching user stats:", error);
    return {
      gamesPlayed: 0,
      wins: 0,
      biggestWin: 0,
      biggestWinGame: null,
      winRate: 0,
    };
  }
}
