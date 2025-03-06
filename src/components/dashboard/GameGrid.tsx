import { ReactNode } from "react";
import GameCard from "./GameCard";
import {
  Dice5,
  Bomb,
  Rocket,
  Zap,
  Package,
  Coins,
  Gamepad2,
} from "lucide-react";

interface Game {
  id: string;
  title: string;
  icon?: React.ReactNode;
  gradient: string;
  onClick?: () => void;
  imageUrl?: string;
  isNewRelease?: boolean;
}

interface GameGridProps {
  games?: Game[];
}

const GameGrid = ({ games = defaultGames }: GameGridProps) => {
  return (
    <div className="bg-[#0F0F2D] p-6 rounded-xl w-full">
      <h2 className="text-2xl font-bold text-white mb-6">Popular games</h2>
      <div className="grid grid-cols-1 sm:grid-cols-2 md:grid-cols-3 lg:grid-cols-7 gap-4 h-full">
        {/* Popular tag */}
        <div className="absolute -mt-12 ml-32">
          <span className="bg-yellow-500 text-black text-xs px-2 py-1 rounded-md font-medium">
            POPULAR
          </span>
        </div>
        {games.map((game) => (
          <GameCard
            key={game.id}
            title={game.title}
            icon={game.icon}
            gradient={game.gradient}
            onClick={
              game.onClick ||
              (() => console.log(`Navigating to ${game.title} game`))
            }
            imageUrl={game.imageUrl}
            isNewRelease={game.isNewRelease}
          />
        ))}
      </div>
    </div>
  );
};

// Default games with different gradients and icons
const defaultGames: Game[] = [
  {
    id: "1",
    title: "Crash",
    gradient: "bg-gradient-to-br from-blue-500 to-purple-600",
    onClick: () => (window.location.href = "/games/crash"),
    imageUrl: "https://safe.soul.lol/07oNnMxa.webp",
  },
  {
    id: "2",
    title: "Cases",
    gradient: "bg-gradient-to-br from-pink-500 to-purple-600",
    imageUrl: "https://safe.soul.lol/KUIX52gc.webp",
  },
  {
    id: "3",
    title: "Mines",
    gradient: "bg-gradient-to-br from-cyan-400 to-blue-600",
    imageUrl: "https://safe.soul.lol/1YOQBsjy.webp",
    isNewRelease: true,
  },
  {
    id: "4",
    title: "Blackjack",
    gradient: "bg-gradient-to-br from-red-500 to-pink-600",
    imageUrl: "https://safe.soul.lol/ZXpynWUF.webp",
    isNewRelease: true,
  },
  {
    id: "5",
    title: "Towers",
    gradient: "bg-gradient-to-br from-purple-500 to-violet-600",
    imageUrl: "https://safe.soul.lol/duIoAgvw.webp",
    isNewRelease: true,
  },
  {
    id: "6",
    title: "Cups",
    gradient: "bg-gradient-to-br from-orange-500 to-amber-600",
    imageUrl: "https://safe.soul.lol/1dkiDLON.webp",
  },
  {
    id: "7",
    title: "Plinko",
    gradient: "bg-gradient-to-br from-orange-500 to-red-600",
    imageUrl: "https://safe.soul.lol/LfhavqV9.webp",
  },
];

export default GameGrid;
