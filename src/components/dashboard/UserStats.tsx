import { useEffect, useState } from "react";
import { Card, CardContent, CardHeader, CardTitle } from "../ui/card";
import { Trophy, Dices, Percent, Award } from "lucide-react";
import { fetchUserStats } from "../../lib/api";
import { useAuth } from "../../lib/auth";

interface UserStatsProps {
  userId?: string;
}

const UserStats = ({ userId }: UserStatsProps) => {
  const { user } = useAuth();
  const [stats, setStats] = useState({
    gamesPlayed: 0,
    wins: 0,
    biggestWin: 0,
    biggestWinGame: null,
    winRate: 0,
  });
  const [loading, setLoading] = useState(true);

  useEffect(() => {
    const loadStats = async () => {
      if (user) {
        try {
          const userStats = await fetchUserStats(userId || user.id);
          setStats(userStats);
        } catch (error) {
          console.error("Error loading user stats:", error);
        } finally {
          setLoading(false);
        }
      }
    };

    loadStats();
  }, [user, userId]);

  if (loading) {
    return (
      <Card className="bg-gray-900 border-gray-800 shadow-lg">
        <CardHeader className="pb-2">
          <CardTitle className="text-xl font-bold text-white flex items-center">
            <Trophy className="mr-2 h-5 w-5 text-yellow-400" />
            Your Stats
          </CardTitle>
        </CardHeader>
        <CardContent>
          <div className="flex justify-center py-6">
            <div className="animate-spin rounded-full h-8 w-8 border-b-2 border-purple-500"></div>
          </div>
        </CardContent>
      </Card>
    );
  }

  return (
    <Card className="bg-gray-900 border-gray-800 shadow-lg">
      <CardHeader className="pb-2">
        <CardTitle className="text-xl font-bold text-white flex items-center">
          <Trophy className="mr-2 h-5 w-5 text-yellow-400" />
          Your Stats
        </CardTitle>
      </CardHeader>
      <CardContent>
        <div className="grid grid-cols-2 gap-4">
          <StatItem
            icon={<Dices className="h-5 w-5 text-purple-400" />}
            label="Games Played"
            value={stats.gamesPlayed.toString()}
          />
          <StatItem
            icon={<Award className="h-5 w-5 text-green-400" />}
            label="Wins"
            value={stats.wins.toString()}
          />
          <StatItem
            icon={<Trophy className="h-5 w-5 text-yellow-400" />}
            label="Biggest Win"
            value={`${stats.biggestWin} Aura`}
            subtext={stats.biggestWinGame || "None yet"}
          />
          <StatItem
            icon={<Percent className="h-5 w-5 text-blue-400" />}
            label="Win Rate"
            value={`${stats.winRate}%`}
          />
        </div>
      </CardContent>
    </Card>
  );
};

interface StatItemProps {
  icon: React.ReactNode;
  label: string;
  value: string;
  subtext?: string;
}

const StatItem = ({ icon, label, value, subtext }: StatItemProps) => {
  return (
    <div className="bg-gray-800 rounded-lg p-4">
      <div className="flex items-center mb-2">
        {icon}
        <span className="ml-2 text-gray-400 text-sm">{label}</span>
      </div>
      <div className="text-xl font-bold text-white">{value}</div>
      {subtext && <div className="text-xs text-gray-500 mt-1">{subtext}</div>}
    </div>
  );
};

export default UserStats;
