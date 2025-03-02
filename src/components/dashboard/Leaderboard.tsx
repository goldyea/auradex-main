import { useEffect, useState } from "react";
import { Card, CardContent, CardHeader, CardTitle } from "../ui/card";
import { Medal, Trophy, Award } from "lucide-react";
import { Avatar, AvatarFallback, AvatarImage } from "../ui/avatar";
import { fetchLeaderboard } from "../../lib/api";

interface LeaderboardUser {
  id: string;
  username: string;
  avatar_url: string | null;
  aura_balance: number;
}

const Leaderboard = () => {
  const [users, setUsers] = useState<LeaderboardUser[]>([]);
  const [loading, setLoading] = useState(true);

  useEffect(() => {
    const loadLeaderboard = async () => {
      try {
        const data = await fetchLeaderboard();
        setUsers(data);
      } catch (error) {
        console.error("Error loading leaderboard:", error);
      } finally {
        setLoading(false);
      }
    };

    loadLeaderboard();
  }, []);

  if (loading) {
    return (
      <Card className="bg-gray-900 border-gray-800 shadow-lg">
        <CardHeader className="pb-2">
          <CardTitle className="text-xl font-bold text-white flex items-center">
            <Trophy className="mr-2 h-5 w-5 text-yellow-400" />
            Leaderboard
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
          Leaderboard
        </CardTitle>
      </CardHeader>
      <CardContent>
        <div className="space-y-4">
          {users.slice(0, 5).map((user, index) => (
            <div
              key={user.id}
              className="flex items-center justify-between bg-gray-800 p-3 rounded-lg"
            >
              <div className="flex items-center">
                <div className="w-8 text-center">
                  {index === 0 ? (
                    <Trophy className="h-5 w-5 text-yellow-400 mx-auto" />
                  ) : index === 1 ? (
                    <Medal className="h-5 w-5 text-gray-300 mx-auto" />
                  ) : index === 2 ? (
                    <Award className="h-5 w-5 text-amber-600 mx-auto" />
                  ) : (
                    <span className="text-gray-400 font-medium">
                      {index + 1}
                    </span>
                  )}
                </div>
                <Avatar className="ml-3">
                  <AvatarImage
                    src={user.avatar_url || undefined}
                    alt={user.username}
                  />
                  <AvatarFallback className="bg-purple-700">
                    {user.username.substring(0, 2).toUpperCase()}
                  </AvatarFallback>
                </Avatar>
                <span className="ml-3 font-medium text-white">
                  {user.username}
                </span>
              </div>
              <span className="text-yellow-400 font-bold">
                {user.aura_balance.toLocaleString()} Aura
              </span>
            </div>
          ))}

          {users.length === 0 && (
            <div className="text-center py-6 text-gray-500">No users found</div>
          )}
        </div>
      </CardContent>
    </Card>
  );
};

export default Leaderboard;
