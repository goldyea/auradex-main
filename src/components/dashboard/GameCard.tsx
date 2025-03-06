import { ReactNode } from "react";
import { Button } from "../ui/button";
import { Play } from "lucide-react";

interface GameCardProps {
  title: string;
  icon?: React.ReactNode;
  gradient?: string;
  onClick?: () => void;
  imageUrl?: string;
  isNewRelease?: boolean;
}

const GameCard = ({
  title = "Game Title",
  icon = <Play className="h-8 w-8 text-white" />,
  gradient = "bg-gradient-to-br from-purple-500 to-blue-600",
  onClick = () => console.log(`${title} clicked`),
  imageUrl,
  isNewRelease = false,
}: GameCardProps) => {
  return (
    <div
      className="rounded-xl shadow-lg p-0 h-full w-full flex flex-col justify-between transition-transform duration-300 hover:scale-105 cursor-pointer overflow-hidden relative"
      onClick={onClick}
    >
      <div className="flex flex-col items-center text-center h-full w-full">
        {imageUrl ? (
          <img
            src={imageUrl}
            alt={title}
            className="h-full w-full object-cover"
          />
        ) : (
          <div className="h-full w-full flex items-center justify-center bg-[#1F1F3F]">
            {icon}
          </div>
        )}

        {/* Game title overlay */}
        <div className="absolute bottom-0 left-0 right-0 bg-gradient-to-t from-black/80 to-transparent p-2 text-white font-medium">
          {title}
        </div>

        {/* Tags */}
        <div className="absolute top-2 right-2 flex flex-col gap-1">
          {isNewRelease && (
            <span className="bg-purple-600 text-white text-xs px-2 py-1 rounded-md">
              NEW
            </span>
          )}
        </div>
      </div>
    </div>
  );
};

export default GameCard;
