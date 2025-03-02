import { useState, useEffect, useRef } from "react";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { Progress } from "@/components/ui/progress";
import { Coins, Users, HelpCircle } from "lucide-react";
import { useAuth } from "@/lib/auth";
import { supabase } from "@/lib/supabase";
import { createGameSession } from "@/lib/api";
import { useToast } from "@/components/ui/use-toast";

interface CrashGameProps {
  onWin?: (amount: number) => void;
  onLose?: (amount: number) => void;
}

interface Player {
  id: string;
  username: string;
  avatar: string;
  betAmount: number;
  cashoutMultiplier: number | null;
}

const CrashGame = ({ onWin, onLose }: CrashGameProps) => {
  const { user } = useAuth();
  const { toast } = useToast();
  const [betAmount, setBetAmount] = useState(30);
  const [autoCashout, setAutoCashout] = useState<number | null>(null);
  const [isAutoCashoutEnabled, setIsAutoCashoutEnabled] = useState(false);
  const [gameState, setGameState] = useState<
    "waiting" | "running" | "crashed" | "cashout"
  >("waiting");
  const [currentMultiplier, setCurrentMultiplier] = useState(1.0);
  const [timeElapsed, setTimeElapsed] = useState(0);
  const [players, setPlayers] = useState<Player[]>([]);
  const [hasBet, setHasBet] = useState(false);
  const [waitingTime, setWaitingTime] = useState(7);
  const [previousCrashPoints, setPreviousCrashPoints] = useState<number[]>([]);
  const [isWaiting, setIsWaiting] = useState(false);
  const gameInterval = useRef<number | null>(null);
  const waitingInterval = useRef<number | null>(null);
  const canvasRef = useRef<HTMLCanvasElement>(null);
  const points = useRef<{ x: number; y: number }[]>([]);
  const startTime = useRef<number | null>(null);
  const crashTime = useRef(1 + Math.random() * 10); // Random crash between 1x and 11x
  const animationFrame = useRef<number | null>(null);

  // Use refs to maintain stable references to channel
  const channelRef = useRef<any>(null);
  const channelNameRef = useRef(
    `crash-game-${Math.random().toString(36).substring(2, 10)}`,
  );

  useEffect(() => {
    // Create channel only once
    if (!channelRef.current) {
      channelRef.current = supabase.channel(channelNameRef.current);

      // Set up event handlers
      channelRef.current
        .on("broadcast", { event: "game-state" }, (payload) => {
          const { state, multiplier, elapsed, waitTime, crashPoints } =
            payload.payload;
          setGameState(state);
          setCurrentMultiplier(multiplier || 1.0);
          setTimeElapsed(elapsed || 0);
          setWaitingTime(waitTime || 7);

          if (crashPoints) {
            setPreviousCrashPoints(crashPoints);
          }

          if (state === "waiting") {
            setIsWaiting(true);
            startWaitingTimer(waitTime || 7);
          } else if (state === "running") {
            setIsWaiting(false);
          } else if (state === "crashed") {
            handleGameCrash(multiplier);
          }
        })
        .on("broadcast", { event: "player-joined" }, (payload) => {
          const newPlayer = payload.payload;
          setPlayers((prev) => [...prev, newPlayer]);
        })
        .on("broadcast", { event: "player-cashout" }, (payload) => {
          const { playerId, multiplier } = payload.payload;
          setPlayers((prev) =>
            prev.map((player) =>
              player.id === playerId
                ? { ...player, cashoutMultiplier: multiplier }
                : player,
            ),
          );
        });

      // Subscribe to the channel
      try {
        channelRef.current.subscribe();
      } catch (error) {
        console.error("Error subscribing to channel:", error);
      }
    }

    // Simulate initial game state
    simulateGameState();

    // Clean up animation frame on unmount
    return () => {
      // Clean up on unmount
      if (channelRef.current) {
        try {
          channelRef.current.unsubscribe();
        } catch (error) {
          console.error("Error unsubscribing from channel:", error);
        }
      }
      if (gameInterval.current) window.clearInterval(gameInterval.current);
      if (waitingInterval.current)
        window.clearInterval(waitingInterval.current);
      if (animationFrame.current) cancelAnimationFrame(animationFrame.current);
    };
  }, []);

  // Simulate game state for demo purposes
  const simulateGameState = () => {
    // Set initial crash points
    setPreviousCrashPoints([2.83, 2.18, 1.27, 1.23, 1.46, 1.39, 1.02, 4.59]);

    // Start with waiting state
    setGameState("waiting");
    setIsWaiting(true);
    startWaitingTimer(7);
  };

  const startWaitingTimer = (seconds: number) => {
    setWaitingTime(seconds);
    if (waitingInterval.current) window.clearInterval(waitingInterval.current);

    waitingInterval.current = window.setInterval(() => {
      setWaitingTime((prev) => {
        if (prev <= 1) {
          window.clearInterval(waitingInterval.current!);
          startGame();
          return 0;
        }
        return prev - 1;
      });
    }, 1000);
  };

  const drawGraph = () => {
    const canvas = canvasRef.current;
    if (!canvas) return;
    const ctx = canvas.getContext("2d");
    if (!ctx) return;

    ctx.clearRect(0, 0, canvas.width, canvas.height);

    // Draw grid
    ctx.strokeStyle = "rgba(255, 255, 255, 0.1)";
    ctx.lineWidth = 1;

    // Vertical lines
    for (let i = 0; i <= canvas.width; i += 50) {
      ctx.beginPath();
      ctx.moveTo(i, 0);
      ctx.lineTo(i, canvas.height);
      ctx.stroke();
    }

    // Horizontal lines
    for (let i = 0; i <= canvas.height; i += 50) {
      ctx.beginPath();
      ctx.moveTo(0, i);
      ctx.lineTo(canvas.width, i);
      ctx.stroke();
    }

    // Draw crash line
    if (points.current.length > 1) {
      ctx.beginPath();
      ctx.moveTo(points.current[0].x, canvas.height - points.current[0].y);
      ctx.strokeStyle = "rgba(255, 255, 255, 0.5)";
      ctx.lineWidth = 3;

      for (let i = 1; i < points.current.length; i++) {
        ctx.lineTo(points.current[i].x, canvas.height - points.current[i].y);
      }
      ctx.stroke();
    }
  };

  const updateGraph = (timestamp: number) => {
    if (!startTime.current) startTime.current = timestamp;
    const progress = (timestamp - startTime.current) / 1000; // Convert to seconds for smoother scaling

    // Slower exponential curve
    const newMultiplier = 1 + (Math.exp(0.3 * progress) - 1) / 4;

    setCurrentMultiplier(parseFloat(newMultiplier.toFixed(2)));

    points.current.push({
      x: progress * 80, // Adjust for smoother x-axis progression
      y: (newMultiplier - 1) * 200, // Adjust y-axis scaling
    });

    drawGraph();

    // Auto cashout if enabled
    if (
      isAutoCashoutEnabled &&
      autoCashout &&
      newMultiplier >= autoCashout &&
      hasBet
    ) {
      handleCashout();
      return;
    }

    // Check if game should crash
    if (newMultiplier >= crashTime.current) {
      handleGameCrash(newMultiplier);
      return;
    }

    animationFrame.current = requestAnimationFrame(updateGraph);
  };

  const startGame = () => {
    setGameState("running");
    setIsWaiting(false);
    setCurrentMultiplier(1.0);
    setTimeElapsed(0);
    points.current = [{ x: 0, y: 0 }];
    startTime.current = null;
    crashTime.current = 1 + Math.random() * 10; // Random crash between 1x and 11x

    // Reset player cashouts for new round
    setPlayers((prev) =>
      prev.map((player) => ({ ...player, cashoutMultiplier: null })),
    );

    if (gameInterval.current) window.clearInterval(gameInterval.current);
    if (animationFrame.current) cancelAnimationFrame(animationFrame.current);

    // Start animation
    animationFrame.current = requestAnimationFrame(updateGraph);

    // Also keep the old timer for compatibility
    let gameStartTime = Date.now();
    gameInterval.current = window.setInterval(() => {
      const elapsed = (Date.now() - gameStartTime) / 1000;
      setTimeElapsed(elapsed);
    }, 100);
  };

  const handleGameCrash = (finalMultiplier: number) => {
    if (animationFrame.current) {
      cancelAnimationFrame(animationFrame.current);
      animationFrame.current = null;
    }

    setGameState("crashed");

    // Add to previous crash points
    setPreviousCrashPoints((prev) => {
      const updated = [finalMultiplier, ...prev];
      return updated.slice(0, 8); // Keep only the last 8 points
    });

    // Handle loss if player didn't cash out
    if (hasBet && !players.find((p) => p.id === user?.id)?.cashoutMultiplier) {
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
          game_data: { crashed_at: finalMultiplier },
        });
      }
    }

    // Reset for next round
    setHasBet(false);

    // Start waiting period for next game
    setTimeout(() => {
      setGameState("waiting");
      setIsWaiting(true);
      startWaitingTimer(7);
    }, 3000);
  };

  const handlePlaceBet = () => {
    if (!user || betAmount <= 0 || hasBet) return;

    setHasBet(true);

    // Add player to the game
    const newPlayer = {
      id: user.id,
      username: user.username,
      avatar:
        user.avatar_url ||
        `https://api.dicebear.com/7.x/avataaars/svg?seed=${user.username}`,
      betAmount,
      cashoutMultiplier: null,
    };

    setPlayers((prev) => [...prev, newPlayer]);

    // Broadcast to other players
    if (channelRef.current) {
      try {
        channelRef.current.send({
          type: "broadcast",
          event: "player-joined",
          payload: newPlayer,
        });
      } catch (error) {
        console.error("Error sending player-joined event:", error);
      }
    }
  };

  const handleCashout = () => {
    if (!hasBet || gameState !== "running") return;

    // Cancel animation frame if it's running
    if (animationFrame.current) {
      cancelAnimationFrame(animationFrame.current);
      animationFrame.current = null;
    }

    const winAmount = Math.floor(betAmount * currentMultiplier);
    const profit = winAmount - betAmount;

    // Update player cashout
    setPlayers((prev) =>
      prev.map((player) =>
        player.id === user?.id
          ? { ...player, cashoutMultiplier: currentMultiplier }
          : player,
      ),
    );

    // Broadcast cashout
    if (channelRef.current) {
      try {
        channelRef.current.send({
          type: "broadcast",
          event: "player-cashout",
          payload: { playerId: user?.id, multiplier: currentMultiplier },
        });
      } catch (error) {
        console.error("Error sending player-cashout event:", error);
      }
    }

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

    setGameState("cashout");
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
              (gameState === "waiting" && !isWaiting) ||
              gameState === "crashed" ||
              (hasBet && gameState !== "running") ||
              !user
            }
          >
            {hasBet && gameState === "running"
              ? `Cash Out ${formatMultiplier(currentMultiplier)}`
              : isWaiting
                ? `Join next game`
                : `Join game`}
          </Button>

          <div className="mt-6 flex items-center justify-between">
            <div className="flex items-center">
              <Users className="h-5 w-5 text-gray-400 mr-2" />
              <span className="text-gray-400">{players.length} Players</span>
            </div>
            <div className="flex items-center">
              <Coins className="h-5 w-5 text-yellow-500 mr-2" />
              <span className="text-yellow-500">0</span>
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
          <div className="relative h-96 bg-[#0F0F2D] rounded-lg border border-[#1F1F3F] flex flex-col items-center justify-center mb-6 overflow-hidden">
            {isWaiting ? (
              <div className="text-center">
                <div className="text-6xl font-bold text-white mb-4">
                  {waitingTime > 0
                    ? `0:${waitingTime.toString().padStart(2, "0")}`
                    : "0:00"}
                </div>
                <p className="text-gray-400 text-xl">
                  Waiting for next round...
                </p>
                <Progress
                  value={(waitingTime / 7) * 100}
                  className="w-64 mt-4 bg-[#1F1F3F]"
                />
              </div>
            ) : gameState === "crashed" ? (
              <div className="text-center">
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
                <div className="text-center relative z-10">
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

export default CrashGame;
