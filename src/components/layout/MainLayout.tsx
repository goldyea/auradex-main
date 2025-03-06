import React, { useState } from "react";
import { useAuth } from "@/lib/auth";
import { useNavigate } from "react-router-dom";
import {
  Coins,
  Bell,
  Settings,
  Search,
  ChevronDown,
  MessageSquare,
  Users,
  Trophy,
  Home,
  Gamepad2,
  Zap,
  Bomb,
  Package,
  Dices,
  BarChart4,
  LogOut,
} from "lucide-react";
import { Avatar, AvatarFallback, AvatarImage } from "@/components/ui/avatar";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";

interface MainLayoutProps {
  children: React.ReactNode;
  title?: string;
}

const MainLayout = ({ children, title = "Dashboard" }: MainLayoutProps) => {
  const { user, signOut } = useAuth();
  const navigate = useNavigate();
  const [activeGame, setActiveGame] = useState("home");

  if (!user) return null;

  const games = [
    { id: "home", name: "Home", icon: <Home className="h-5 w-5" />, path: "/" },
    {
      id: "games",
      name: "Games",
      icon: <Gamepad2 className="h-5 w-5" />,
      path: "/",
    },
    {
      id: "crash",
      name: "Crash",
      icon: <Zap className="h-5 w-5" />,
      path: "/games/crash",
    },
    {
      id: "cases",
      name: "Cases",
      icon: <Package className="h-5 w-5" />,
      path: "/games/cases",
    },
    {
      id: "mines",
      name: "Mines",
      icon: <Bomb className="h-5 w-5" />,
      path: "/games/mines",
    },
    {
      id: "blackjack",
      name: "Blackjack",
      icon: <Dices className="h-5 w-5" />,
      path: "/games/blackjack",
    },
    {
      id: "plinko",
      name: "Plinko",
      icon: <BarChart4 className="h-5 w-5" />,
      path: "/games/plinko",
    },
    {
      id: "leaderboard",
      name: "Leaderboard",
      icon: <Trophy className="h-5 w-5" />,
      path: "/leaderboard",
    },
  ];

  const handleNavigation = (path: string, id: string) => {
    setActiveGame(id);
    navigate(path);
  };

  return (
    <div className="flex h-screen bg-[#0D0D1F] text-white overflow-hidden">
      {/* Left Sidebar */}
      <div className="w-64 bg-[#0A0A1A] border-r border-[#1F1F3F] flex flex-col">
        {/* Logo */}
        <div className="p-4 border-b border-[#1F1F3F]">
          <img
            src="https://storage.googleapis.com/tempo-public-images/figma-exports%2Fgithub%7C93087797-1741047856057-node-7%3A3-1741047854577.png"
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
            {games.map((game) => (
              <button
                key={game.id}
                className={`flex items-center w-full px-3 py-2 rounded-lg text-sm ${activeGame === game.id ? "bg-[#1F1F3F] text-white" : "text-gray-400 hover:bg-[#1F1F3F]/50 hover:text-gray-300"}`}
                onClick={() => handleNavigation(game.path, game.id)}
              >
                <span className="mr-3">{game.icon}</span>
                <span>{game.name}</span>
              </button>
            ))}
          </div>

          <div className="mt-8 px-4">
            <h3 className="text-xs font-semibold text-gray-500 uppercase tracking-wider mb-3 px-2">
              Popular Games
            </h3>
            <div className="space-y-1">
              <GameItem
                name="Crash"
                active={activeGame === "crash"}
                onClick={() => handleNavigation("/games/crash", "crash")}
              />
              <GameItem
                name="Mines"
                active={activeGame === "mines"}
                onClick={() => handleNavigation("/games/mines", "mines")}
              />
              <GameItem
                name="Blackjack"
                active={activeGame === "blackjack"}
                onClick={() =>
                  handleNavigation("/games/blackjack", "blackjack")
                }
              />
              <GameItem
                name="Plinko"
                active={activeGame === "plinko"}
                onClick={() => handleNavigation("/games/plinko", "plinko")}
              />
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
              <LogOut className="h-5 w-5 text-gray-400" />
            </Button>
          </div>
        </div>
      </div>

      {/* Main Content */}
      <div className="flex-1 flex flex-col overflow-hidden">
        {/* Header */}
        <header className="h-16 bg-[#0A0A1A] border-b border-[#1F1F3F] flex items-center justify-between px-6">
          <h1 className="text-xl font-bold">{title}</h1>

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
        <div className="flex-1 overflow-auto p-6">{children}</div>
      </div>
    </div>
  );
};

// Game Item Component
const GameItem = ({ name, active, onClick }) => {
  return (
    <button
      className={`flex items-center w-full px-3 py-2 rounded-lg text-sm ${active ? "bg-[#1F1F3F] text-white" : "text-gray-400 hover:bg-[#1F1F3F]/50 hover:text-gray-300"}`}
      onClick={onClick}
    >
      <span className="w-2 h-2 rounded-full bg-yellow-500 mr-3"></span>
      <span>{name}</span>
    </button>
  );
};

export default MainLayout;
