export type Json =
  | string
  | number
  | boolean
  | null
  | { [key: string]: Json | undefined }
  | Json[];

export interface Database {
  public: {
    Tables: {
      users: {
        Row: {
          id: string;
          username: string;
          email: string | null;
          password_hash: string;
          aura_balance: number;
          created_at: string;
          last_login: string | null;
          avatar_url: string | null;
          is_banned: boolean;
        };
        Insert: {
          id?: string;
          username: string;
          email?: string | null;
          password_hash: string;
          aura_balance?: number;
          created_at?: string;
          last_login?: string | null;
          avatar_url?: string | null;
          is_banned?: boolean;
        };
        Update: {
          id?: string;
          username?: string;
          email?: string | null;
          password_hash?: string;
          aura_balance?: number;
          created_at?: string;
          last_login?: string | null;
          avatar_url?: string | null;
          is_banned?: boolean;
        };
      };
      game_sessions: {
        Row: {
          id: string;
          user_id: string;
          game_type: string;
          bet_amount: number;
          multiplier: number;
          outcome_amount: number;
          created_at: string;
          game_data: Json | null;
        };
        Insert: {
          id?: string;
          user_id: string;
          game_type: string;
          bet_amount: number;
          multiplier: number;
          outcome_amount: number;
          created_at?: string;
          game_data?: Json | null;
        };
        Update: {
          id?: string;
          user_id?: string;
          game_type?: string;
          bet_amount?: number;
          multiplier?: number;
          outcome_amount?: number;
          created_at?: string;
          game_data?: Json | null;
        };
      };
      chat_messages: {
        Row: {
          id: string;
          user_id: string;
          message: string;
          created_at: string;
          is_deleted: boolean;
        };
        Insert: {
          id?: string;
          user_id: string;
          message: string;
          created_at?: string;
          is_deleted?: boolean;
        };
        Update: {
          id?: string;
          user_id?: string;
          message?: string;
          created_at?: string;
          is_deleted?: boolean;
        };
      };
      user_transactions: {
        Row: {
          id: string;
          user_id: string;
          amount: number;
          transaction_type: string;
          reference_id: string | null;
          created_at: string;
        };
        Insert: {
          id?: string;
          user_id: string;
          amount: number;
          transaction_type: string;
          reference_id?: string | null;
          created_at?: string;
        };
        Update: {
          id?: string;
          user_id?: string;
          amount?: number;
          transaction_type?: string;
          reference_id?: string | null;
          created_at?: string;
        };
      };
      referrals: {
        Row: {
          id: string;
          referrer_id: string;
          referred_id: string;
          status: string;
          created_at: string;
          completed_at: string | null;
        };
        Insert: {
          id?: string;
          referrer_id: string;
          referred_id: string;
          status: string;
          created_at?: string;
          completed_at?: string | null;
        };
        Update: {
          id?: string;
          referrer_id?: string;
          referred_id?: string;
          status?: string;
          created_at?: string;
          completed_at?: string | null;
        };
      };
    };
    Views: {
      [_ in never]: never;
    };
    Functions: {
      [_ in never]: never;
    };
    Enums: {
      [_ in never]: never;
    };
  };
}
