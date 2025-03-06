import { useState, useEffect } from "react";
import MainLayout from "@/components/layout/MainLayout";
import GameCardNew from "@/components/dashboard/GameCardNew";
import ActivityTable from "@/components/dashboard/ActivityTable";
import ChatTabbed from "@/components/chat/ChatTabbed";
import StatsCard from "@/components/dashboard/StatsCard";
import { useAuth } from "@/lib/auth";
import { useNavigate } from "react-router-dom";
import {
  fetchChatMessages,
  sendChatMessage,
  fetchRecentGameSessions,
  fetchUserStats,
} from "@/lib/api";
import { supabase } from "@/lib/supabase";

const Dashboard = () => {
  const { user } = useAuth();
  const navigate = useNavigate();
  const [chatMessages, setChatMessages] = useState([]);
  const [activityFeed, setActivityFeed] = useState([]);
  const [userStats, setUserStats] = useState({
    gamesPlayed: 0,
    wins: 0,
    biggestWin: 0,
    winRate: 0,
  });
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

          // Load user stats
          const stats = await fetchUserStats(user.id);
          setUserStats(stats);
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

  const games = [
    {
      name: "Crash",
      image: "https://safe.soul.lol/07oNnMxa.webp",
      isNew: false,
      path: "/games/crash",
    },
    {
      name: "Cases",
      image: "https://safe.soul.lol/KUIX52gc.webp",
      isNew: false,
      path: "/games/cases",
    },
    {
      name: "Mines",
      image: "https://safe.soul.lol/1YOQBsjy.webp",
      isNew: true,
      path: "/games/mines",
    },
    {
      name: "Blackjack",
      image: "https://safe.soul.lol/ZXpynWUF.webp",
      isNew: false,
      path: "/games/blackjack",
    },
    {
      name: "Towers",
      image: "https://safe.soul.lol/duIoAgvw.webp",
      isNew: true,
      path: "/games/towers",
    },
    {
      name: "Cups",
      image: "https://safe.soul.lol/1dkiDLON.webp",
      isNew: false,
      path: "/games/cups",
    },
    {
      name: "Plinko",
      image: "https://safe.soul.lol/LfhavqV9.webp",
      isNew: false,
      path: "/games/plinko",
    },
  ];

  if (!user) return null;

  return (
    <MainLayout title="Dashboard">
      <div className="grid grid-cols-12 gap-6">
        {/* Game Grid - 8 columns */}
        <div className="col-span-12 lg:col-span-8 space-y-6">
          <div className="bg-[#0F0F2D] rounded-xl p-6">
            <h2 className="text-xl font-bold mb-4">Popular Games</h2>
            <div className="grid grid-cols-2 md:grid-cols-3 lg:grid-cols-4 xl:grid-cols-7 gap-4">
              {games.map((game, index) => (
                <GameCardNew
                  key={index}
                  name={game.name}
                  image={game.image}
                  isNew={game.isNew}
                  onClick={() => navigate(game.path)}
                />
              ))}
            </div>
          </div>

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

        {/* Right Sidebar - 4 columns */}
        <div className="col-span-12 lg:col-span-4 space-y-6">
          {/* Chat and Leaderboard Tabs */}
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

          {/* User Stats */}
          <div className="bg-[#0F0F2D] rounded-xl p-6">
            <h2 className="text-xl font-bold mb-4">Your Stats</h2>
            <div className="grid grid-cols-2 gap-4">
              <StatsCard title="Games Played" value={userStats.gamesPlayed} />
              <StatsCard title="Win Rate" value={`${userStats.winRate}%`} />
              <StatsCard
                title="Biggest Win"
                value={userStats.biggestWin}
                color="text-yellow-400"
              />
              <StatsCard
                title="Total Profit"
                value={`+${userStats.wins * 100}`}
                color="text-green-500"
              />
            </div>
          </div>
        </div>
      </div>
    </MainLayout>
  );
};

export default Dashboard;
