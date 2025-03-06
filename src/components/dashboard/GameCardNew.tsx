import React from "react";
import { Button } from "@/components/ui/button";

interface GameCardNewProps {
  name: string;
  image: string;
  isNew?: boolean;
  onClick?: () => void;
}

const GameCardNew = ({
  name,
  image,
  isNew = false,
  onClick,
}: GameCardNewProps) => {
  return (
    <div
      className="aspect-square rounded-lg overflow-hidden relative group cursor-pointer"
      onClick={onClick}
    >
      <img src={image} alt={name} className="w-full h-full object-cover" />
      <div className="absolute inset-0 bg-gradient-to-t from-black/80 to-transparent opacity-80"></div>
      <div className="absolute bottom-0 left-0 right-0 p-3">
        <p className="text-white font-medium">{name}</p>
      </div>
      {isNew && (
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
  );
};

export default GameCardNew;
