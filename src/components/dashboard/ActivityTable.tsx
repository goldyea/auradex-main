import React from "react";
import { Avatar, AvatarFallback, AvatarImage } from "@/components/ui/avatar";

interface ActivityItem {
  user: string;
  game: string;
  bet: number;
  multiplier: number;
  payout: number;
  win: boolean;
  timestamp?: string;
}

interface ActivityTableProps {
  activities: ActivityItem[];
  maxHeight?: string;
}

const ActivityTable = ({
  activities,
  maxHeight = "300px",
}: ActivityTableProps) => {
  return (
    <div className="overflow-hidden rounded-lg border border-[#1F1F3F]">
      <div className="max-h-[300px] overflow-y-auto">
        <table className="min-w-full divide-y divide-[#1F1F3F]">
          <thead className="bg-[#1F1F3F]">
            <tr>
              <th className="px-6 py-3 text-left text-xs font-medium text-gray-400 uppercase tracking-wider sticky top-0 bg-[#1F1F3F] z-10">
                User
              </th>
              <th className="px-6 py-3 text-left text-xs font-medium text-gray-400 uppercase tracking-wider sticky top-0 bg-[#1F1F3F] z-10">
                Game
              </th>
              <th className="px-6 py-3 text-left text-xs font-medium text-gray-400 uppercase tracking-wider sticky top-0 bg-[#1F1F3F] z-10">
                Bet
              </th>
              <th className="px-6 py-3 text-left text-xs font-medium text-gray-400 uppercase tracking-wider sticky top-0 bg-[#1F1F3F] z-10">
                Multiplier
              </th>
              <th className="px-6 py-3 text-left text-xs font-medium text-gray-400 uppercase tracking-wider sticky top-0 bg-[#1F1F3F] z-10">
                Payout
              </th>
              <th className="px-6 py-3 text-left text-xs font-medium text-gray-400 uppercase tracking-wider sticky top-0 bg-[#1F1F3F] z-10">
                Time
              </th>
            </tr>
          </thead>
          <tbody className="bg-[#0F0F2D] divide-y divide-[#1F1F3F]">
            {activities.length === 0 ? (
              <tr>
                <td colSpan={6} className="px-6 py-4 text-center text-gray-400">
                  No activity to display
                </td>
              </tr>
            ) : (
              activities.map((activity, index) => (
                <tr key={index} className="hover:bg-[#1F1F3F]/30">
                  <td className="px-6 py-3 whitespace-nowrap">
                    <div className="flex items-center">
                      <Avatar className="h-6 w-6 mr-2">
                        <AvatarImage
                          src={`https://api.dicebear.com/7.x/avataaars/svg?seed=${activity.user}`}
                        />
                        <AvatarFallback>
                          {activity.user.substring(0, 2).toUpperCase()}
                        </AvatarFallback>
                      </Avatar>
                      <span className="text-sm text-gray-300">
                        {activity.user}
                      </span>
                    </div>
                  </td>
                  <td className="px-6 py-3 whitespace-nowrap text-sm text-gray-300">
                    {activity.game}
                  </td>
                  <td className="px-6 py-3 whitespace-nowrap text-sm text-yellow-400">
                    {activity.bet}
                  </td>
                  <td className="px-6 py-3 whitespace-nowrap text-sm text-gray-300">
                    x{activity.multiplier.toFixed(1)}
                  </td>
                  <td className="px-6 py-3 whitespace-nowrap">
                    <span
                      className={`text-sm ${activity.win ? "text-green-500" : "text-red-500"}`}
                    >
                      {activity.win ? "+" : ""}
                      {activity.payout}
                    </span>
                  </td>
                  <td className="px-6 py-3 whitespace-nowrap text-sm text-gray-400">
                    {activity.timestamp || "Just now"}
                  </td>
                </tr>
              ))
            )}
          </tbody>
        </table>
      </div>
    </div>
  );
};

export default ActivityTable;
