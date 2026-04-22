-- Simplify RLS policies - allow operations for all authenticated users
-- This relies on app-level security to enforce campaign ownership

-- Drop all existing policies
DROP POLICY IF EXISTS "Users can view campaign maps" ON maps;
DROP POLICY IF EXISTS "DMs can manage their campaign maps" ON maps;
DROP POLICY IF EXISTS "Users can manage maps of their campaigns" ON maps;
DROP POLICY IF EXISTS "Users can view map tokens" ON map_tokens;
DROP POLICY IF EXISTS "DMs can manage map tokens" ON map_tokens;
DROP POLICY IF EXISTS "Users can manage tokens in their maps" ON map_tokens;

-- Create simple permissive policies for maps
CREATE POLICY "maps_select"
  ON maps FOR SELECT
  TO authenticated
  USING (true);

CREATE POLICY "maps_insert"
  ON maps FOR INSERT
  TO authenticated
  WITH CHECK (true);

CREATE POLICY "maps_update"
  ON maps FOR UPDATE
  TO authenticated
  USING (true)
  WITH CHECK (true);

CREATE POLICY "maps_delete"
  ON maps FOR DELETE
  TO authenticated
  USING (true);

-- Create simple permissive policies for map_tokens
CREATE POLICY "map_tokens_select"
  ON map_tokens FOR SELECT
  TO authenticated
  USING (true);

CREATE POLICY "map_tokens_insert"
  ON map_tokens FOR INSERT
  TO authenticated
  WITH CHECK (true);

CREATE POLICY "map_tokens_update"
  ON map_tokens FOR UPDATE
  TO authenticated
  USING (true)
  WITH CHECK (true);

CREATE POLICY "map_tokens_delete"
  ON map_tokens FOR DELETE
  TO authenticated
  USING (true);
