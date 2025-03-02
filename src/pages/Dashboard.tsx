import { useState, useEffect } from "react";
import Sidebar from "../components/layout/Sidebar";
import GameGrid from "../components/dashboard/GameGrid";
import ActivityFeed from "../components/dashboard/ActivityFeed";
import ChatSection from "../components/chat/ChatSection";
import UserStats from "../components/dashboard/UserStats";
import Leaderboard from "../components/dashboard/Leaderboard";
import { useAuth } from "../lib/auth";
import {
  fetchChatMessages,
  sendChatMessage,
  fetchRecentGameSessions,
} from "../lib/api";
import { supabase } from "../lib/supabase";

const Dashboard = () => {
  const { user, signOut } = useAuth();
  const [sidebarCollapsed, setSidebarCollapsed] = useState(false);

  const [chatMessages, setChatMessages] = useState([]);
  const [activityFeed, setActivityFeed] = useState([]);
  const [loading, setLoading] = useState(true);

  // Force scroll to top when component mounts
  useEffect(() => {
    window.scrollTo(0, 0);
    document.documentElement.scrollTop = 0;
    document.body.scrollTop = 0;
  }, []);

  useEffect(() => {
    const loadData = async () => {
      if (user) {
        try {
          // Load chat messages
          const messages = await fetchChatMessages();
          setChatMessages(
            messages.map((msg) => ({
              id: msg.id,
              user: {
                name: msg.users.username,
                avatar: msg.users.avatar_url,
              },
              content: msg.message,
              timestamp: new Date(msg.created_at),
            })),
          );

          // Load activity feed
          const sessions = await fetchRecentGameSessions();
          setActivityFeed(
            sessions.map((session) => ({
              id: session.id,
              username: session.users.username,
              avatar: session.users.avatar_url,
              game: session.game_type,
              betAmount: session.bet_amount,
              outcome: session.outcome_amount,
              timestamp: new Date(session.created_at).toLocaleString(),
              isHighWin: session.outcome_amount > 1000,
              isLuckyWin: session.multiplier > 5,
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
                id: data.id,
                user: {
                  name: data.users.username,
                  avatar: data.users.avatar_url,
                },
                content: data.message,
                timestamp: new Date(data.created_at),
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
                id: data.id,
                username: data.users.username,
                avatar: data.users.avatar_url,
                game: data.game_type,
                betAmount: data.bet_amount,
                outcome: data.outcome_amount,
                timestamp: new Date(data.created_at).toLocaleString(),
                isHighWin: data.outcome_amount > 1000,
                isLuckyWin: data.multiplier > 5,
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

  const handleSendMessage = async (message: string) => {
    if (user) {
      await sendChatMessage(user.id, message);
    }
  };

  if (!user) return null;

  return (
    <div className="flex h-screen w-screen overflow-hidden bg-[#070720]">
      {/* Sidebar */}
      <Sidebar
        username={user.username}
        avatarUrl={user.avatar_url}
        balance={user.aura_balance}
        isCollapsed={sidebarCollapsed}
        onToggleCollapse={() => setSidebarCollapsed(!sidebarCollapsed)}
        onLogout={signOut}
      />

      {/* Main content */}
      <div className="flex-1 overflow-auto p-4">
        <div className="mb-4 flex justify-between items-center bg-[#1F1F3F] rounded-lg p-3 sticky top-0 z-50">
          <a href="/" className="flex items-center">
            <img
              src="https://safe.soul.lol/KFAq6dNT.png"
              alt="Auradex"
              className="h-8"
            />
          </a>

          <div className="flex items-center space-x-4">
            <a href="/games" className="text-gray-300 hover:text-white">
              Games
            </a>

            <div className="flex items-center space-x-3">
              <div className="flex items-center">
                <img
                  src="https://safe.soul.lol/9VCbKHag.svg"
                  alt="Currency"
                  className="h-5 w-5 mr-1"
                />
                <span className="text-yellow-400 font-medium">
                  {user.aura_balance}
                </span>
              </div>

              <div className="relative cursor-pointer">
                <img
                  src={
                    user.avatar_url ||
                    `https://api.dicebear.com/7.x/avataaars/svg?seed=${user.username}`
                  }
                  alt={user.username}
                  className="h-8 w-8 rounded-full"
                />
              </div>
            </div>
          </div>
        </div>
        <div className="grid grid-cols-1 lg:grid-cols-3 gap-4 h-full">
          {/* Game grid and activity feed column */}
          <div className="lg:col-span-2 flex flex-col gap-10">
            {/* Game grid */}
            <GameGrid />

            {/* Activity feed */}
            {loading ? (
              <div className="bg-gray-900 rounded-xl p-8 flex justify-center items-center">
                <div className="animate-spin rounded-full h-8 w-8 border-b-2 border-purple-500"></div>
              </div>
            ) : (
              <ActivityFeed recentBets={activityFeed} />
            )}
          </div>

          {/* Chat section column */}
          <div className="lg:col-span-1 flex flex-col gap-6 h-full">
            {/* Chat section - moved to top */}
            <div className="flex-grow">
              {loading ? (
                <div className="bg-gray-900 rounded-xl p-8 flex justify-center items-center h-full">
                  <div className="animate-spin rounded-full h-8 w-8 border-b-2 border-purple-500"></div>
                </div>
              ) : (
                <ChatSection
                  messages={chatMessages}
                  onSendMessage={handleSendMessage}
                  currentUser={{
                    name: user.username,
                    avatar: user.avatar_url,
                  }}
                />
              )}
            </div>

            {/* No user stats as per request */}
          </div>
        </div>
      </div>
    </div>
  );
};

export default Dashboard;
