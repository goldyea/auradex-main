import { useEffect, useRef } from "react";
import {
  getCurrentGameState,
  createNewGame,
  updateGameState,
  generateCrashPoint,
  CrashGameState,
  initCrashGameTable,
} from "@/lib/crashGameServer";

// This component doesn't render anything, it just manages the server-side game state
const CrashGameServerComponent = () => {
  const gameStateRef = useRef<CrashGameState | null>(null);
  const timerRef = useRef<NodeJS.Timeout | null>(null);
  const animationFrameRef = useRef<number | null>(null);
  const startTimeRef = useRef<number | null>(null);
  const isServerRef = useRef<boolean>(false);

  // Function to determine if this client should act as the server
  const checkIfServer = async () => {
    // In a real implementation, you would use a more robust method
    // For now, we'll just set a flag in localStorage
    const isServer = localStorage.getItem("crash-game-server");

    // Force this client to be the server if no server exists or if the server hasn't updated in 30 seconds
    let forceServer = false;

    if (!isServer) {
      forceServer = true;
    } else {
      // Check if the current server is still active by checking the last game state
      const currentGame = await getCurrentGameState();
      if (!currentGame) {
        forceServer = true;
      } else {
        // Check if the game state is stale (more than 30 seconds old)
        const lastUpdateTime = new Date(currentGame.start_time).getTime();
        const timeSinceUpdate = Date.now() - lastUpdateTime;
        if (timeSinceUpdate > 30000) {
          // 30 seconds
          forceServer = true;
          console.log("Taking over as server due to stale game state");
        }
      }
    }

    if (forceServer) {
      localStorage.setItem("crash-game-server", "true");
      isServerRef.current = true;
      console.log("This client is acting as the game server");

      // Initialize the game table
      await initCrashGameTable();

      // Check if there's an active game
      const currentGame = await getCurrentGameState();
      if (!currentGame || currentGame.state === "crashed") {
        // Start a new game
        startWaitingPeriod();
      } else {
        // Continue the current game
        gameStateRef.current = currentGame;
        if (currentGame.state === "waiting") {
          // Calculate remaining wait time
          const startTime = new Date(currentGame.start_time).getTime();
          const elapsed = (Date.now() - startTime) / 1000;
          const remainingWait = Math.max(
            1,
            currentGame.wait_time - Math.floor(elapsed),
          );

          if (remainingWait <= 0) {
            startGame(currentGame.id, currentGame.crash_point);
          } else {
            // Wait for the remaining time
            timerRef.current = setTimeout(() => {
              startGame(currentGame.id, currentGame.crash_point);
            }, remainingWait * 1000);
          }
        } else if (currentGame.state === "running") {
          // Continue the running game
          startTimeRef.current = new Date(currentGame.start_time).getTime();
          updateGameMultiplier(currentGame.id, currentGame.crash_point);
        }
      }
    } else {
      console.log("Another client is already acting as the game server");
    }

    // Add a cleanup handler for when the window is closed
    window.addEventListener("beforeunload", () => {
      if (isServerRef.current) {
        localStorage.removeItem("crash-game-server");
      }
    });

    // Add a periodic check to ensure server is still active
    const intervalId = setInterval(async () => {
      if (isServerRef.current) {
        // Ping to show this server is still active
        localStorage.setItem("crash-game-server-ping", Date.now().toString());
      } else {
        // Check if we need to take over as server
        const currentServer = localStorage.getItem("crash-game-server");
        const lastPing = localStorage.getItem("crash-game-server-ping");

        if (currentServer && lastPing) {
          const pingTime = parseInt(lastPing);
          const timeSincePing = Date.now() - pingTime;

          if (timeSincePing > 10000) {
            // 10 seconds
            console.log("Taking over as server due to inactive server");
            localStorage.removeItem("crash-game-server");
            checkIfServer(); // Re-check if this client should be the server
          }
        }
      }
    }, 5000); // Check every 5 seconds

    return () => clearInterval(intervalId);
  };

  // Start the waiting period before a new game
  const startWaitingPeriod = async (waitTime: number = 7) => {
    if (!isServerRef.current) return;

    console.log(`Starting waiting period: ${waitTime} seconds`);

    // Generate the crash point for the next game
    // Use a more reliable random number generation
    const seed = Math.floor(Date.now() * Math.random());
    const crashPoint = generateCrashPoint(seed);
    console.log(`Next game will crash at: ${crashPoint.toFixed(2)}x`);

    // Create a new game in Supabase
    const newGame = await createNewGame(crashPoint, waitTime);
    if (newGame) {
      gameStateRef.current = newGame;

      // Start the countdown timer
      if (timerRef.current) clearTimeout(timerRef.current);

      // Use a more precise timer that accounts for drift
      const startTime = Date.now();
      const endTime = startTime + waitTime * 1000;

      const tickTimer = () => {
        const remaining = Math.max(0, endTime - Date.now());
        if (remaining <= 50) {
          // Less than 50ms remaining
          startGame(newGame.id, crashPoint);
        } else {
          timerRef.current = setTimeout(tickTimer, Math.min(100, remaining));
        }
      };

      timerRef.current = setTimeout(tickTimer, 100);
    }
  };

  // Start a new game
  const startGame = async (gameId: string, crashPoint: number) => {
    if (!isServerRef.current) return;

    console.log("Starting new game");
    const updatedGame = await updateGameState(gameId, "running");
    if (updatedGame) {
      gameStateRef.current = updatedGame;
      startTimeRef.current = Date.now();

      // Start the animation frame to update the multiplier
      if (animationFrameRef.current)
        cancelAnimationFrame(animationFrameRef.current);
      updateGameMultiplier(gameId, crashPoint);
    }
  };

  // Update the game multiplier in real-time
  const updateGameMultiplier = (gameId: string, crashPoint: number) => {
    if (!isServerRef.current || !startTimeRef.current) return;

    const elapsed = (Date.now() - startTimeRef.current) / 1000;

    // Calculate the current multiplier using an exponential curve
    // Adjusted for smoother progression
    const multiplier = 1 + (Math.exp(0.25 * elapsed) - 1) / 4;
    const roundedMultiplier = parseFloat(multiplier.toFixed(2));

    // Update the multiplier in Supabase
    // Only update if the value has changed to reduce database load
    if (gameStateRef.current?.multiplier !== roundedMultiplier) {
      updateGameState(gameId, "running", roundedMultiplier);
    }

    // Check if the game should crash
    if (multiplier >= crashPoint) {
      handleGameCrash(gameId, roundedMultiplier);
      return;
    }

    // Continue updating (every 100ms for smoother animation)
    animationFrameRef.current = window.setTimeout(() => {
      updateGameMultiplier(gameId, crashPoint);
    }, 100) as unknown as number;
  };

  // Handle game crash
  const handleGameCrash = async (gameId: string, finalMultiplier: number) => {
    if (!isServerRef.current) return;

    console.log(`Game crashed at ${finalMultiplier.toFixed(2)}x`);

    if (animationFrameRef.current) {
      clearTimeout(animationFrameRef.current);
      animationFrameRef.current = null;
    }

    // Update the game state to crashed
    const crashedGame = await updateGameState(
      gameId,
      "crashed",
      finalMultiplier,
    );
    if (crashedGame) {
      gameStateRef.current = crashedGame;

      // Wait a few seconds before starting a new game
      setTimeout(() => {
        startWaitingPeriod();
      }, 3000);
    }
  };

  useEffect(() => {
    // Check if this client should act as the server
    checkIfServer();

    // Clean up on unmount
    return () => {
      if (timerRef.current) clearTimeout(timerRef.current);
      if (animationFrameRef.current) clearTimeout(animationFrameRef.current);
      if (isServerRef.current) {
        localStorage.removeItem("crash-game-server");
      }
    };
  }, []);

  // This component doesn't render anything
  return null;
};

export default CrashGameServerComponent;
