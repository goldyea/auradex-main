import { useState, useEffect } from "react";
import { useAuth } from "@/lib/auth";
import MainLayout from "@/components/layout/MainLayout";
import { Avatar, AvatarFallback, AvatarImage } from "@/components/ui/avatar";
import { Trophy } from "lucide-react";
import { fetchLeaderboard } from "@/lib/api";

const LeaderboardPage = () => {
  const { user } = useAuth();
  const [loading, setLoading] = useState(true);
  const [leaderboardData, setLeaderboardData] = useState([]);

  useEffect(() => {
    const loadLeaderboard = async () => {
      try {
        const data = await fetchLeaderboard(20); // Get more users for the full page
        setLeaderboardData(data);
      } catch (error) {
        console.error("Error loading leaderboard:", error);
      } finally {
        setLoading(false);
      }
    };

    loadLeaderboard();
  }, []);

  if (!user) return null;

  return (
    <MainLayout title="Leaderboard">
      <div className="grid grid-cols-12 gap-6">
        {/* Main leaderboard - takes up full width */}
        <div className="col-span-12">
          <div className="bg-[#0F0F2D] rounded-xl p-6">
            <div className="flex items-center mb-6">
              <Trophy className="h-6 w-6 text-yellow-400 mr-2" />
              <h2 className="text-xl font-bold">Global Leaderboard</h2>
            </div>

            {loading ? (
              <div className="flex justify-center py-12">
                <div className="animate-spin rounded-full h-8 w-8 border-b-2 border-purple-500"></div>
              </div>
            ) : (
              <div className="space-y-4">
                {leaderboardData.map((user, index) => (
                  <LeaderboardItem
                    key={user.id}
                    user={user}
                    position={index + 1}
                  />
                ))}

                {leaderboardData.length === 0 && (
                  <div className="text-center py-12 text-gray-500">
                    No users found
                  </div>
                )}
              </div>
            )}
          </div>
        </div>

        {/* Leaderboard info - takes up full width */}
        <div className="col-span-12 md:col-span-6">
          <div className="bg-[#0F0F2D] rounded-xl p-6">
            <h2 className="text-xl font-bold mb-4">How to Climb the Ranks</h2>
            <ul className="space-y-3 text-gray-300">
              <li className="flex items-start">
                <span className="text-purple-400 mr-2 text-lg">•</span>
                <span>Play games regularly to increase your Aura balance</span>
              </li>
              <li className="flex items-start">
                <span className="text-purple-400 mr-2 text-lg">•</span>
                <span>Try different games to find your strength</span>
              </li>
              <li className="flex items-start">
                <span className="text-purple-400 mr-2 text-lg">•</span>
                <span>Set a cashout strategy for Crash games</span>
              </li>
              <li className="flex items-start">
                <span className="text-purple-400 mr-2 text-lg">•</span>
                <span>Invite friends to earn referral bonuses</span>
              </li>
              <li className="flex items-start">
                <span className="text-purple-400 mr-2 text-lg">•</span>
                <span>Complete daily challenges for extra Aura</span>
              </li>
            </ul>
          </div>
        </div>

        {/* Leaderboard rewards - takes up half width */}
        <div className="col-span-12 md:col-span-6">
          <div className="bg-[#0F0F2D] rounded-xl p-6">
            <h2 className="text-xl font-bold mb-4">Leaderboard Rewards</h2>
            <div className="space-y-3">
              <div className="flex items-center justify-between bg-[#1F1F3F] p-3 rounded-lg border-l-4 border-yellow-400">
                <div className="flex items-center">
                  <div className="w-8 h-8 rounded-full bg-yellow-400 flex items-center justify-center text-black font-bold mr-3">
                    1
                  </div>
                  <span className="text-white">First Place</span>
                </div>
                <span className="text-yellow-400 font-bold">10,000 Aura</span>
              </div>

              <div className="flex items-center justify-between bg-[#1F1F3F] p-3 rounded-lg border-l-4 border-gray-400">
                <div className="flex items-center">
                  <div className="w-8 h-8 rounded-full bg-gray-400 flex items-center justify-center text-black font-bold mr-3">
                    2
                  </div>
                  <span className="text-white">Second Place</span>
                </div>
                <span className="text-yellow-400 font-bold">5,000 Aura</span>
              </div>

              <div className="flex items-center justify-between bg-[#1F1F3F] p-3 rounded-lg border-l-4 border-amber-700">
                <div className="flex items-center">
                  <div className="w-8 h-8 rounded-full bg-amber-700 flex items-center justify-center text-black font-bold mr-3">
                    3
                  </div>
                  <span className="text-white">Third Place</span>
                </div>
                <span className="text-yellow-400 font-bold">2,500 Aura</span>
              </div>

              <div className="flex items-center justify-between bg-[#1F1F3F] p-3 rounded-lg">
                <div className="flex items-center">
                  <div className="w-8 h-8 rounded-full bg-[#2F2F4F] flex items-center justify-center text-white font-bold mr-3">
                    4-10
                  </div>
                  <span className="text-white">Top 10</span>
                </div>
                <span className="text-yellow-400 font-bold">1,000 Aura</span>
              </div>
            </div>
          </div>
        </div>
      </div>
    </MainLayout>
  );
};

// Helper component for leaderboard items
const LeaderboardItem = ({ user, position }) => {
  const getPositionDisplay = (pos) => {
    if (pos === 1) return <Trophy className="h-6 w-6 text-yellow-400" />;
    if (pos === 2) return <Trophy className="h-6 w-6 text-gray-300" />;
    if (pos === 3) return <Trophy className="h-6 w-6 text-amber-600" />;
    return <span className="text-gray-400 font-bold">{pos}</span>;
  };

  const getRowClass = (pos) => {
    if (pos === 1) return "bg-yellow-900/20 border border-yellow-800/50";
    if (pos === 2) return "bg-gray-800/80 border border-gray-700/50";
    if (pos === 3) return "bg-amber-900/20 border border-amber-800/50";
    return "bg-[#1F1F3F] border border-[#2F2F4F]/30";
  };

  return (
    <div
      className={`flex items-center justify-between p-4 rounded-lg ${getRowClass(position)}`}
    >
      <div className="flex items-center">
        <div className="w-10 h-10 flex items-center justify-center">
          {getPositionDisplay(position)}
        </div>
        <div className="h-10 w-10 rounded-full overflow-hidden ml-3 bg-gray-700">
          <Avatar>
            <AvatarImage
              src={
                user.avatar_url ||
                `https://api.dicebear.com/7.x/avataaars/svg?seed=${user.username}`
              }
              alt={user.username}
            />
            <AvatarFallback className="bg-purple-700">
              {user.username.substring(0, 2).toUpperCase()}
            </AvatarFallback>
          </Avatar>
        </div>
        <div className="ml-4">
          <div className="font-medium text-white">{user.username}</div>
          <div className="text-xs text-gray-400">
            Member since {new Date(user.created_at).toLocaleDateString()}
          </div>
        </div>
      </div>
      <div className="text-right">
        <div className="text-yellow-400 font-bold text-xl">
          {user.aura_balance.toLocaleString()}
        </div>
        <div className="text-xs text-gray-400">Aura Balance</div>
      </div>
    </div>
  );
};

export default LeaderboardPage;
