import { useEffect } from "react";
import { supabase } from "@/lib/supabase";
import CrashGameServerComponent from "./CrashGameServerComponent";
import CrashGameClient from "./CrashGameClient";

interface CrashGameNewProps {
  onWin?: (amount: number) => void;
  onLose?: (amount: number) => void;
}

const CrashGameNew = ({ onWin, onLose }: CrashGameNewProps) => {
  // Initialize Supabase table directly
  useEffect(() => {
    const initializeTable = async () => {
      try {
        // Create the table directly
        const { error } = await supabase.rpc("create_crash_game_table");

        if (error) {
          console.error("Error creating crash game table:", error);
          // Try alternative approach if RPC fails
          await supabase.from("crash_game").select("count").limit(1);
        }
      } catch (error) {
        console.error("Error initializing table:", error);
      }
    };

    initializeTable();
  }, []);

  return (
    <>
      {/* The server component doesn't render anything */}
      <CrashGameServerComponent />

      {/* The client component renders the UI */}
      <CrashGameClient onWin={onWin} onLose={onLose} />
    </>
  );
};

export default CrashGameNew;
