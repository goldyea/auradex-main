import React from "react";

interface StatsCardProps {
  title: string;
  value: string | number;
  color?: string;
}

const StatsCard = ({ title, value, color = "text-white" }: StatsCardProps) => {
  return (
    <div className="bg-[#1F1F3F] p-4 rounded-lg">
      <p className="text-gray-400 text-sm mb-1">{title}</p>
      <p className={`text-xl font-bold ${color}`}>{value}</p>
    </div>
  );
};

export default StatsCard;
