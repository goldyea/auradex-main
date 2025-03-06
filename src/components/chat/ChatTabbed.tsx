import React, { useState } from "react";
import { Tabs, TabsList, TabsTrigger, TabsContent } from "@/components/ui/tabs";
import { ScrollArea } from "@/components/ui/scroll-area";
import { Avatar, AvatarFallback, AvatarImage } from "@/components/ui/avatar";
import { Input } from "@/components/ui/input";
import { Button } from "@/components/ui/button";

interface Message {
  user: string;
  message: string;
  time: string;
}

interface LeaderboardUser {
  rank: number;
  user: string;
  balance: number;
}

interface ChatTabbedProps {
  messages?: Message[];
  leaderboard?: LeaderboardUser[];
  onSendMessage?: (message: string) => void;
}

const ChatTabbed = ({
  messages = [
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
  ],
  leaderboard = [
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
  ],
  onSendMessage = (message: string) => console.log("Message sent:", message),
}: ChatTabbedProps) => {
  const [chatMessage, setChatMessage] = useState("");

  const handleSendMessage = () => {
    if (chatMessage.trim()) {
      onSendMessage(chatMessage);
      setChatMessage("");
    }
  };

  return (
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
                {messages.map((msg, index) => (
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
                  onKeyPress={(e) => e.key === "Enter" && handleSendMessage()}
                />
                <Button
                  className="bg-yellow-500 hover:bg-yellow-600 text-white"
                  onClick={handleSendMessage}
                >
                  Send
                </Button>
              </div>
            </div>
          </div>
        </TabsContent>

        <TabsContent value="leaderboard" className="m-0 p-4 h-[400px]">
          <ScrollArea className="h-full">
            <div className="space-y-3">
              {leaderboard.map((player) => (
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
                    <span className="text-gray-200">{player.user}</span>
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
  );
};

export default ChatTabbed;
