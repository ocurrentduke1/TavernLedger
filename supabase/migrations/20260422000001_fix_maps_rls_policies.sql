-- Fix RLS policies for maps to allow inserts
-- Drop existing restrictive policies
DROP POLICY IF EXISTS "DMs can manage their campaign maps" ON maps;
DROP POLICY IF EXISTS "DMs can manage map tokens" ON map_tokens;

-- Create new policies for maps - allow insert/update/delete for authenticated users who own the campaign
CREATE POLICY "Users can manage maps of their campaigns"
  ON maps FOR ALL
  USING (
    auth.uid() IN (
      SELECT dm_id FROM campaigns WHERE id = maps.campaign_id
    )
  )
  WITH CHECK (
    auth.uid() IN (
      SELECT dm_id FROM campaigns WHERE id = campaign_id
    )
  );

-- Create new policies for map_tokens - allow all operations for users managing the campaign
CREATE POLICY "Users can manage tokens in their maps"
  ON map_tokens FOR ALL
  USING (
    auth.uid() IN (
      SELECT campaigns.dm_id
      FROM campaigns
      WHERE id = (SELECT campaign_id FROM maps WHERE id = map_tokens.map_id)
    )
  )
  WITH CHECK (
    auth.uid() IN (
      SELECT campaigns.dm_id
      FROM campaigns
      WHERE id = (SELECT campaign_id FROM maps WHERE id = map_id)
    )
  );
