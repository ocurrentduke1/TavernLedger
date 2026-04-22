import { createClient } from "@/lib/supabase";

export interface Map {
  id: string;
  campaign_id: string;
  name: string;
  description: string | null;
  image_url: string;
  grid_size: number;
  created_at: string;
  updated_at: string;
}

export interface MapToken {
  id: string;
  map_id: string;
  character_id: string | null;
  x: number;
  y: number;
  color: string;
  label: string | null;
  size: number;
  created_at: string;
}

export interface MapWithTokens extends Map {
  tokens: MapToken[];
}

export async function createMap(
  campaignId: string,
  name: string,
  description: string,
  imageUrl: string,
  gridSize: number = 70
): Promise<Map> {
  const supabase = createClient();

  const { data, error } = await supabase
    .from("maps")
    .insert({
      campaign_id: campaignId,
      name,
      description,
      image_url: imageUrl,
      grid_size: gridSize,
    })
    .select()
    .single();

  if (error) throw error;
  return data as Map;
}

export async function getMapsByCampaign(campaignId: string): Promise<Map[]> {
  const supabase = createClient();

  const { data, error } = await supabase
    .from("maps")
    .select("*")
    .eq("campaign_id", campaignId)
    .order("created_at", { ascending: false });

  if (error) throw error;
  return (data || []) as Map[];
}

export async function getMapById(mapId: string): Promise<MapWithTokens> {
  const supabase = createClient();

  const { data: mapData, error: mapError } = await supabase
    .from("maps")
    .select("*")
    .eq("id", mapId)
    .single();

  if (mapError) throw mapError;

  const { data: tokenData, error: tokenError } = await supabase
    .from("map_tokens")
    .select("*")
    .eq("map_id", mapId)
    .order("created_at", { ascending: true });

  if (tokenError) throw tokenError;

  return {
    ...(mapData as Map),
    tokens: (tokenData || []) as MapToken[],
  };
}

export async function updateMapMetadata(
  mapId: string,
  name: string,
  description: string,
  gridSize: number
): Promise<Map> {
  const supabase = createClient();

  const { data, error } = await supabase
    .from("maps")
    .update({
      name,
      description,
      grid_size: gridSize,
    })
    .eq("id", mapId)
    .select()
    .single();

  if (error) throw error;
  return data as Map;
}

export async function deleteMap(mapId: string): Promise<void> {
  const supabase = createClient();

  const { error } = await supabase
    .from("maps")
    .delete()
    .eq("id", mapId);

  if (error) throw error;
}

export async function addToken(
  mapId: string,
  x: number,
  y: number,
  color: string = "#c9a84c",
  label: string | null = null,
  characterId: string | null = null
): Promise<MapToken> {
  const supabase = createClient();

  const { data, error } = await supabase
    .from("map_tokens")
    .insert({
      map_id: mapId,
      x,
      y,
      color,
      label,
      character_id: characterId,
    })
    .select()
    .single();

  if (error) throw error;
  return data as MapToken;
}

export async function updateToken(
  tokenId: string,
  updates: Partial<MapToken>
): Promise<MapToken> {
  const supabase = createClient();

  const { data, error } = await supabase
    .from("map_tokens")
    .update(updates)
    .eq("id", tokenId)
    .select()
    .single();

  if (error) throw error;
  return data as MapToken;
}

export async function deleteToken(tokenId: string): Promise<void> {
  const supabase = createClient();

  const { error } = await supabase
    .from("map_tokens")
    .delete()
    .eq("id", tokenId);

  if (error) throw error;
}

export async function deleteAllTokens(mapId: string): Promise<void> {
  const supabase = createClient();

  const { error } = await supabase
    .from("map_tokens")
    .delete()
    .eq("map_id", mapId);

  if (error) throw error;
}
