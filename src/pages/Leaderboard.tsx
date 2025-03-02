import { useState, useEffect } from "react";
import { useAuth } from "@/lib/auth";
import Sidebar from "@/components/layout/Sidebar";
import Leaderboard from "@/components/dashboard/Leaderboard";
import UserStats from "@/components/dashboard/UserStats";
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";
import { Trophy } from "lucide-react";
import { fetchLeaderboard } from "@/lib/api";

const LeaderboardPage = () => {
  const { user, signOut } = useAuth();
  const [sidebarCollapsed, setSidebarCollapsed] = useState(false);
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
    <div className="flex h-screen w-screen overflow-hidden bg-gray-950">
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
      <div className="flex-1 overflow-auto p-6">
        <div className="mb-6">
          <h1 className="text-3xl font-bold text-white">Leaderboard</h1>
          <p className="text-gray-400">
            Top players ranked by Aura balance. Compete to reach the top!
          </p>
        </div>

        <div className="grid grid-cols-1 lg:grid-cols-3 gap-6">
          {/* Main leaderboard - takes up 2/3 of the space */}
          <div className="lg:col-span-2">
            {loading ? (
              <Card className="bg-gray-900 border-gray-800 shadow-lg">
                <CardHeader className="pb-2">
                  <CardTitle className="text-xl font-bold text-white flex items-center">
                    <Trophy className="mr-2 h-5 w-5 text-yellow-400" />
                    Global Leaderboard
                  </CardTitle>
                </CardHeader>
                <CardContent>
                  <div className="flex justify-center py-6">
                    <div className="animate-spin rounded-full h-8 w-8 border-b-2 border-purple-500"></div>
                  </div>
                </CardContent>
              </Card>
            ) : (
              <Card className="bg-gray-900 border-gray-800 shadow-lg">
                <CardHeader className="pb-2">
                  <CardTitle className="text-xl font-bold text-white flex items-center">
                    <Trophy className="mr-2 h-5 w-5 text-yellow-400" />
                    Global Leaderboard
                  </CardTitle>
                </CardHeader>
                <CardContent>
                  <div className="space-y-4">
                    {leaderboardData.map((user, index) => (
                      <LeaderboardItem
                        key={user.id}
                        user={user}
                        position={index + 1}
                      />
                    ))}

                    {leaderboardData.length === 0 && (
                      <div className="text-center py-6 text-gray-500">
                        No users found
                      </div>
                    )}
                  </div>
                </CardContent>
              </Card>
            )}
          </div>

          {/* User stats - takes up 1/3 of the space */}
          <div className="lg:col-span-1">
            <UserStats userId={user.id} />

            <Card className="bg-gray-900 border-gray-800 shadow-lg mt-6">
              <CardHeader className="pb-2">
                <CardTitle className="text-xl font-bold text-white">
                  How to Climb the Ranks
                </CardTitle>
              </CardHeader>
              <CardContent>
                <ul className="space-y-2 text-gray-300">
                  <li className="flex items-start">
                    <span className="text-purple-400 mr-2">•</span>
                    <span>
                      Play games regularly to increase your Aura balance
                    </span>
                  </li>
                  <li className="flex items-start">
                    <span className="text-purple-400 mr-2">•</span>
                    <span>Try different games to find your strength</span>
                  </li>
                  <li className="flex items-start">
                    <span className="text-purple-400 mr-2">•</span>
                    <span>Set a cashout strategy for Crash games</span>
                  </li>
                  <li className="flex items-start">
                    <span className="text-purple-400 mr-2">•</span>
                    <span>Invite friends to earn referral bonuses</span>
                  </li>
                  <li className="flex items-start">
                    <span className="text-purple-400 mr-2">•</span>
                    <span>Complete daily challenges for extra Aura</span>
                  </li>
                </ul>
              </CardContent>
            </Card>
          </div>
        </div>
      </div>
    </div>
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
    return "bg-gray-800 border border-gray-700/30";
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
          <img
            src={
              user.avatar_url ||
              `https://api.dicebear.com/7.x/avataaars/svg?seed=${user.username}`
            }
            alt={user.username}
            className="h-full w-full object-cover"
          />
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
