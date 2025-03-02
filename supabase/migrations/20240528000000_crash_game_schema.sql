-- Create crash_games table to store global game state
CREATE TABLE IF NOT EXISTS public.crash_games (
  id UUID PRIMARY KEY DEFAULT uuid_generate_v4(),
  state VARCHAR(20) NOT NULL DEFAULT 'waiting', -- waiting, running, crashed
  crash_point NUMERIC(10, 2) NOT NULL DEFAULT 1.0,
  started_at TIMESTAMP WITH TIME ZONE,
  crashed_at TIMESTAMP WITH TIME ZONE,
  created_at TIMESTAMP WITH TIME ZONE NOT NULL DEFAULT NOW()
);

-- Create crash_bets table to store player bets
CREATE TABLE IF NOT EXISTS public.crash_bets (
  id UUID PRIMARY KEY DEFAULT uuid_generate_v4(),
  game_id UUID NOT NULL REFERENCES public.crash_games(id),
  user_id UUID NOT NULL REFERENCES public.users(id),
  bet_amount INTEGER NOT NULL,
  cashout_multiplier NUMERIC(10, 2),
  cashout_amount INTEGER,
  created_at TIMESTAMP WITH TIME ZONE NOT NULL DEFAULT NOW(),
  cashed_out_at TIMESTAMP WITH TIME ZONE
);

-- Create RLS policies
ALTER TABLE public.crash_games ENABLE ROW LEVEL SECURITY;
ALTER TABLE public.crash_bets ENABLE ROW LEVEL SECURITY;

-- Allow anyone to read crash games
CREATE POLICY read_crash_games ON public.crash_games
  FOR SELECT USING (true);

-- Allow authenticated users to read crash bets
CREATE POLICY read_crash_bets ON public.crash_bets
  FOR SELECT USING (true);

-- Allow authenticated users to insert their own bets
CREATE POLICY insert_crash_bets ON public.crash_bets
  FOR INSERT TO authenticated WITH CHECK (auth.uid() = user_id);

-- Allow authenticated users to update their own bets (for cashout)
CREATE POLICY update_crash_bets ON public.crash_bets
  FOR UPDATE TO authenticated USING (auth.uid() = user_id);
