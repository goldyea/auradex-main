import { useState, useEffect } from "react";
import { useAuth } from "@/lib/auth";
import MainLayout from "@/components/layout/MainLayout";
import CrashGameNew from "@/components/games/Crash/CrashGameNew";
import { supabase } from "@/lib/supabase";
import ChatTabbed from "@/components/chat/ChatTabbed";
import ActivityTable from "@/components/dashboard/ActivityTable";
import { useToast } from "@/components/ui/use-toast";
import {
  fetchChatMessages,
  sendChatMessage,
  fetchRecentGameSessions,
} from "@/lib/api";

const CrashPage = () => {
  const { user, updateUser } = useAuth();
  const { toast } = useToast();
  const [chatMessages, setChatMessages] = useState([]);
  const [activityFeed, setActivityFeed] = useState([]);
  const [loading, setLoading] = useState(true);

  useEffect(() => {
    const loadData = async () => {
      if (user) {
        try {
          // Load chat messages
          const messages = await fetchChatMessages();
          setChatMessages(
            messages.map((msg) => ({
              user: msg.users.username,
              message: msg.message,
              time: formatTimeAgo(new Date(msg.created_at)),
            })),
          );

          // Load activity feed
          const sessions = await fetchRecentGameSessions();
          setActivityFeed(
            sessions.map((session) => ({
              user: session.users.username,
              game: session.game_type,
              bet: session.bet_amount,
              multiplier: session.multiplier,
              payout: session.outcome_amount,
              win: session.outcome_amount > 0,
            })),
          );
        } catch (error) {
          console.error("Error loading data:", error);
        } finally {
          setLoading(false);
        }
      }
    };

    loadData();

    // Set up real-time subscription for new messages and game sessions
    const chatSubscription = supabase
      .channel("public:chat_messages")
      .on(
        "postgres_changes",
        { event: "INSERT", schema: "public", table: "chat_messages" },
        async (payload) => {
          // Fetch the new message with user details
          const { data } = await supabase
            .from("chat_messages")
            .select(`*, users:user_id(username, avatar_url)`)
            .eq("id", payload.new.id)
            .single();

          if (data) {
            // Add new message to the end (chronological order)
            setChatMessages((prev) => [
              ...prev,
              {
                user: data.users.username,
                message: data.message,
                time: formatTimeAgo(new Date(data.created_at)),
              },
            ]);
          }
        },
      )
      .subscribe();

    const gameSubscription = supabase
      .channel("public:game_sessions")
      .on(
        "postgres_changes",
        { event: "INSERT", schema: "public", table: "game_sessions" },
        async (payload) => {
          // Fetch the new game session with user details
          const { data } = await supabase
            .from("game_sessions")
            .select(`*, users:user_id(username, avatar_url)`)
            .eq("id", payload.new.id)
            .single();

          if (data) {
            setActivityFeed((prev) => [
              {
                user: data.users.username,
                game: data.game_type,
                bet: data.bet_amount,
                multiplier: data.multiplier,
                payout: data.outcome_amount,
                win: data.outcome_amount > 0,
              },
              ...prev.slice(0, 9),
            ]);
          }
        },
      )
      .subscribe();

    return () => {
      chatSubscription.unsubscribe();
      gameSubscription.unsubscribe();
    };
  }, [user]);

  const handleSendMessage = async (message) => {
    if (user) {
      await sendChatMessage(user.id, message);
    }
  };

  const formatTimeAgo = (date) => {
    const now = new Date();
    const diffInSeconds = Math.floor((now - date) / 1000);

    if (diffInSeconds < 60) return `${diffInSeconds}s ago`;
    if (diffInSeconds < 3600) return `${Math.floor(diffInSeconds / 60)}m ago`;
    if (diffInSeconds < 86400)
      return `${Math.floor(diffInSeconds / 3600)}h ago`;
    return `${Math.floor(diffInSeconds / 86400)}d ago`;
  };

  const handleWin = (amount: number) => {
    if (user) {
      // Update user balance in UI
      updateUser({ aura_balance: user.aura_balance + amount });

      toast({
        title: "You won!",
        description: `+${amount} Aura has been added to your balance.`,
        variant: "default",
      });
    }
  };

  const handleLoss = (amount: number) => {
    if (user) {
      // Update user balance in UI
      updateUser({ aura_balance: user.aura_balance - amount });

      toast({
        title: "Game Over",
        description: `You lost ${amount} Aura.`,
        variant: "destructive",
      });
    }
  };

  if (!user) return null;

  return (
    <MainLayout title="Crash Game">
      <div className="grid grid-cols-12 gap-6">
        <div className="col-span-12 lg:col-span-9 space-y-6">
          {/* Game area */}
          <div className="bg-[#0F0F2D] rounded-xl p-6">
            <CrashGameNew onWin={handleWin} onLose={handleLoss} />
          </div>

          {/* Activity feed */}
          <div className="bg-[#0F0F2D] rounded-xl p-6">
            <h2 className="text-xl font-bold mb-4">Live Activity</h2>
            {loading ? (
              <div className="flex justify-center py-6">
                <div className="animate-spin rounded-full h-8 w-8 border-b-2 border-purple-500"></div>
              </div>
            ) : (
              <ActivityTable activities={activityFeed} />
            )}
          </div>
        </div>

        {/* Chat section - takes up 3/12 of the space */}
        <div className="col-span-12 lg:col-span-3 space-y-6">
          {loading ? (
            <div className="bg-[#0F0F2D] rounded-xl p-6 h-[400px] flex items-center justify-center">
              <div className="animate-spin rounded-full h-8 w-8 border-b-2 border-purple-500"></div>
            </div>
          ) : (
            <ChatTabbed
              messages={chatMessages}
              onSendMessage={handleSendMessage}
            />
          )}

          {/* Game Rules */}
          <div className="bg-[#0F0F2D] rounded-xl p-6">
            <h2 className="text-xl font-bold mb-4">Game Rules</h2>
            <ul className="space-y-2 text-gray-300 text-sm">
              <li className="flex items-start">
                <span className="text-yellow-400 mr-2">•</span>
                <span>Place your bet before the round starts</span>
              </li>
              <li className="flex items-start">
                <span className="text-yellow-400 mr-2">•</span>
                <span>The multiplier increases as the game progresses</span>
              </li>
              <li className="flex items-start">
                <span className="text-yellow-400 mr-2">•</span>
                <span>Cash out before the crash to secure your winnings</span>
              </li>
              <li className="flex items-start">
                <span className="text-yellow-400 mr-2">•</span>
                <span>
                  If you don't cash out before the crash, you lose your bet
                </span>
              </li>
              <li className="flex items-start">
                <span className="text-yellow-400 mr-2">•</span>
                <span>
                  Set an auto cash-out to automatically secure your winnings
                </span>
              </li>
            </ul>
          </div>
        </div>
      </div>
    </MainLayout>
  );
};

export default CrashPage;
