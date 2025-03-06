import React, { useState, useEffect } from "react";
import { useAuth } from "@/lib/auth";
import {
  Coins,
  Bell,
  Settings,
  Search,
  ChevronDown,
  MessageSquare,
  Users,
  Trophy,
} from "lucide-react";
import { Avatar, AvatarFallback, AvatarImage } from "@/components/ui/avatar";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { Tabs, TabsList, TabsTrigger, TabsContent } from "@/components/ui/tabs";
import { ScrollArea } from "@/components/ui/scroll-area";

const NewDashboard = () => {
  const { user, signOut } = useAuth();
  const [activeTab, setActiveTab] = useState("games");
  const [chatMessage, setChatMessage] = useState("");

  if (!user) return null;

  return (
    <div className="flex h-screen bg-[#0D0D1F] text-white overflow-hidden">
      {/* Left Sidebar */}
      <div className="w-64 bg-[#0A0A1A] border-r border-[#1F1F3F] flex flex-col">
        {/* Logo */}
        <div className="p-4 border-b border-[#1F1F3F]">
          <img
            src="https://storage.googleapis.com/tempo-public-images/figma-exports%2Fgithub%7C93087797-1741047577979-node-7%3A3-1741047576495.png"
            alt="Auradex Logo"
            className="h-10"
          />
        </div>

        {/* Navigation */}
        <div className="flex-1 py-4">
          <div className="px-4 mb-4">
            <div className="relative">
              <Search className="absolute left-3 top-2.5 h-4 w-4 text-gray-500" />
              <Input
                placeholder="Search games"
                className="pl-10 bg-[#1F1F3F] border-none text-gray-300 placeholder:text-gray-500"
              />
            </div>
          </div>

          <div className="space-y-1 px-2">
            <NavItem
              icon={<Trophy className="h-5 w-5" />}
              label="Games"
              active={activeTab === "games"}
              onClick={() => setActiveTab("games")}
            />
            <NavItem
              icon={<Coins className="h-5 w-5" />}
              label="Wallet"
              active={activeTab === "wallet"}
              onClick={() => setActiveTab("wallet")}
            />
            <NavItem
              icon={<Users className="h-5 w-5" />}
              label="Leaderboard"
              active={activeTab === "leaderboard"}
              onClick={() => setActiveTab("leaderboard")}
            />
            <NavItem
              icon={<MessageSquare className="h-5 w-5" />}
              label="Chat"
              active={activeTab === "chat"}
              onClick={() => setActiveTab("chat")}
            />
          </div>

          <div className="mt-8 px-4">
            <h3 className="text-xs font-semibold text-gray-500 uppercase tracking-wider mb-3 px-2">
              Popular Games
            </h3>
            <div className="space-y-1">
              <GameItem name="Crash" active={false} />
              <GameItem name="Mines" active={true} />
              <GameItem name="Blackjack" active={false} />
              <GameItem name="Slots" active={false} />
              <GameItem name="Plinko" active={false} />
            </div>
          </div>
        </div>

        {/* User Profile */}
        <div className="p-4 border-t border-[#1F1F3F]">
          <div className="flex items-center">
            <Avatar className="h-10 w-10 mr-3">
              <AvatarImage
                src={
                  user.avatar_url ||
                  `https://api.dicebear.com/7.x/avataaars/svg?seed=${user.username}`
                }
              />
              <AvatarFallback>
                {user.username.substring(0, 2).toUpperCase()}
              </AvatarFallback>
            </Avatar>
            <div className="flex-1">
              <p className="font-medium">{user.username}</p>
              <p className="text-sm text-yellow-400">
                {user.aura_balance} Aura
              </p>
            </div>
            <Button variant="ghost" size="icon" onClick={signOut}>
              <Settings className="h-5 w-5 text-gray-400" />
            </Button>
          </div>
        </div>
      </div>

      {/* Main Content */}
      <div className="flex-1 flex flex-col overflow-hidden">
        {/* Header */}
        <header className="h-16 bg-[#0A0A1A] border-b border-[#1F1F3F] flex items-center justify-between px-6">
          <h1 className="text-xl font-bold">Dashboard</h1>

          <div className="flex items-center space-x-4">
            <Button
              variant="outline"
              className="border-[#1F1F3F] bg-[#1F1F3F] text-white hover:bg-[#2F2F4F]"
            >
              <Coins className="h-4 w-4 mr-2 text-yellow-400" />
              Deposit
            </Button>

            <Button variant="ghost" size="icon" className="relative">
              <Bell className="h-5 w-5 text-gray-400" />
              <span className="absolute top-0 right-0 h-2 w-2 rounded-full bg-red-500"></span>
            </Button>

            <div className="flex items-center">
              <Avatar className="h-8 w-8">
                <AvatarImage
                  src={
                    user.avatar_url ||
                    `https://api.dicebear.com/7.x/avataaars/svg?seed=${user.username}`
                  }
                />
                <AvatarFallback>
                  {user.username.substring(0, 2).toUpperCase()}
                </AvatarFallback>
              </Avatar>
              <ChevronDown className="h-4 w-4 ml-2 text-gray-400" />
            </div>
          </div>
        </header>

        {/* Content Area */}
        <div className="flex-1 overflow-auto p-6">
          <div className="grid grid-cols-12 gap-6">
            {/* Game Grid - 8 columns */}
            <div className="col-span-8 space-y-6">
              <div className="bg-[#0F0F2D] rounded-xl p-6">
                <h2 className="text-xl font-bold mb-4">Popular Games</h2>
                <div className="grid grid-cols-4 gap-4">
                  {[
                    {
                      name: "Crash",
                      image: "https://safe.soul.lol/07oNnMxa.webp",
                      isNew: false,
                    },
                    {
                      name: "Mines",
                      image: "https://safe.soul.lol/1YOQBsjy.webp",
                      isNew: true,
                    },
                    {
                      name: "Blackjack",
                      image: "https://safe.soul.lol/ZXpynWUF.webp",
                      isNew: false,
                    },
                    {
                      name: "Plinko",
                      image: "https://safe.soul.lol/LfhavqV9.webp",
                      isNew: false,
                    },
                  ].map((game, index) => (
                    <div
                      key={index}
                      className="aspect-square rounded-lg overflow-hidden relative group cursor-pointer"
                    >
                      <img
                        src={game.image}
                        alt={game.name}
                        className="w-full h-full object-cover"
                      />
                      <div className="absolute inset-0 bg-gradient-to-t from-black/80 to-transparent opacity-80"></div>
                      <div className="absolute bottom-0 left-0 right-0 p-3">
                        <p className="text-white font-medium">{game.name}</p>
                      </div>
                      {game.isNew && (
                        <div className="absolute top-2 right-2">
                          <span className="bg-purple-600 text-white text-xs px-2 py-1 rounded-md">
                            NEW
                          </span>
                        </div>
                      )}
                      <div className="absolute inset-0 bg-purple-600/20 opacity-0 group-hover:opacity-100 transition-opacity flex items-center justify-center">
                        <Button className="bg-white text-purple-900 hover:bg-gray-200">
                          Play Now
                        </Button>
                      </div>
                    </div>
                  ))}
                </div>
              </div>

              <div className="bg-[#0F0F2D] rounded-xl p-6">
                <h2 className="text-xl font-bold mb-4">Live Activity</h2>
                <div className="overflow-hidden rounded-lg border border-[#1F1F3F]">
                  <table className="min-w-full divide-y divide-[#1F1F3F]">
                    <thead className="bg-[#1F1F3F]">
                      <tr>
                        <th className="px-6 py-3 text-left text-xs font-medium text-gray-400 uppercase tracking-wider">
                          User
                        </th>
                        <th className="px-6 py-3 text-left text-xs font-medium text-gray-400 uppercase tracking-wider">
                          Game
                        </th>
                        <th className="px-6 py-3 text-left text-xs font-medium text-gray-400 uppercase tracking-wider">
                          Bet
                        </th>
                        <th className="px-6 py-3 text-left text-xs font-medium text-gray-400 uppercase tracking-wider">
                          Multiplier
                        </th>
                        <th className="px-6 py-3 text-left text-xs font-medium text-gray-400 uppercase tracking-wider">
                          Payout
                        </th>
                      </tr>
                    </thead>
                    <tbody className="bg-[#0F0F2D] divide-y divide-[#1F1F3F]">
                      {[
                        {
                          user: "crypto_king",
                          game: "Crash",
                          bet: 500,
                          multiplier: 2.5,
                          payout: 1250,
                          win: true,
                        },
                        {
                          user: "lucky_charm",
                          game: "Mines",
                          bet: 200,
                          multiplier: 0,
                          payout: -200,
                          win: false,
                        },
                        {
                          user: "high_roller",
                          game: "Blackjack",
                          bet: 1000,
                          multiplier: 1.5,
                          payout: 1500,
                          win: true,
                        },
                        {
                          user: "aura_master",
                          game: "Plinko",
                          bet: 100,
                          multiplier: 3.2,
                          payout: 320,
                          win: true,
                        },
                        {
                          user: "bet_wizard",
                          game: "Crash",
                          bet: 750,
                          multiplier: 0,
                          payout: -750,
                          win: false,
                        },
                      ].map((activity, index) => (
                        <tr key={index} className="hover:bg-[#1F1F3F]/30">
                          <td className="px-6 py-4 whitespace-nowrap">
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
                          <td className="px-6 py-4 whitespace-nowrap text-sm text-gray-300">
                            {activity.game}
                          </td>
                          <td className="px-6 py-4 whitespace-nowrap text-sm text-yellow-400">
                            {activity.bet}
                          </td>
                          <td className="px-6 py-4 whitespace-nowrap text-sm text-gray-300">
                            x{activity.multiplier.toFixed(1)}
                          </td>
                          <td className="px-6 py-4 whitespace-nowrap">
                            <span
                              className={`text-sm ${activity.win ? "text-green-500" : "text-red-500"}`}
                            >
                              {activity.win ? "+" : ""}
                              {activity.payout}
                            </span>
                          </td>
                        </tr>
                      ))}
                    </tbody>
                  </table>
                </div>
              </div>
            </div>

            {/* Right Sidebar - 4 columns */}
            <div className="col-span-4 space-y-6">
              <div className="bg-[#0F0F2D] rounded-xl overflow-hidden">
                <Tabs defaultValue="chat" className="w-full">
                  <TabsList className="w-full grid grid-cols-2 bg-[#1F1F3F] rounded-none p-0">
                    <TabsTrigger
                      value="chat"
                      className="py-3 data-[state=active]:bg-[#0F0F2D] rounded-none"
                    >
                      Chat
                    </TabsTrigger>
                    <TabsTrigger
                      value="leaderboard"
                      className="py-3 data-[state=active]:bg-[#0F0F2D] rounded-none"
                    >
                      Leaderboard
                    </TabsTrigger>
                  </TabsList>

                  <TabsContent value="chat" className="m-0">
                    <div className="flex flex-col h-[400px]">
                      <ScrollArea className="flex-1 p-4">
                        <div className="space-y-4">
                          {[
                            {
                              user: "crypto_king",
                              message: "Just won 5000 on Crash! 🚀",
                              time: "5m ago",
                            },
                            {
                              user: "lucky_charm",
                              message: "Anyone playing Mines tonight?",
                              time: "10m ago",
                            },
                            {
                              user: "high_roller",
                              message: "This new UI looks amazing!",
                              time: "15m ago",
                            },
                            {
                              user: "aura_master",
                              message: "Just hit a 10x on Crash!",
                              time: "20m ago",
                            },
                            {
                              user: "bet_wizard",
                              message: "How do I deposit more Aura?",
                              time: "25m ago",
                            },
                          ].map((msg, index) => (
                            <div key={index} className="flex items-start gap-2">
                              <Avatar className="h-6 w-6 flex-shrink-0">
                                <AvatarImage
                                  src={`https://api.dicebear.com/7.x/avataaars/svg?seed=${msg.user}`}
                                />
                                <AvatarFallback>
                                  {msg.user.substring(0, 2).toUpperCase()}
                                </AvatarFallback>
                              </Avatar>
                              <div>
                                <div className="flex items-baseline gap-2">
                                  <span className="font-medium text-blue-400 text-sm">
                                    {msg.user}
                                  </span>
                                  <span className="text-xs text-gray-500">
                                    {msg.time}
                                  </span>
                                </div>
                                <p className="text-gray-300 text-sm mt-1">
                                  {msg.message}
                                </p>
                              </div>
                            </div>
                          ))}
                        </div>
                      </ScrollArea>

                      <div className="p-3 border-t border-[#1F1F3F] bg-[#1F1F3F]">
                        <div className="flex gap-2">
                          <Input
                            value={chatMessage}
                            onChange={(e) => setChatMessage(e.target.value)}
                            placeholder="Type a message..."
                            className="bg-[#2F2F4F] border-[#3F3F5F] text-white"
                          />
                          <Button className="bg-yellow-500 hover:bg-yellow-600 text-white">
                            Send
                          </Button>
                        </div>
                      </div>
                    </div>
                  </TabsContent>

                  <TabsContent
                    value="leaderboard"
                    className="m-0 p-4 h-[400px]"
                  >
                    <ScrollArea className="h-full">
                      <div className="space-y-3">
                        {[
                          { rank: 1, user: "crypto_king", balance: 50000 },
                          { rank: 2, user: "lucky_charm", balance: 45000 },
                          { rank: 3, user: "high_roller", balance: 40000 },
                          { rank: 4, user: "aura_master", balance: 35000 },
                          { rank: 5, user: "bet_wizard", balance: 30000 },
                          { rank: 6, user: "player_one", balance: 25000 },
                          { rank: 7, user: "game_master", balance: 20000 },
                          { rank: 8, user: "lucky_seven", balance: 15000 },
                          { rank: 9, user: "big_winner", balance: 10000 },
                          { rank: 10, user: "aura_champ", balance: 5000 },
                        ].map((player) => (
                          <div
                            key={player.rank}
                            className="flex items-center justify-between bg-[#1F1F3F] p-3 rounded-lg"
                          >
                            <div className="flex items-center">
                              <div className="w-6 text-center mr-3">
                                <span
                                  className={`font-bold ${player.rank <= 3 ? "text-yellow-400" : "text-gray-400"}`}
                                >
                                  {player.rank}
                                </span>
                              </div>
                              <Avatar className="h-8 w-8 mr-3">
                                <AvatarImage
                                  src={`https://api.dicebear.com/7.x/avataaars/svg?seed=${player.user}`}
                                />
                                <AvatarFallback>
                                  {player.user.substring(0, 2).toUpperCase()}
                                </AvatarFallback>
                              </Avatar>
                              <span className="text-gray-200">
                                {player.user}
                              </span>
                            </div>
                            <span className="text-yellow-400 font-medium">
                              {player.balance.toLocaleString()}
                            </span>
                          </div>
                        ))}
                      </div>
                    </ScrollArea>
                  </TabsContent>
                </Tabs>
              </div>

              <div className="bg-[#0F0F2D] rounded-xl p-6">
                <h2 className="text-xl font-bold mb-4">Your Stats</h2>
                <div className="grid grid-cols-2 gap-4">
                  <div className="bg-[#1F1F3F] p-4 rounded-lg">
                    <p className="text-gray-400 text-sm mb-1">Games Played</p>
                    <p className="text-xl font-bold">42</p>
                  </div>
                  <div className="bg-[#1F1F3F] p-4 rounded-lg">
                    <p className="text-gray-400 text-sm mb-1">Win Rate</p>
                    <p className="text-xl font-bold">58%</p>
                  </div>
                  <div className="bg-[#1F1F3F] p-4 rounded-lg">
                    <p className="text-gray-400 text-sm mb-1">Biggest Win</p>
                    <p className="text-xl font-bold text-yellow-400">5,000</p>
                  </div>
                  <div className="bg-[#1F1F3F] p-4 rounded-lg">
                    <p className="text-gray-400 text-sm mb-1">Total Profit</p>
                    <p className="text-xl font-bold text-green-500">+12,350</p>
                  </div>
                </div>
              </div>
            </div>
          </div>
        </div>
      </div>
    </div>
  );
};

// Navigation Item Component
const NavItem = ({ icon, label, active, onClick }) => {
  return (
    <button
      className={`flex items-center w-full px-3 py-2 rounded-lg text-sm ${active ? "bg-[#1F1F3F] text-white" : "text-gray-400 hover:bg-[#1F1F3F]/50 hover:text-gray-300"}`}
      onClick={onClick}
    >
      <span className="mr-3">{icon}</span>
      <span>{label}</span>
    </button>
  );
};

// Game Item Component
const GameItem = ({ name, active }) => {
  return (
    <button
      className={`flex items-center w-full px-3 py-2 rounded-lg text-sm ${active ? "bg-[#1F1F3F] text-white" : "text-gray-400 hover:bg-[#1F1F3F]/50 hover:text-gray-300"}`}
    >
      <span className="w-2 h-2 rounded-full bg-yellow-500 mr-3"></span>
      <span>{name}</span>
    </button>
  );
};

export default NewDashboard;
