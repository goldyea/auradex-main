import { useState } from "react";
import { Avatar, AvatarFallback, AvatarImage } from "../ui/avatar";
import { Button } from "../ui/button";
import { Separator } from "../ui/separator";
import {
  Tooltip,
  TooltipContent,
  TooltipProvider,
  TooltipTrigger,
} from "../ui/tooltip";
import {
  ChevronLeft,
  ChevronRight,
  Home,
  Package,
  Zap,
  Bomb,
  Grid3X3,
  Dices,
  BarChart4,
  Settings,
  LogOut,
  Trophy,
  Gamepad2,
  Ticket,
  HeadphonesIcon,
} from "lucide-react";

interface SidebarProps {
  username?: string;
  avatarUrl?: string;
  balance?: number;
  isCollapsed?: boolean;
  onToggleCollapse?: () => void;
  onLogout?: () => void;
}

const Sidebar = ({
  username = "Player1",
  avatarUrl = "https://api.dicebear.com/7.x/avataaars/svg?seed=player1",
  balance = 5000,
  isCollapsed = false,
  onToggleCollapse = () => {},
  onLogout = () => console.log("Logout clicked"),
}: SidebarProps) => {
  const [activeGame, setActiveGame] = useState("home");

  const games = [
    {
      id: "games",
      name: "Games",
      icon: <Gamepad2 className="h-5 w-5" />,
      path: "/",
    },
    {
      id: "slots",
      name: "Slots",
      icon: <Grid3X3 className="h-5 w-5" />,
      path: "/games/slots",
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
      id: "cups",
      name: "Cups",
      icon: <Dices className="h-5 w-5" />,
      path: "/games/cups",
    },
    {
      id: "plinko",
      name: "Plinko",
      icon: <Zap className="h-5 w-5" />,
      path: "/games/plinko",
    },
    {
      id: "blackjack",
      name: "Blackjack",
      icon: <Dices className="h-5 w-5" />,
      path: "/games/blackjack",
    },
    {
      id: "dice",
      name: "Dice",
      icon: <Dices className="h-5 w-5" />,
      path: "/games/dice",
    },
    {
      id: "mines",
      name: "Mines",
      icon: <Bomb className="h-5 w-5" />,
      path: "/games/mines",
    },
    {
      id: "towers",
      name: "Towers",
      icon: <BarChart4 className="h-5 w-5" />,
      path: "/games/towers",
    },
    {
      id: "daily",
      name: "Daily Lotto",
      icon: <Ticket className="h-5 w-5" />,
      path: "/daily-lotto",
    },
    {
      id: "virtual",
      name: "Virtual Sports",
      icon: <Trophy className="h-5 w-5" />,
      path: "/virtual-sports",
    },
    {
      id: "support",
      name: "Support",
      icon: <HeadphonesIcon className="h-5 w-5" />,
      path: "/support",
    },
    {
      id: "discord",
      name: "Discord",
      icon: <Dices className="h-5 w-5" />,
      path: "/discord",
    },
  ];

  return (
    <div
      className="bg-[#0F0F2D] text-white h-full flex flex-col transition-all duration-300 border-r border-[#1F1F3F]"
      style={{ width: isCollapsed ? "80px" : "180px" }}
    >
      {/* Toggle collapse button */}
      <div className="absolute -right-3 top-5">
        <Button
          variant="outline"
          size="icon"
          className="rounded-full bg-gray-800 border-gray-700 hover:bg-gray-700"
          onClick={onToggleCollapse}
        >
          {isCollapsed ? (
            <ChevronRight className="h-4 w-4" />
          ) : (
            <ChevronLeft className="h-4 w-4" />
          )}
        </Button>
      </div>

      {/* Logo */}
      <div className="p-4 flex justify-center items-center">
        {/* No logo in sidebar as requested */}
      </div>

      {/* User profile */}
      <div className={`px-4 py-3 ${isCollapsed ? "flex justify-center" : ""}`}>
        {isCollapsed ? (
          <TooltipProvider>
            <Tooltip>
              <TooltipTrigger asChild>
                <Avatar className="cursor-pointer">
                  <AvatarImage src={avatarUrl} alt={username} />
                  <AvatarFallback className="bg-yellow-500">
                    {username.substring(0, 2)}
                  </AvatarFallback>
                </Avatar>
              </TooltipTrigger>
              <TooltipContent side="right">
                <p>{username}</p>
                <p className="text-sm text-yellow-500">{balance} Coins</p>
              </TooltipContent>
            </Tooltip>
          </TooltipProvider>
        ) : (
          <div className="flex items-center space-x-3">
            <Avatar>
              <AvatarImage src={avatarUrl} alt={username} />
              <AvatarFallback className="bg-yellow-500">
                {username.substring(0, 2)}
              </AvatarFallback>
            </Avatar>
            <div>
              <p className="font-medium">{username}</p>
              <p className="text-sm text-yellow-500">{balance} Coins</p>
            </div>
          </div>
        )}
      </div>

      <Separator className="my-3 bg-[#1F1F3F]" />

      {/* Navigation */}
      <nav className="flex-1 px-2 py-4">
        <ul className="space-y-2">
          {games.map((game) => (
            <li key={game.id}>
              <TooltipProvider>
                <Tooltip>
                  <TooltipTrigger asChild>
                    <Button
                      variant={activeGame === game.id ? "secondary" : "ghost"}
                      className={`w-full justify-${isCollapsed ? "center" : "start"} ${activeGame === game.id ? "bg-[#1F1F3F] hover:bg-[#2F2F4F]" : "hover:bg-[#1F1F3F]"}`}
                      onClick={() => {
                        setActiveGame(game.id);
                        window.location.href = game.path;
                      }}
                    >
                      {game.icon}
                      {!isCollapsed && (
                        <span className="ml-3">{game.name}</span>
                      )}
                    </Button>
                  </TooltipTrigger>
                  {isCollapsed && (
                    <TooltipContent side="right">{game.name}</TooltipContent>
                  )}
                </Tooltip>
              </TooltipProvider>
            </li>
          ))}
        </ul>
      </nav>

      <div className="p-4">
        <Separator className="my-3 bg-[#1F1F3F]" />
        <TooltipProvider>
          <Tooltip>
            <TooltipTrigger asChild>
              <Button
                variant="ghost"
                className={`w-full justify-${isCollapsed ? "center" : "start"} hover:bg-[#1F1F3F]`}
                onClick={() => console.log("Settings clicked")}
              >
                <Settings className="h-5 w-5" />
                {!isCollapsed && <span className="ml-3">Settings</span>}
              </Button>
            </TooltipTrigger>
            {isCollapsed && (
              <TooltipContent side="right">Settings</TooltipContent>
            )}
          </Tooltip>
        </TooltipProvider>

        <TooltipProvider>
          <Tooltip>
            <TooltipTrigger asChild>
              <Button
                variant="ghost"
                className={`w-full justify-${isCollapsed ? "center" : "start"} hover:bg-[#1F1F3F] mt-2`}
                onClick={onLogout}
              >
                <LogOut className="h-5 w-5" />
                {!isCollapsed && <span className="ml-3">Logout</span>}
              </Button>
            </TooltipTrigger>
            {isCollapsed && (
              <TooltipContent side="right">Logout</TooltipContent>
            )}
          </Tooltip>
        </TooltipProvider>
      </div>
    </div>
  );
};

export default Sidebar;
