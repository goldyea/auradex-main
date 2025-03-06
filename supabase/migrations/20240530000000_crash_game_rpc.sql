-- Create a simple RPC function to create the crash_game table
CREATE OR REPLACE FUNCTION public.create_crash_game_table()
RETURNS BOOLEAN
LANGUAGE plpgsql
SECURITY DEFINER
AS $$
BEGIN
  -- Create the table if it doesn't exist
  CREATE TABLE IF NOT EXISTS public.crash_game (
      id UUID PRIMARY KEY DEFAULT uuid_generate_v4(),
      state TEXT NOT NULL,
      multiplier NUMERIC(10, 2) NOT NULL,
      crash_point NUMERIC(10, 2) NOT NULL,
      wait_time INTEGER NOT NULL,
      start_time TIMESTAMP WITH TIME ZONE NOT NULL,
      previous_crash_points JSONB NOT NULL,
      players JSONB NOT NULL,
      seed BIGINT NOT NULL,
      created_at TIMESTAMP WITH TIME ZONE DEFAULT now() NOT NULL
  );
  
  -- Enable realtime for the table
  BEGIN
    EXECUTE format('ALTER PUBLICATION supabase_realtime ADD TABLE %I.%I;', 'public', 'crash_game');
  EXCEPTION WHEN OTHERS THEN
    -- Publication might not exist or table might already be added
    NULL;
  END;
  
  RETURN TRUE;
END;
$$;

-- Grant access to the function
GRANT EXECUTE ON FUNCTION public.create_crash_game_table() TO anon, authenticated, service_role;
