import { useState, useEffect, useRef } from "react";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { Progress } from "@/components/ui/progress";
import { Coins, Users, HelpCircle } from "lucide-react";
import { useAuth } from "@/lib/auth";
import { createGameSession } from "@/lib/api";
import { useToast } from "@/components/ui/use-toast";
import {
  subscribeToGameChanges,
  addPlayerToGame,
  updatePlayerCashout,
  CrashGameState,
  Player,
} from "@/lib/crashGameServer";

interface CrashGameClientProps {
  onWin?: (amount: number) => void;
  onLose?: (amount: number) => void;
}

const CrashGameClient = ({ onWin, onLose }: CrashGameClientProps) => {
  const { user } = useAuth();
  const { toast } = useToast();
  const [betAmount, setBetAmount] = useState(30);
  const [autoCashout, setAutoCashout] = useState<number | null>(null);
  const [isAutoCashoutEnabled, setIsAutoCashoutEnabled] = useState(false);
  const [gameState, setGameState] = useState<
    "waiting" | "running" | "crashed" | "cashout"
  >("waiting");
  const [currentMultiplier, setCurrentMultiplier] = useState(1.0);
  const [waitingTime, setWaitingTime] = useState(7);
  const [players, setPlayers] = useState<Player[]>([]);
  const [hasBet, setHasBet] = useState(false);
  const [previousCrashPoints, setPreviousCrashPoints] = useState<number[]>([]);
  const canvasRef = useRef<HTMLCanvasElement>(null);
  const points = useRef<{ x: number; y: number }[]>([]);
  const currentGameRef = useRef<string | null>(null);
  const waitingIntervalRef = useRef<NodeJS.Timeout | null>(null);

  // Subscribe to game state changes from Supabase
  useEffect(() => {
    const subscription = subscribeToGameChanges((gameData) => {
      console.log("Received game state update:", gameData);

      // Update current game ID
      currentGameRef.current = gameData.id;

      // Update local state based on server state
      setGameState(gameData.state);
      setCurrentMultiplier(gameData.multiplier);

      // Update waiting time if in waiting state
      if (gameData.state === "waiting") {
        // Calculate remaining wait time
        const startTime = new Date(gameData.start_time).getTime();
        const elapsed = (Date.now() - startTime) / 1000;
        const remainingWait = Math.max(
          1,
          gameData.wait_time - Math.floor(elapsed),
        );

        console.log(`Waiting time calculation: ${remainingWait}s remaining`);
        setWaitingTime(remainingWait);

        // Start a local timer to count down
        if (waitingIntervalRef.current) {
          clearInterval(waitingIntervalRef.current);
        }

        waitingIntervalRef.current = setInterval(() => {
          setWaitingTime((prev) => {
            const newValue = prev - 1;
            console.log(`Countdown timer: ${newValue}s`);
            if (newValue <= 0) {
              clearInterval(waitingIntervalRef.current!);
              return 0;
            }
            return newValue;
          });
        }, 1000);

        // Reset points for the graph
        points.current = [{ x: 0, y: 0 }];
        setHasBet(false); // Reset bet status for new round
      }

      // Update players
      setPlayers(gameData.players || []);

      // Update previous crash points
      if (gameData.previous_crash_points) {
        setPreviousCrashPoints(gameData.previous_crash_points);
      }

      // Update points for graph if game is running
      if (gameData.state === "running" && gameData.multiplier > 1.0) {
        // Calculate a more accurate x-coordinate based on elapsed time
        const startTime = new Date(gameData.start_time).getTime();
        const elapsed = (Date.now() - startTime) / 1000;

        // Limit the number of points for better performance
        if (
          points.current.length === 0 ||
          gameData.multiplier -
            points.current[points.current.length - 1].y / 200 >
            0.05
        ) {
          points.current.push({
            x: elapsed * 40, // Scale factor for x-axis
            y: (gameData.multiplier - 1) * 200, // Scale factor for y-axis
          });

          // Request animation frame for smoother rendering
          requestAnimationFrame(drawGraph);
        }
      }

      // Check for auto cashout
      if (
        gameData.state === "running" &&
        isAutoCashoutEnabled &&
        autoCashout &&
        gameData.multiplier >= autoCashout &&
        hasBet &&
        !players.find((p) => p.id === user?.id)?.cashoutMultiplier
      ) {
        handleCashout();
      }

      // Check if player lost (game crashed and player didn't cash out)
      if (
        gameData.state === "crashed" &&
        hasBet &&
        !players.find((p) => p.id === user?.id)?.cashoutMultiplier
      ) {
        handleLoss(gameData.multiplier);
      }
    });

    return () => {
      subscription.unsubscribe();
      if (waitingIntervalRef.current) {
        clearInterval(waitingIntervalRef.current);
      }
    };
  }, [hasBet, isAutoCashoutEnabled, autoCashout, user, players]);

  const drawGraph = () => {
    const canvas = canvasRef.current;
    if (!canvas) return;
    const ctx = canvas.getContext("2d");
    if (!ctx) return;

    // Set canvas dimensions to match display size
    const displayWidth = canvas.clientWidth;
    const displayHeight = canvas.clientHeight;

    if (canvas.width !== displayWidth || canvas.height !== displayHeight) {
      canvas.width = displayWidth;
      canvas.height = displayHeight;
    }

    ctx.clearRect(0, 0, canvas.width, canvas.height);

    // Draw grid
    ctx.strokeStyle = "rgba(255, 255, 255, 0.1)";
    ctx.lineWidth = 1;

    // Vertical lines - fewer lines for better performance
    for (let i = 0; i <= canvas.width; i += 100) {
      ctx.beginPath();
      ctx.moveTo(i, 0);
      ctx.lineTo(i, canvas.height);
      ctx.stroke();
    }

    // Horizontal lines - fewer lines for better performance
    for (let i = 0; i <= canvas.height; i += 100) {
      ctx.beginPath();
      ctx.moveTo(0, i);
      ctx.lineTo(canvas.width, i);
      ctx.stroke();
    }

    // Draw crash line with gradient for better visibility
    if (points.current.length > 1) {
      // Create gradient
      const gradient = ctx.createLinearGradient(0, 0, canvas.width, 0);
      gradient.addColorStop(0, "rgba(255, 255, 255, 0.7)");
      gradient.addColorStop(1, "rgba(255, 215, 0, 0.7)"); // Gold color at the end

      ctx.beginPath();
      ctx.moveTo(points.current[0].x, canvas.height - points.current[0].y);
      ctx.strokeStyle = gradient;
      ctx.lineWidth = 4;

      for (let i = 1; i < points.current.length; i++) {
        ctx.lineTo(points.current[i].x, canvas.height - points.current[i].y);
      }
      ctx.stroke();

      // Add glow effect
      ctx.shadowColor = "rgba(255, 215, 0, 0.5)";
      ctx.shadowBlur = 10;
      ctx.stroke();
      ctx.shadowBlur = 0; // Reset shadow
    }
  };

  const handlePlaceBet = async () => {
    if (!user || betAmount <= 0 || hasBet || !currentGameRef.current) return;

    // Check if player is already in the game (prevent joining from multiple tabs)
    const existingPlayer = players.find((p) => p.id === user.id);
    if (existingPlayer) {
      console.log("Player already in game");
      toast({
        title: "Already in game",
        description: "You are already in this game from another tab.",
        variant: "destructive",
      });
      return;
    }

    // Immediately set local state to prevent multiple bets
    setHasBet(true);

    // Create player object
    const newPlayer = {
      id: user.id,
      username: user.username,
      avatar:
        user.avatar_url ||
        `https://api.dicebear.com/7.x/avataaars/svg?seed=${user.username}`,
      betAmount,
      cashoutMultiplier: null,
    };

    // Add player to the game in Supabase
    await addPlayerToGame(currentGameRef.current, newPlayer);
  };

  const handleCashout = async () => {
    if (!hasBet || gameState !== "running" || !user || !currentGameRef.current)
      return;

    // Check if player has already cashed out
    const playerInGame = players.find((p) => p.id === user.id);
    if (playerInGame && playerInGame.cashoutMultiplier !== null) {
      console.log("Player already cashed out");
      return;
    }

    // Prevent multiple cashouts by immediately setting local state
    setGameState("cashout");

    // Update player cashout in Supabase
    await updatePlayerCashout(
      currentGameRef.current,
      user.id,
      currentMultiplier,
    );

    const winAmount = Math.floor(betAmount * currentMultiplier);
    const profit = winAmount - betAmount;

    if (onWin) onWin(profit);

    // Show toast notification for win
    toast({
      title: "You won!",
      description: `+${profit} Coins has been added to your balance.`,
      variant: "default",
    });

    // Record win in database
    if (user) {
      createGameSession({
        user_id: user.id,
        game_type: "crash",
        bet_amount: betAmount,
        multiplier: currentMultiplier,
        outcome_amount: profit,
        game_data: { cashed_out_at: currentMultiplier },
      });
    }
  };

  const handleLoss = (crashMultiplier: number) => {
    if (onLose) onLose(betAmount);

    // Show toast notification for loss
    toast({
      title: "Game Over",
      description: `You lost ${betAmount} Coins.`,
      variant: "destructive",
    });

    // Record loss in database
    if (user) {
      createGameSession({
        user_id: user.id,
        game_type: "crash",
        bet_amount: betAmount,
        multiplier: 0,
        outcome_amount: -betAmount,
        game_data: { crashed_at: crashMultiplier },
      });
    }

    setHasBet(false);
  };

  const formatMultiplier = (value: number) => {
    return `${value.toFixed(2)}x`;
  };

  return (
    <div className="bg-[#0F0F2D] rounded-xl shadow-lg overflow-hidden w-full max-w-6xl mx-auto">
      <div className="grid grid-cols-1 lg:grid-cols-4 gap-0">
        {/* Left panel - Controls */}
        <div className="bg-[#0F0F2D] p-4 border-r border-[#1F1F3F]">
          <div className="flex justify-between mb-4">
            <Button
              variant="secondary"
              className="w-1/2 mr-2 bg-[#1F1F3F] text-white font-medium"
            >
              Manual
            </Button>
            <Button
              variant="outline"
              className="w-1/2 ml-2 text-gray-400 border-[#1F1F3F] bg-transparent"
              disabled
            >
              Auto
            </Button>
          </div>

          <div className="mb-6">
            <p className="text-gray-400 mb-2">Play amount</p>
            <div className="flex items-center">
              <div className="flex items-center bg-[#1F1F3F] rounded-l-md px-3 py-2">
                <Coins className="h-5 w-5 text-yellow-500 mr-1" />
                <span className="text-yellow-500">{betAmount}</span>
              </div>
              <Input
                type="number"
                value={betAmount}
                onChange={(e) => setBetAmount(parseInt(e.target.value) || 0)}
                className="bg-[#1F1F3F] border-[#1F1F3F] text-white"
                disabled={hasBet || gameState === "running"}
                min={1}
              />
            </div>
            <div className="grid grid-cols-2 gap-2 mt-2">
              <Button
                variant="outline"
                className="bg-[#1F1F3F] border-[#1F1F3F] text-white"
                onClick={() => setBetAmount(Math.max(1, betAmount / 2))}
                disabled={hasBet || gameState === "running"}
              >
                1/2
              </Button>
              <Button
                variant="outline"
                className="bg-[#1F1F3F] border-[#1F1F3F] text-white"
                onClick={() => setBetAmount(betAmount * 2)}
                disabled={hasBet || gameState === "running"}
              >
                2x
              </Button>
            </div>
          </div>

          <div className="mb-6">
            <p className="text-gray-400 mb-2">Auto stop (multiplier)</p>
            <div className="flex items-center gap-2 mb-2">
              <Button
                variant="outline"
                className="bg-[#1F1F3F] border-[#1F1F3F] text-white"
                onClick={() => setIsAutoCashoutEnabled(!isAutoCashoutEnabled)}
                disabled={hasBet || gameState === "running"}
              >
                Disable
              </Button>
              <Input
                type="number"
                value={autoCashout || ""}
                onChange={(e) =>
                  setAutoCashout(parseFloat(e.target.value) || null)
                }
                className="bg-[#1F1F3F] border-[#1F1F3F] text-white"
                placeholder="Set auto cashout multiplier"
                disabled={
                  !isAutoCashoutEnabled || hasBet || gameState === "running"
                }
                step="0.1"
                min="1.1"
              />
            </div>
            <div className="grid grid-cols-2 gap-2">
              <Button
                variant="outline"
                className="bg-[#1F1F3F] border-[#1F1F3F] text-white"
                onClick={() => setAutoCashout(2.0)}
                disabled={
                  !isAutoCashoutEnabled || hasBet || gameState === "running"
                }
              >
                2.00x
              </Button>
              <Button
                variant="outline"
                className="bg-[#1F1F3F] border-[#1F1F3F] text-white"
                onClick={() => setAutoCashout(10.0)}
                disabled={
                  !isAutoCashoutEnabled || hasBet || gameState === "running"
                }
              >
                10.00x
              </Button>
            </div>
          </div>

          <Button
            className="w-full py-6 text-lg font-bold bg-yellow-500 hover:bg-yellow-600 text-white"
            onClick={
              hasBet && gameState === "running" ? handleCashout : handlePlaceBet
            }
            disabled={
              (gameState === "waiting" && waitingTime <= 0) ||
              gameState === "crashed" ||
              (hasBet && gameState !== "running") ||
              !user
            }
          >
            {hasBet && gameState === "running"
              ? `Cash Out ${formatMultiplier(currentMultiplier)}`
              : gameState === "waiting"
                ? `Join next game`
                : `Join game`}
          </Button>

          <div className="mt-6 flex flex-col gap-3">
            <div className="flex items-center justify-between">
              <div className="flex items-center">
                <Users className="h-5 w-5 text-gray-400 mr-2" />
                <span className="text-gray-400">{players.length} Players</span>
              </div>
              <div className="flex items-center">
                <Coins className="h-5 w-5 text-yellow-500 mr-2" />
                <span className="text-yellow-500">0</span>
              </div>
            </div>

            {/* Current players */}
            <div className="flex flex-col gap-2 mt-2">
              <div className="text-sm text-gray-400 mb-1">Current Players:</div>
              {players
                .filter((p) => !p.cashoutMultiplier)
                .map((player, index) => (
                  <div key={player.id} className="flex items-center gap-2">
                    <img
                      src={player.avatar}
                      alt={player.username}
                      className="w-6 h-6 rounded-full"
                    />
                    <span className="text-white text-xs">
                      {player.username}
                    </span>
                    <span className="text-yellow-400 text-xs">
                      {player.betAmount}
                    </span>
                  </div>
                ))}
            </div>
          </div>
        </div>

        {/* Right panel - Game visualization */}
        <div className="lg:col-span-3 bg-[#0F0F2D] p-4">
          {/* Previous crash points */}
          <div className="flex flex-wrap gap-2 mb-4">
            {previousCrashPoints.map((point, index) => (
              <div
                key={index}
                className={`px-3 py-1 rounded-full text-sm font-medium ${point >= 2 ? "bg-yellow-500 text-white" : "bg-[#1F1F3F] text-gray-300"}`}
              >
                {point.toFixed(2)}
              </div>
            ))}
          </div>

          {/* Main game display */}
          <div className="relative h-[500px] bg-[#0F0F2D] rounded-lg border border-[#1F1F3F] flex flex-col items-center mb-6 overflow-hidden">
            {gameState === "waiting" ? (
              <div className="text-center mt-20">
                <div className="text-6xl font-bold text-white mb-4">
                  {waitingTime > 0
                    ? `0:${waitingTime.toString().padStart(2, "0")}`
                    : "0:00"}
                </div>
                <p className="text-gray-400 text-xl">
                  Waiting for next round...
                </p>
                <div className="w-64 mt-4 relative">
                  <Progress
                    value={(waitingTime / 7) * 100}
                    className="h-4 bg-[#1F1F3F]"
                  />
                  <div className="absolute top-0 left-0 w-full flex justify-between px-1 text-xs text-gray-400 mt-5">
                    <span>0s</span>
                    <span>7s</span>
                  </div>
                </div>
              </div>
            ) : gameState === "crashed" ? (
              <div className="text-center mt-20">
                <div className="text-6xl font-bold text-red-500 mb-4">
                  CRASHED
                </div>
                <p className="text-gray-400 text-xl">
                  Game crashed at {formatMultiplier(currentMultiplier)}
                </p>
              </div>
            ) : (
              <>
                <canvas
                  ref={canvasRef}
                  width="600"
                  height="300"
                  className="absolute inset-0 w-full h-full"
                />
                <div className="text-center relative z-10 mt-20">
                  <div className="text-8xl font-bold text-white mb-2">
                    {currentMultiplier.toFixed(2)}x
                  </div>
                  <p className="text-gray-400 text-xl">Current payout</p>
                </div>
              </>
            )}

            {/* Y-axis multiplier labels */}
            <div className="absolute left-4 top-0 h-full flex flex-col justify-between text-sm text-gray-500 z-10">
              <div>3.2x</div>
              <div>3.0x</div>
              <div>2.8x</div>
              <div>2.6x</div>
              <div>2.4x</div>
              <div>2.2x</div>
              <div>2.0x</div>
            </div>

            {/* X-axis time labels */}
            <div className="absolute bottom-2 left-0 w-full flex justify-between px-16 text-sm text-gray-500 z-10">
              <div>3s</div>
              <div>6s</div>
              <div>9s</div>
              <div>12s</div>
              <div>15s</div>
              <div>18s</div>
            </div>

            {/* Network status */}
            <div className="absolute top-4 right-4 flex items-center gap-4 z-10">
              <div className="flex items-center gap-2">
                <span className="text-gray-400 text-sm">Network status</span>
                <div className="w-2 h-2 rounded-full bg-green-500"></div>
              </div>
              <div className="flex items-center gap-2">
                <span className="text-gray-400 text-sm">Fairness</span>
                <button className="w-5 h-5 rounded-full bg-transparent border border-gray-600 flex items-center justify-center cursor-pointer">
                  <HelpCircle className="h-3 w-3 text-white" />
                </button>
              </div>
            </div>
          </div>

          {/* Max prize */}
          <div className="flex justify-end items-center">
            <span className="text-gray-400">Max prize</span>
            <Coins className="h-5 w-5 text-yellow-500 mx-2" />
            <span className="text-yellow-500">5,000,000</span>
          </div>
        </div>
      </div>
    </div>
  );
};

export default CrashGameClient;
