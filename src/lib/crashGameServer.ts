import { supabase } from "./supabase";

// Game state types
export type GameState = "waiting" | "running" | "crashed";

export interface CrashGameState {
  id: string;
  state: GameState;
  multiplier: number;
  crash_point: number;
  wait_time: number;
  start_time: string;
  previous_crash_points: number[];
  players: Player[];
  seed: number;
}

export interface Player {
  id: string;
  username: string;
  avatar: string;
  betAmount: number;
  cashoutMultiplier: number | null;
}

// Initialize the Supabase table if it doesn't exist
export const initCrashGameTable = async () => {
  try {
    // Try to create the table directly
    console.log("Creating crash_game table...");

    // First try with RPC
    const { error } = await supabase.rpc("create_crash_game_table");

    if (error) {
      console.error("Error creating table with RPC:", error);

      // Fallback: Try to create the table directly with SQL
      const { error: sqlError } = await supabase
        .from("crash_game")
        .insert({
          id: "00000000-0000-0000-0000-000000000000",
          state: "waiting",
          multiplier: 1.0,
          crash_point: 2.0,
          wait_time: 7,
          start_time: new Date().toISOString(),
          previous_crash_points: [
            2.83, 2.18, 1.27, 1.23, 1.46, 1.39, 1.02, 4.59,
          ],
          players: [],
          seed: 12345,
          created_at: new Date().toISOString(),
        })
        .select();

      if (sqlError && !sqlError.message.includes("already exists")) {
        console.error("Error creating table with SQL:", sqlError);
      }
    }
  } catch (error) {
    console.error("Error initializing crash game table:", error);
  }
};

// Get the current game state
export const getCurrentGameState = async (): Promise<CrashGameState | null> => {
  try {
    const { data, error } = await supabase
      .from("crash_game")
      .select("*")
      .order("start_time", { ascending: false })
      .limit(1)
      .single();

    if (error) {
      console.error("Error getting current game state:", error);
      return null;
    }

    return data as CrashGameState;
  } catch (error) {
    console.error("Error getting current game state:", error);
    return null;
  }
};

// Create a new game
export const createNewGame = async (
  crashPoint: number,
  waitTime: number = 7,
) => {
  try {
    // Get previous crash points first
    const { data: previousGames, error: previousError } = await supabase
      .from("crash_game")
      .select("crash_point")
      .order("start_time", { ascending: false })
      .limit(8);

    if (previousError) {
      console.error("Error getting previous crash points:", previousError);
    }

    const previousCrashPoints = previousGames
      ? previousGames.map((game) => game.crash_point)
      : [2.83, 2.18, 1.27, 1.23, 1.46, 1.39, 1.02, 4.59];

    // Generate a random seed
    const seed = Math.floor(Math.random() * 1000000);

    // Create new game state
    const { data, error } = await supabase
      .from("crash_game")
      .insert({
        state: "waiting",
        multiplier: 1.0,
        crash_point: crashPoint,
        wait_time: waitTime,
        start_time: new Date().toISOString(),
        previous_crash_points: previousCrashPoints,
        players: [],
        seed: seed,
      })
      .select()
      .single();

    if (error) {
      console.error("Error creating new game:", error);
      return null;
    }

    return data;
  } catch (error) {
    console.error("Error creating new game:", error);
    return null;
  }
};

// Update game state
export const updateGameState = async (
  gameId: string,
  state: GameState,
  multiplier: number = 1.0,
) => {
  try {
    const { data, error } = await supabase
      .from("crash_game")
      .update({
        state: state,
        multiplier: multiplier,
        ...(state === "crashed" ? { crash_point: multiplier } : {}),
      })
      .eq("id", gameId)
      .select()
      .single();

    if (error) {
      console.error("Error updating game state:", error);
      return null;
    }

    return data;
  } catch (error) {
    console.error("Error updating game state:", error);
    return null;
  }
};

// Add a player to the game
export const addPlayerToGame = async (gameId: string, player: Player) => {
  try {
    // Get current players
    const { data: currentGame, error: getError } = await supabase
      .from("crash_game")
      .select("players")
      .eq("id", gameId)
      .single();

    if (getError) {
      console.error("Error getting current players:", getError);
      return null;
    }

    const currentPlayers = currentGame.players || [];
    const updatedPlayers = [...currentPlayers, player];

    // Update players
    const { data, error } = await supabase
      .from("crash_game")
      .update({ players: updatedPlayers })
      .eq("id", gameId)
      .select()
      .single();

    if (error) {
      console.error("Error adding player to game:", error);
      return null;
    }

    return data;
  } catch (error) {
    console.error("Error adding player to game:", error);
    return null;
  }
};

// Update player cashout
export const updatePlayerCashout = async (
  gameId: string,
  playerId: string,
  multiplier: number,
) => {
  try {
    // Get current players
    const { data: currentGame, error: getError } = await supabase
      .from("crash_game")
      .select("players")
      .eq("id", gameId)
      .single();

    if (getError) {
      console.error("Error getting current players:", getError);
      return null;
    }

    const currentPlayers = currentGame.players || [];
    const updatedPlayers = currentPlayers.map((player) =>
      player.id === playerId
        ? { ...player, cashoutMultiplier: multiplier }
        : player,
    );

    // Update players
    const { data, error } = await supabase
      .from("crash_game")
      .update({ players: updatedPlayers })
      .eq("id", gameId)
      .select()
      .single();

    if (error) {
      console.error("Error updating player cashout:", error);
      return null;
    }

    return data;
  } catch (error) {
    console.error("Error updating player cashout:", error);
    return null;
  }
};

// Generate a crash point (1.0 to 10.0 with exponential distribution favoring lower values)
export const generateCrashPoint = (seed: number): number => {
  // Use a deterministic algorithm based on the seed
  const hash = Math.sin(seed) * 10000;
  const positiveHash = Math.abs(hash - Math.floor(hash));

  // Generate a value between 1.0 and 10.0
  // Using a distribution that favors lower values
  return 1.0 + positiveHash * 9.0;
};

// Subscribe to game state changes
export const subscribeToGameChanges = (
  callback: (gameState: CrashGameState) => void,
) => {
  return supabase
    .channel("crash_game_changes")
    .on(
      "postgres_changes",
      { event: "*", schema: "public", table: "crash_game" },
      (payload) => {
        if (payload.new) {
          callback(payload.new as CrashGameState);
        }
      },
    )
    .subscribe();
};
