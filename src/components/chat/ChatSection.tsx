import { useState, useRef, useEffect } from "react";
import { ScrollArea } from "../ui/scroll-area";
import { Avatar, AvatarFallback, AvatarImage } from "../ui/avatar";
import { Button } from "../ui/button";
import { Input } from "../ui/input";
import { Send } from "lucide-react";

interface Message {
  id: string;
  user: {
    name: string;
    avatar?: string;
  };
  content: string;
  timestamp: Date;
}

interface ChatSectionProps {
  messages?: Message[];
  onSendMessage?: (message: string) => void;
  currentUser?: {
    name: string;
    avatar?: string;
  };
}

const ChatSection = ({
  messages = [
    {
      id: "1",
      user: {
        name: "JackpotKing",
        avatar: "https://api.dicebear.com/7.x/avataaars/svg?seed=JackpotKing",
      },
      content: "Just won 5000 Aura on Crash! 🚀",
      timestamp: new Date(Date.now() - 1000 * 60 * 5),
    },
    {
      id: "2",
      user: {
        name: "LuckySpinner",
        avatar: "https://api.dicebear.com/7.x/avataaars/svg?seed=LuckySpinner",
      },
      content: "Anyone playing Cases tonight?",
      timestamp: new Date(Date.now() - 1000 * 60 * 3),
    },
    {
      id: "3",
      user: {
        name: "AuraWhale",
        avatar: "https://api.dicebear.com/7.x/avataaars/svg?seed=AuraWhale",
      },
      content: "The new Mines game is awesome!",
      timestamp: new Date(Date.now() - 1000 * 60 * 1),
    },
  ],
  onSendMessage = (message: string) => console.log("Message sent:", message),
  currentUser = {
    name: "Player1",
    avatar: "https://api.dicebear.com/7.x/avataaars/svg?seed=Player1",
  },
}: ChatSectionProps) => {
  const [newMessage, setNewMessage] = useState("");
  const scrollAreaRef = useRef<HTMLDivElement>(null);
  const messagesEndRef = useRef<HTMLDivElement>(null);

  // Don't auto-scroll to bottom when new messages arrive
  // Only scroll to bottom on initial load
  useEffect(() => {
    // Initial scroll position at a reasonable point, not at the bottom
    if (scrollAreaRef.current && messagesEndRef.current) {
      const scrollContainer = scrollAreaRef.current.querySelector(
        "[data-radix-scroll-area-viewport]",
      );
      if (scrollContainer) {
        scrollContainer.scrollTop = scrollContainer.scrollHeight * 0.6;
      }
    }
  }, []);

  const handleSendMessage = () => {
    if (newMessage.trim()) {
      onSendMessage(newMessage);
      setNewMessage("");
    }
  };

  const handleKeyPress = (e: React.KeyboardEvent<HTMLInputElement>) => {
    if (e.key === "Enter") {
      handleSendMessage();
    }
  };

  const formatTime = (date: Date) => {
    const today = new Date();
    const isToday =
      date.getDate() === today.getDate() &&
      date.getMonth() === today.getMonth() &&
      date.getFullYear() === today.getFullYear();

    if (isToday) {
      return date.toLocaleTimeString([], {
        hour: "2-digit",
        minute: "2-digit",
      });
    } else {
      return `${date.toLocaleDateString([], { month: "short", day: "numeric" })} ${date.toLocaleTimeString([], { hour: "2-digit", minute: "2-digit" })}`;
    }
  };

  return (
    <div className="bg-[#0F0F2D] rounded-xl shadow-lg overflow-hidden flex flex-col h-[400px] w-full border border-[#1F1F3F]">
      <div className="bg-[#1F1F3F] p-3 border-b border-[#2F2F4F] flex justify-between items-center">
        <h2 className="text-lg font-bold text-white">Chat</h2>
        <div className="flex items-center gap-2">
          <div className="w-2 h-2 rounded-full bg-green-500"></div>
          <p className="text-gray-400 text-xs">138 online</p>
        </div>
      </div>

      <ScrollArea
        className="flex-grow p-3 h-[calc(100%-110px)]"
        ref={scrollAreaRef}
      >
        <div className="space-y-4">
          {messages.map((message) => (
            <div key={message.id} className="flex items-start gap-2 mb-3">
              <Avatar className="h-6 w-6 border border-[#2F2F4F]">
                <AvatarImage
                  src={message.user.avatar}
                  alt={message.user.name}
                />
                <AvatarFallback className="bg-[#2F2F4F] text-white text-xs">
                  {message.user.name.substring(0, 2).toUpperCase()}
                </AvatarFallback>
              </Avatar>
              <div className="flex-1">
                <div className="flex items-baseline gap-2">
                  <span className="font-medium text-blue-400 text-sm">
                    {message.user.name}
                  </span>
                  <span className="text-xs text-gray-500">
                    {formatTime(message.timestamp)}
                  </span>
                </div>
                <p className="text-gray-200 mt-1 text-sm">{message.content}</p>
              </div>
            </div>
          ))}
          {/* Empty div for scrolling to the end */}
          <div ref={messagesEndRef} />
        </div>
      </ScrollArea>

      <div className="p-3 border-t border-[#2F2F4F] bg-[#1F1F3F]">
        <div className="flex gap-2">
          <Input
            value={newMessage}
            onChange={(e) => setNewMessage(e.target.value)}
            onKeyPress={handleKeyPress}
            placeholder="Enter your message here..."
            className="bg-[#2F2F4F] border-[#3F3F5F] text-white placeholder:text-gray-400"
          />
          <Button
            onClick={handleSendMessage}
            size="icon"
            className="bg-yellow-500 hover:bg-yellow-600"
          >
            <Send className="h-4 w-4" />
          </Button>
        </div>
      </div>
    </div>
  );
};

export default ChatSection;
