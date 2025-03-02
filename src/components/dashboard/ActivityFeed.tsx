import { useState } from "react";
import { Tabs, TabsContent, TabsList, TabsTrigger } from "../ui/tabs";
import { Card, CardContent, CardHeader, CardTitle } from "../ui/card";
import {
  Table,
  TableBody,
  TableCell,
  TableHead,
  TableHeader,
  TableRow,
} from "../ui/table";
import { Badge } from "../ui/badge";
import { Avatar, AvatarFallback, AvatarImage } from "../ui/avatar";
import { ArrowUp, ArrowDown, Trophy, Zap } from "lucide-react";

interface BetRecord {
  id: string;
  username: string;
  avatar: string;
  game: string;
  betAmount: number;
  outcome: number;
  timestamp: string;
  isHighWin?: boolean;
  isLuckyWin?: boolean;
  multiplier?: number;
}

interface ActivityFeedProps {
  recentBets?: BetRecord[];
}

const ActivityFeed = ({ recentBets = defaultBets }: ActivityFeedProps) => {
  const [activeFilter, setActiveFilter] = useState<"all" | "high" | "lucky">(
    "all",
  );

  const filteredBets = recentBets.filter((bet) => {
    if (activeFilter === "all") return true;
    if (activeFilter === "high") return bet.isHighWin;
    if (activeFilter === "lucky") return bet.isLuckyWin;
    return true;
  });

  return (
    <div className="w-full bg-[#0F0F2D] border border-[#1F1F3F] shadow-lg rounded-xl overflow-hidden">
      <div className="p-4 border-b border-[#1F1F3F]">
        <h2 className="text-xl font-bold text-white">Live feed</h2>
      </div>
      <div className="p-0">
        <Tabs
          defaultValue="all"
          className="w-full"
          onValueChange={(value) => setActiveFilter(value as any)}
        >
          <TabsList className="grid grid-cols-3 mb-0 bg-[#1F1F3F] p-1 mx-4 mt-2 mb-2 rounded-md">
            <TabsTrigger value="all">All Games</TabsTrigger>
            <TabsTrigger value="high">High wins</TabsTrigger>
            <TabsTrigger value="lucky">Lucky wins</TabsTrigger>
          </TabsList>

          <TabsContent value="all" className="mt-0">
            <ActivityTable bets={filteredBets} />
          </TabsContent>
          <TabsContent value="high" className="mt-0">
            <ActivityTable bets={filteredBets} />
          </TabsContent>
          <TabsContent value="lucky" className="mt-0">
            <ActivityTable bets={filteredBets} />
          </TabsContent>
        </Tabs>
      </div>
    </div>
  );
};

const ActivityTable = ({ bets }: { bets: BetRecord[] }) => {
  return (
    <div className="overflow-hidden">
      <Table>
        <TableHeader className="bg-[#1F1F3F]">
          <TableRow>
            <TableHead className="text-gray-300">Game</TableHead>
            <TableHead className="text-gray-300">Username</TableHead>
            <TableHead className="text-gray-300">Amount</TableHead>
            <TableHead className="text-gray-300">Multiplier</TableHead>
            <TableHead className="text-gray-300">Payout</TableHead>
            <TableHead className="text-gray-300 text-right pr-4">
              Time
            </TableHead>
          </TableRow>
        </TableHeader>
        <TableBody>
          {bets.length === 0 ? (
            <TableRow>
              <TableCell colSpan={6} className="text-center text-gray-400 py-8">
                No activity to display
              </TableCell>
            </TableRow>
          ) : (
            bets.map((bet) => (
              <TableRow key={bet.id} className="hover:bg-[#1F1F3F]/50">
                <TableCell>
                  <Badge
                    variant="outline"
                    className="bg-[#1F1F3F] text-gray-300 border-[#2F2F4F]"
                  >
                    {bet.game}
                  </Badge>
                </TableCell>
                <TableCell className="font-medium">
                  <div className="flex items-center gap-2">
                    <Avatar className="h-6 w-6">
                      <AvatarImage src={bet.avatar} alt={bet.username} />
                      <AvatarFallback className="bg-yellow-500 text-xs">
                        {bet.username.substring(0, 2).toUpperCase()}
                      </AvatarFallback>
                    </Avatar>
                    <span className="text-gray-200">{bet.username}</span>
                  </div>
                </TableCell>
                <TableCell>
                  <span className="text-yellow-400 font-medium">
                    {bet.betAmount}
                  </span>
                </TableCell>
                <TableCell>
                  <span className="text-gray-300">
                    {bet.multiplier ? `x${bet.multiplier.toFixed(2)}` : "x0.00"}
                  </span>
                </TableCell>
                <TableCell>
                  <OutcomeDisplay
                    outcome={bet.outcome}
                    isHighWin={bet.isHighWin}
                    isLuckyWin={bet.isLuckyWin}
                  />
                </TableCell>
                <TableCell className="text-right text-gray-400 text-sm pr-4">
                  {bet.timestamp}
                </TableCell>
              </TableRow>
            ))
          )}
        </TableBody>
      </Table>
    </div>
  );
};

const OutcomeDisplay = ({
  outcome,
  isHighWin,
  isLuckyWin,
}: {
  outcome: number;
  isHighWin?: boolean;
  isLuckyWin?: boolean;
}) => {
  const isWin = outcome > 0;

  return (
    <div className="flex items-center gap-1">
      {isWin ? (
        <>
          <span className="text-yellow-400 font-medium flex items-center">
            + {outcome}
          </span>
          {isHighWin && <Trophy className="h-4 w-4 text-amber-400" />}
          {isLuckyWin && <Zap className="h-4 w-4 text-purple-400" />}
        </>
      ) : (
        <span className="text-red-400 font-medium flex items-center">
          {outcome}
        </span>
      )}
    </div>
  );
};

// Default mock data
const defaultBets: BetRecord[] = [
  {
    id: "1",
    username: "apark05",
    avatar: "https://api.dicebear.com/7.x/avataaars/svg?seed=apark05",
    game: "Blackjack",
    betAmount: 800,
    multiplier: 0.0,
    outcome: 0,
    timestamp: "17:55 PM",
  },
  {
    id: "2",
    username: "nibla08",
    avatar: "https://api.dicebear.com/7.x/avataaars/svg?seed=nibla08",
    game: "Blackjack",
    betAmount: 320,
    multiplier: 2.0,
    outcome: 640,
    timestamp: "17:55 PM",
    isLuckyWin: true,
  },
  {
    id: "3",
    username: "Luckygambler3",
    avatar: "https://api.dicebear.com/7.x/avataaars/svg?seed=Luckygambler3",
    game: "Mines",
    betAmount: 95,
    multiplier: 0.0,
    outcome: -95,
    timestamp: "17:54 PM",
  },
  {
    id: "4",
    username: "roygever",
    avatar: "https://api.dicebear.com/7.x/avataaars/svg?seed=roygever",
    game: "Blackjack",
    betAmount: 2000,
    multiplier: 1.0,
    outcome: 2000,
    timestamp: "17:54 PM",
    isHighWin: true,
  },
  {
    id: "5",
    username: "darkcastle",
    avatar: "https://api.dicebear.com/7.x/avataaars/svg?seed=darkcastle",
    game: "Blackjack",
    betAmount: 10000,
    multiplier: 0.0,
    outcome: 0,
    timestamp: "17:54 PM",
  },
];

export default ActivityFeed;
